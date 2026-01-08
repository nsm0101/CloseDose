import { supabase } from "./auth/supabaseClient.js";

const dashboardSubhead = document.getElementById("dashboardSubhead");
const userEmailEl = document.getElementById("userEmail");
const signOutBtn = document.getElementById("signOutBtn");
const familyList = document.getElementById("familyList");

const roleCanManageMembers = (role) => ["owner", "admin", "caregiver"].includes(role);
const roleCanManageFamily = (role) => ["owner", "admin"].includes(role);

const setSubhead = (text) => {
  if (dashboardSubhead) dashboardSubhead.textContent = text;
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
};

const calculateAge = (dob) => {
  if (!dob) return "—";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return `${age} yrs`;
};

const formatWeight = (weightKg) => {
  if (weightKg === null || weightKg === undefined || weightKg === "") return "—";
  const kg = Number(weightKg);
  if (Number.isNaN(kg)) return "—";
  const lbs = kg * 2.20462;
  return `${kg.toFixed(1)} kg / ${lbs.toFixed(1)} lb`;
};

const getWeightKg = (value, unit) => {
  if (!value) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return unit === "lb" ? Number((numeric * 0.453592).toFixed(3)) : numeric;
};

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `member-${Math.random().toString(36).slice(2, 10)}`;
};

const showStatus = (container, message, type = "") => {
  if (!container) return;
  container.textContent = message;
  container.classList.remove("error", "success");
  if (type) container.classList.add(type);
};

const copyText = async (value, statusEl) => {
  try {
    await navigator.clipboard.writeText(value);
    showStatus(statusEl, "Copied!", "success");
  } catch (error) {
    showStatus(statusEl, "Copy failed. You can manually select the text.", "error");
  }
};

const uploadMemberPhoto = async (familyId, memberId, file) => {
  if (!file) return null;
  const path = `${familyId}/${memberId}.jpg`;
  const { error } = await supabase.storage
    .from("member-photos")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

  if (error) throw error;

  const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
  return data?.publicUrl || null;
};

const fetchFamilies = async (userId) => {
  const { data: memberships, error } = await supabase
    .from("user_families")
    .select("family_id, role, family:family_id(id, name, created_at)")
    .eq("user_id", userId);

  if (error) throw error;
  return memberships || [];
};

const createBootstrapFamily = async (userId) => {
  const { data: createdFamily, error: familyError } = await supabase
    .from("families")
    .insert({ name: "My Family", created_by_user_id: userId })
    .select("id, name, created_at")
    .single();

  if (familyError) throw familyError;

  const { error: linkError } = await supabase.from("user_families").insert({
    user_id: userId,
    family_id: createdFamily.id,
    role: "owner",
  });

  if (linkError) throw linkError;

  return createdFamily;
};

const fetchMembers = async (familyIds) => {
  if (!familyIds.length) return [];
  const { data, error } = await supabase
    .from("family_members")
    .select("id, family_id, name, dob, sex, weight_kg, photo_url")
    .in("family_id", familyIds)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

const renderFamilies = (memberships, members) => {
  familyList.innerHTML = "";

  const membersByFamily = members.reduce((acc, member) => {
    if (!acc[member.family_id]) acc[member.family_id] = [];
    acc[member.family_id].push(member);
    return acc;
  }, {});

  memberships.forEach((membership) => {
    const family = membership.family;
    if (!family) return;

    const familyMembers = membersByFamily[family.id] || [];
    const canManageMembers = roleCanManageMembers(membership.role);
    const canManageFamily = roleCanManageFamily(membership.role);

    const card = document.createElement("div");
    card.className = "family-card";
    card.dataset.familyId = family.id;
    card.dataset.role = membership.role;

    const header = document.createElement("div");
    header.className = "family-header";

    const title = document.createElement("h3");
    title.textContent = family.name || "Untitled family";

    const meta = document.createElement("div");
    meta.className = "family-meta";
    meta.textContent = `Role: ${membership.role}`;

    header.append(title, meta);

    const memberSection = document.createElement("div");
    const memberHeader = document.createElement("h4");
    memberHeader.textContent = "Family members";
    memberHeader.style.margin = "0";
    memberSection.appendChild(memberHeader);

    const memberGrid = document.createElement("div");
    memberGrid.className = "member-grid";

    if (!familyMembers.length) {
      const empty = document.createElement("p");
      empty.className = "status";
      empty.textContent = "No members yet.";
      memberSection.appendChild(empty);
    }

    familyMembers.forEach((member) => {
      const memberCard = document.createElement("div");
      memberCard.className = "member-card";
      memberCard.dataset.memberId = member.id;

      const photo = document.createElement("div");
      photo.className = "member-photo";
      if (member.photo_url) {
        const img = document.createElement("img");
        img.src = member.photo_url;
        img.alt = member.name || "Member photo";
        photo.appendChild(img);
      } else {
        photo.textContent = member.name ? member.name.charAt(0).toUpperCase() : "?";
      }

      const name = document.createElement("strong");
      name.textContent = member.name || "Unnamed";

      const age = document.createElement("span");
      age.textContent = `Age: ${calculateAge(member.dob)}`;

      const sex = document.createElement("span");
      sex.textContent = `Sex: ${member.sex || "—"}`;

      const weight = document.createElement("span");
      weight.textContent = `Weight: ${formatWeight(member.weight_kg)}`;

      memberCard.append(photo, name, age, sex, weight);

      if (canManageMembers) {
        const actions = document.createElement("div");
        actions.className = "member-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "ghost-btn";
        editBtn.type = "button";
        editBtn.textContent = "Edit";
        editBtn.dataset.action = "toggle-edit";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "ghost-btn";
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.action = "delete-member";

        actions.append(editBtn, deleteBtn);
        memberCard.appendChild(actions);

        const editForm = document.createElement("form");
        editForm.className = "member-edit-form hidden";
        editForm.dataset.action = "edit-member";
        editForm.dataset.memberId = member.id;
        editForm.innerHTML = `
          <label>
            Name
            <input name="name" type="text" value="${member.name || ""}" required />
          </label>
          <label>
            DOB
            <input name="dob" type="date" value="${formatDate(member.dob)}" />
          </label>
          <label>
            Sex
            <select name="sex">
              <option value="" ${!member.sex ? "selected" : ""}>Select</option>
              <option value="female" ${member.sex === "female" ? "selected" : ""}>Female</option>
              <option value="male" ${member.sex === "male" ? "selected" : ""}>Male</option>
              <option value="other" ${member.sex === "other" ? "selected" : ""}>Other</option>
            </select>
          </label>
          <div class="inline">
            <label>
              Weight
              <input name="weight" type="number" step="0.1" value="${member.weight_kg ?? ""}" />
            </label>
            <label>
              Unit
              <select name="unit">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </label>
          </div>
          <label>
            Photo
            <input name="photo" type="file" accept="image/*" />
          </label>
          <div class="inline">
            <button type="submit" class="primary-btn">Save</button>
            <button type="button" class="ghost-btn" data-action="cancel-edit">Cancel</button>
          </div>
          <p class="status" data-role="member-status"></p>
        `;
        memberCard.appendChild(editForm);
      }

      memberGrid.appendChild(memberCard);
    });

    memberSection.appendChild(memberGrid);

    const settings = document.createElement("details");
    settings.className = "settings-panel";
    const summary = document.createElement("summary");
    summary.textContent = "Family settings";
    settings.appendChild(summary);

    const settingsGrid = document.createElement("div");
    settingsGrid.className = "settings-grid";

    const familyIdRow = document.createElement("div");
    familyIdRow.className = "settings-row";
    familyIdRow.innerHTML = `
      <label>
        Family ID
        <input type="text" value="${family.id}" readonly />
      </label>
      <button type="button" class="ghost-btn" data-action="copy-family" data-family-id="${family.id}">Copy ID</button>
      <p class="status"></p>
    `;

    settingsGrid.appendChild(familyIdRow);

    if (canManageFamily) {
      const inviteRow = document.createElement("div");
      inviteRow.className = "settings-row";
      inviteRow.innerHTML = `
        <form data-action="invite-family" data-family-id="${family.id}">
          <label>
            Invite by email
            <input name="email" type="email" placeholder="name@example.com" required />
          </label>
          <label>
            Role
            <select name="role">
              <option value="member">Member</option>
              <option value="caregiver">Caregiver</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div class="inline">
            <button type="submit" class="primary-btn">Create Invite</button>
            <button type="button" class="ghost-btn" data-action="copy-invite" data-family-id="${family.id}" disabled>Copy Join Link</button>
          </div>
          <p class="status" data-role="invite-status"></p>
        </form>
      `;
      settingsGrid.appendChild(inviteRow);
    }

    const joinRow = document.createElement("div");
    joinRow.className = "settings-row";
    joinRow.innerHTML = `
      <form data-action="join-family">
        <label>
          Request to join another family by ID
          <input name="family_id" type="text" placeholder="Family ID" required />
        </label>
        <button type="submit" class="ghost-btn">Request to join</button>
        <p class="status" data-role="join-status"></p>
      </form>
    `;
    settingsGrid.appendChild(joinRow);

    if (canManageFamily) {
      const deleteRow = document.createElement("div");
      deleteRow.className = "settings-row";
      deleteRow.innerHTML = `
        <button type="button" class="ghost-btn" data-action="delete-family" data-family-id="${family.id}">Delete family</button>
        <p class="status" data-role="delete-status"></p>
      `;
      settingsGrid.appendChild(deleteRow);
    }

    settings.appendChild(settingsGrid);

    card.append(header, memberSection, settings);

    if (canManageMembers) {
      const addMemberForm = document.createElement("details");
      addMemberForm.innerHTML = `
        <summary>Add a member</summary>
        <form data-action="add-member" data-family-id="${family.id}">
          <label>
            Name
            <input name="name" type="text" required />
          </label>
          <label>
            DOB
            <input name="dob" type="date" />
          </label>
          <label>
            Sex
            <select name="sex">
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div class="inline">
            <label>
              Weight
              <input name="weight" type="number" step="0.1" />
            </label>
            <label>
              Unit
              <select name="unit">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </label>
          </div>
          <label>
            Photo
            <input name="photo" type="file" accept="image/*" />
          </label>
          <button type="submit" class="primary-btn">Add member</button>
          <p class="status" data-role="member-status"></p>
        </form>
      `;
      card.appendChild(addMemberForm);
    }

    familyList.appendChild(card);
  });
};

const refreshDashboard = async (userId) => {
  setSubhead("Loading family data...");
  try {
    let memberships = await fetchFamilies(userId);
    if (!memberships.length) {
      await createBootstrapFamily(userId);
      memberships = await fetchFamilies(userId);
    }

    const familyIds = memberships.map((membership) => membership.family_id);
    const members = await fetchMembers(familyIds);

    renderFamilies(memberships, members);
    setSubhead(`You belong to ${memberships.length} famil${memberships.length === 1 ? "y" : "ies"}.`);
  } catch (error) {
    console.error(error);
    setSubhead("Unable to load family data.");
  }
};

familyList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("button");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  if (!action) return;

  if (action === "copy-family") {
    const familyId = actionButton.dataset.familyId;
    const status = actionButton.parentElement?.querySelector(".status");
    await copyText(familyId, status);
  }

  if (action === "copy-invite") {
    const familyId = actionButton.dataset.familyId;
    const card = actionButton.closest(".family-card");
    const inviteStatus = card?.querySelector('[data-role="invite-status"]');
    const inviteLink = inviteStatus?.dataset.joinUrl;
    if (inviteLink) {
      await copyText(inviteLink, inviteStatus);
    }
  }

  if (action === "toggle-edit") {
    const memberCard = actionButton.closest(".member-card");
    const form = memberCard?.querySelector(".member-edit-form");
    if (form) {
      form.classList.toggle("hidden");
    }
  }

  if (action === "cancel-edit") {
    const form = actionButton.closest("form");
    if (form) form.classList.add("hidden");
  }

  if (action === "delete-member") {
    const memberCard = actionButton.closest(".member-card");
    const familyCard = actionButton.closest(".family-card");
    const memberId = memberCard?.dataset.memberId;
    const familyId = familyCard?.dataset.familyId;
    if (!memberId || !familyId) return;
    if (!window.confirm("Delete this member?")) return;

    const { error } = await supabase.from("family_members").delete().eq("id", memberId);
    if (error) {
      alert(error.message);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      refreshDashboard(data.session.user.id);
    }
  }

  if (action === "delete-family") {
    const familyId = actionButton.dataset.familyId;
    if (!familyId) return;
    if (!window.confirm("Delete this family? This cannot be undone.")) return;
    const { error } = await supabase.from("families").delete().eq("id", familyId);
    if (error) {
      alert(error.message);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      refreshDashboard(data.session.user.id);
    }
  }
});

familyList.addEventListener("submit", async (event) => {
  const form = event.target.closest("form");
  if (!form) return;
  const action = form.dataset.action;
  if (!action) return;
  event.preventDefault();

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return;

  if (action === "invite-family") {
    const familyId = form.dataset.familyId;
    const status = form.querySelector('[data-role="invite-status"]');
    const copyBtn = form.querySelector('[data-action="copy-invite"]');
    showStatus(status, "Creating invite...");
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const role = String(formData.get("role") || "member");

    const { data, error } = await supabase.rpc("create_family_invite", {
      p_family_id: familyId,
      p_email: email,
      p_role: role,
    });

    if (error) {
      showStatus(status, error.message, "error");
      return;
    }

    const joinUrl = data?.join_url || data?.joinUrl || data?.url || "";
    if (joinUrl) {
      status.dataset.joinUrl = joinUrl;
      showStatus(status, `Invite created: ${joinUrl}`, "success");
      if (copyBtn) copyBtn.disabled = false;
    } else {
      showStatus(status, "Invite created. Copy the link from your inbox.", "success");
    }
    form.reset();
  }

  if (action === "join-family") {
    const status = form.querySelector('[data-role="join-status"]');
    const formData = new FormData(form);
    const familyId = String(formData.get("family_id") || "").trim();
    showStatus(status, "Submitting join request...");
    const { error } = await supabase.from("family_join_requests").insert({
      family_id: familyId,
      requested_by_user_id: user.id,
      status: "pending",
    });

    if (error) {
      showStatus(status, error.message, "error");
      return;
    }

    showStatus(status, "Join request submitted.", "success");
    form.reset();
  }

  if (action === "add-member") {
    const familyId = form.dataset.familyId;
    const status = form.querySelector('[data-role="member-status"]');
    showStatus(status, "Adding member...");
    const formData = new FormData(form);
    const memberId = generateId();

    let photoUrl = null;
    const file = formData.get("photo");
    if (file instanceof File && file.size > 0) {
      try {
        photoUrl = await uploadMemberPhoto(familyId, memberId, file);
      } catch (error) {
        showStatus(status, error.message, "error");
        return;
      }
    }

    const payload = {
      id: memberId,
      family_id: familyId,
      name: String(formData.get("name") || "").trim(),
      dob: formData.get("dob") || null,
      sex: formData.get("sex") || null,
      weight_kg: getWeightKg(formData.get("weight"), formData.get("unit")),
      photo_url: photoUrl,
      created_by_user_id: user.id,
    };

    const { error } = await supabase.from("family_members").insert(payload);
    if (error) {
      showStatus(status, error.message, "error");
      return;
    }

    showStatus(status, "Member added.", "success");
    form.reset();
    await refreshDashboard(user.id);
  }

  if (action === "edit-member") {
    const familyCard = form.closest(".family-card");
    const memberId = form.dataset.memberId;
    const status = form.querySelector('[data-role="member-status"]');
    const familyId = familyCard?.dataset.familyId;
    if (!memberId || !familyId) return;

    showStatus(status, "Saving updates...");
    const formData = new FormData(form);

    let photoUrl = null;
    const file = formData.get("photo");
    if (file instanceof File && file.size > 0) {
      try {
        photoUrl = await uploadMemberPhoto(familyId, memberId, file);
      } catch (error) {
        showStatus(status, error.message, "error");
        return;
      }
    }

    const updates = {
      name: String(formData.get("name") || "").trim(),
      dob: formData.get("dob") || null,
      sex: formData.get("sex") || null,
      weight_kg: getWeightKg(formData.get("weight"), formData.get("unit")),
    };
    if (photoUrl) updates.photo_url = photoUrl;

    const { error } = await supabase.from("family_members").update(updates).eq("id", memberId);
    if (error) {
      showStatus(status, error.message, "error");
      return;
    }

    showStatus(status, "Member updated.", "success");
    form.classList.add("hidden");
    await refreshDashboard(user.id);
  }
});

const init = async () => {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session) {
    window.location.href = "/login.html?redirect=/dashboard.html";
    return;
  }

  userEmailEl.textContent = session.user.email || "Signed in";

  signOutBtn?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login.html";
  });

  await refreshDashboard(session.user.id);
};

init();
