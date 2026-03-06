import "../../styles.css";
import { firebaseAuth, firestore } from "../../lib/firebaseClient";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const root = document.querySelector("#app");
let unsubscribers = [];
let currentFamilyId = null;
let currentRole = "member";

const stopAllListeners = () => {
  unsubscribers.forEach((unsubscribe) => unsubscribe());
  unsubscribers = [];
};

const randomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const ensureMembership = async (user, familyId) => {
  const membershipRef = doc(firestore, `families/${familyId}/members/${user.uid}`);
  const snapshot = await getDoc(membershipRef);
  if (!snapshot.exists()) {
    throw new Error("You are not a member of this family.");
  }
  currentRole = snapshot.data().role ?? "member";
};

const renderShell = (user) => {
  root.innerHTML = `
    <div class="card stack">
      <div class="row space-between">
        <div>
          <h2>Cappy Firebase Prototype</h2>
          <p><span class="badge">signed in</span> ${user.email}</p>
          <p class="muted">Family linked accounts + real-time individuals + NFC tap simulation.</p>
        </div>
        <div class="row">
          <button id="logout">Sign out</button>
        </div>
      </div>

      <section class="section card-sub stack">
        <h3>Create or Join Family</h3>
        <div class="row">
          <input id="family-name" type="text" placeholder="Family name" />
          <button id="create-family">Create family</button>
        </div>
        <div class="row">
          <input id="invite-code" type="text" placeholder="Invite code" />
          <button id="join-family">Join family</button>
        </div>
        <p id="family-context" class="muted">No family selected</p>
      </section>

      <section class="section card-sub stack">
        <h3>Family Members</h3>
        <div id="members"></div>
      </section>

      <section class="section card-sub stack">
        <h3>Individuals</h3>
        <div class="row">
          <input id="individual-name" type="text" placeholder="Individual name" />
          <input id="individual-notes" type="text" placeholder="Notes" />
          <button id="add-individual">Add individual</button>
        </div>
        <div id="individuals"></div>
      </section>

      <section class="section card-sub stack">
        <h3>NFC Tags</h3>
        <div class="row">
          <input id="tag-id" type="text" placeholder="NFC UID" />
          <input id="tag-individual-id" type="text" placeholder="Individual ID" />
          <button id="save-tag">Save tag mapping</button>
        </div>
        <div class="row">
          <input id="tap-tag-id" type="text" placeholder="Tap UID" />
          <button id="simulate-tap">Simulate tap update</button>
        </div>
        <div id="tags"></div>
      </section>

      <section class="section card-sub stack">
        <h3>Recent Events</h3>
        <div id="events"></div>
      </section>
    </div>
  `;

  document.querySelector("#logout").onclick = () => signOut(firebaseAuth);
};

const bindFamily = (user, familyId) => {
  currentFamilyId = familyId;
  localStorage.setItem("cappy_firebase_family_id", familyId);

  const context = document.querySelector("#family-context");
  context.textContent = `Current family: ${familyId}`;

  stopAllListeners();

  const membersQuery = query(collection(firestore, `families/${familyId}/members`));
  unsubscribers.push(
    onSnapshot(membersQuery, (snapshot) => {
      const members = snapshot.docs.map((row) => ({ id: row.id, ...row.data() }));
      const el = document.querySelector("#members");
      el.innerHTML = members
        .map((member) => `<div class="list-row"><strong>${member.email}</strong><span class="muted">${member.role}</span></div>`)
        .join("") || `<p class="muted">No members yet.</p>`;
    })
  );

  const individualsQuery = query(collection(firestore, `families/${familyId}/individuals`));
  unsubscribers.push(
    onSnapshot(individualsQuery, (snapshot) => {
      const individuals = snapshot.docs.map((row) => ({ id: row.id, ...row.data() }));
      const el = document.querySelector("#individuals");
      el.innerHTML = individuals
        .map(
          (person) => `<div class="list-row">
            <div>
              <strong>${person.name}</strong>
              <div class="muted">${person.notes ?? ""}</div>
              <div class="muted">last tap: ${person.lastTappedAt?.toDate?.()?.toLocaleString?.() ?? "never"}</div>
              <div class="muted">id: ${person.id}</div>
            </div>
          </div>`
        )
        .join("") || `<p class="muted">No individuals yet.</p>`;
    })
  );

  const tagsQuery = query(collection(firestore, `families/${familyId}/nfcTags`));
  unsubscribers.push(
    onSnapshot(tagsQuery, (snapshot) => {
      const tags = snapshot.docs.map((row) => ({ id: row.id, ...row.data() }));
      const el = document.querySelector("#tags");
      el.innerHTML = tags
        .map((tag) => `<div class="list-row"><strong>${tag.id}</strong><span class="muted">→ ${tag.individualId}</span></div>`)
        .join("") || `<p class="muted">No tags yet.</p>`;
    })
  );

  const eventsQuery = query(collection(firestore, `families/${familyId}/events`));
  unsubscribers.push(
    onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs
        .map((row) => ({ id: row.id, ...row.data() }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        .slice(0, 12);
      const el = document.querySelector("#events");
      el.innerHTML = events
        .map(
          (event) => `<div class="list-row"><div><strong>${event.type}</strong><div class="muted">${event.message}</div></div></div>`
        )
        .join("") || `<p class="muted">No events yet.</p>`;
    })
  );

  document.querySelector("#add-individual").onclick = async () => {
    if (!currentFamilyId) return;
    const name = document.querySelector("#individual-name").value.trim();
    const notes = document.querySelector("#individual-notes").value.trim();
    if (!name) return;

    await addDoc(collection(firestore, `families/${familyId}/individuals`), {
      name,
      notes: notes || null,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(firestore, `families/${familyId}/events`), {
      type: "individual.created",
      message: `${name} added by ${user.email}`,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  document.querySelector("#save-tag").onclick = async () => {
    const tagId = document.querySelector("#tag-id").value.trim();
    const individualId = document.querySelector("#tag-individual-id").value.trim();
    if (!tagId || !individualId) return;

    await setDoc(doc(firestore, `families/${familyId}/nfcTags/${tagId}`), {
      individualId,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    });

    await addDoc(collection(firestore, `families/${familyId}/events`), {
      type: "nfc.mapped",
      message: `Tag ${tagId} linked to ${individualId}`,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  document.querySelector("#simulate-tap").onclick = async () => {
    const tappedUid = document.querySelector("#tap-tag-id").value.trim();
    if (!tappedUid) return;

    const tagRef = doc(firestore, `families/${familyId}/nfcTags/${tappedUid}`);
    const tag = await getDoc(tagRef);
    if (!tag.exists()) {
      alert("Tag not found in this family.");
      return;
    }

    const individualId = tag.data().individualId;
    const individualRef = doc(firestore, `families/${familyId}/individuals/${individualId}`);
    await updateDoc(individualRef, {
      lastTappedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    });

    await addDoc(collection(firestore, `families/${familyId}/events`), {
      type: "nfc.tap",
      message: `Tag ${tappedUid} updated profile ${individualId}`,
      tagId: tappedUid,
      individualId,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
  };
};

const renderAuth = () => {
  root.innerHTML = `
    <div class="card stack">
      <h2>Cappy Firebase Prototype</h2>
      <p class="muted">Create/sign in account then manage family groups and NFC updates in real-time.</p>
      <div class="row">
        <input id="email" type="email" placeholder="Email" />
        <input id="password" type="password" placeholder="Password (6+ chars)" />
      </div>
      <div class="row">
        <button id="sign-up">Create account</button>
        <button id="sign-in">Sign in</button>
      </div>
      <p class="muted">Tip: open this page in a second browser to confirm real-time sync.</p>
    </div>
  `;

  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");

  document.querySelector("#sign-up").onclick = async () => {
    await createUserWithEmailAndPassword(firebaseAuth, emailInput.value.trim(), passwordInput.value.trim());
  };

  document.querySelector("#sign-in").onclick = async () => {
    await signInWithEmailAndPassword(firebaseAuth, emailInput.value.trim(), passwordInput.value.trim());
  };
};

onAuthStateChanged(firebaseAuth, async (user) => {
  stopAllListeners();

  if (!user) {
    currentFamilyId = null;
    renderAuth();
    return;
  }

  renderShell(user);

  const storedFamilyId = localStorage.getItem("cappy_firebase_family_id");
  if (storedFamilyId) {
    try {
      await ensureMembership(user, storedFamilyId);
      bindFamily(user, storedFamilyId);
    } catch (_error) {
      localStorage.removeItem("cappy_firebase_family_id");
    }
  }

  document.querySelector("#create-family").onclick = async () => {
    const familyName = document.querySelector("#family-name").value.trim();
    if (!familyName) return;

    const familyRef = await addDoc(collection(firestore, "families"), {
      name: familyName,
      inviteCode: randomCode(),
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(firestore, `families/${familyRef.id}/members/${user.uid}`), {
      role: "owner",
      email: user.email,
      joinedAt: serverTimestamp(),
    });

    await ensureMembership(user, familyRef.id);
    bindFamily(user, familyRef.id);
  };

  document.querySelector("#join-family").onclick = async () => {
    const inviteCode = document.querySelector("#invite-code").value.trim().toUpperCase();
    if (!inviteCode) return;

    const familyQuery = query(collection(firestore, "families"), where("inviteCode", "==", inviteCode));
    const familySnapshot = await new Promise((resolve) => {
      const unsubscribe = onSnapshot(familyQuery, (snap) => {
        unsubscribe();
        resolve(snap);
      });
    });

    const familyDoc = familySnapshot.docs[0];
    if (!familyDoc) {
      alert("No family found with that invite code.");
      return;
    }

    await setDoc(doc(firestore, `families/${familyDoc.id}/members/${user.uid}`), {
      role: "member",
      email: user.email,
      joinedAt: serverTimestamp(),
    });

    await ensureMembership(user, familyDoc.id);
    bindFamily(user, familyDoc.id);
  };
});
