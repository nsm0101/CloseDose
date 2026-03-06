import "../../styles.css";
import { requireAuth, signOut } from "../../authService";
import { supabase } from "../../supabaseClient";
import { createFamilySettings } from "../../components/FamilySettings";
import { createFamilyMembers } from "../../components/FamilyMembers";
import { createPatients } from "../../components/Patients";
import { createMedications } from "../../components/Medications";
import { createNFCTags } from "../../components/NFCTags";
import { createDoseEvents } from "../../components/DoseEvents";
import { createPatientWeights } from "../../components/PatientWeights";
import { showToast } from "../../lib/toast";

const root = document.querySelector("#app");
const user = await requireAuth({ nextUrl: location.pathname + location.search });

if (!user) {
  // requireAuth navigates
} else {
  const params = new URLSearchParams(location.search);
  let selectedFamilyId = params.get("family") || localStorage.getItem("cappy_family_id");
  let selectedFamilyRole = "member";

  root.innerHTML = `
    <div class="card">
      <div class="row space-between">
        <div>
          <h2>Cappy Admin</h2>
          <p><span class="badge">signed in</span> ${user.email ?? "(no email)"}</p>
          <p class="muted" id="family-label">No family selected</p>
        </div>
        <div class="row">
          <button id="refresh">Refresh</button>
          <button id="firebase-prototype">Firebase Prototype</button>
          <button id="out">Sign out</button>
        </div>
      </div>
      <div id="components" class="stack"></div>
    </div>
  `;

  const componentsEl = document.querySelector("#components");
  const familyLabel = document.querySelector("#family-label");

  const familySettings = createFamilySettings({
    supabase,
    user,
    onFamilySelect: ({ family, familyId, role }) => {
      setFamilyContext(familyId, role, family);
    },
  });

  const familyMembers = createFamilyMembers({ supabase, currentUser: user });
  const patients = createPatients({ supabase });
  const medications = createMedications({ supabase });
  const nfcTags = createNFCTags({ supabase });
  const doseEvents = createDoseEvents({ supabase, user });
  const patientWeights = createPatientWeights({ supabase, user });

  componentsEl.append(
    familySettings.el,
    familyMembers.el,
    patients.el,
    medications.el,
    nfcTags.el,
    doseEvents.el,
    patientWeights.el
  );

  const setFamilyContext = (familyId, role, family = null) => {
    if (!familyId) return;
    selectedFamilyId = familyId;
    selectedFamilyRole = role;
    localStorage.setItem("cappy_family_id", familyId);
    familyLabel.textContent = family ? `Family: ${family.name}` : `Family: ${familyId}`;

    familyMembers.setFamilyContext({ id: familyId, role });
    patients.setFamilyId(familyId);
    medications.setFamilyId(familyId);
    nfcTags.setFamilyId(familyId);
    doseEvents.setFamilyId(familyId);
    patientWeights.setFamilyId(familyId);
  };

  if (selectedFamilyId) {
    setFamilyContext(selectedFamilyId, selectedFamilyRole);
  }

  document.querySelector("#refresh").onclick = async () => {
    await familySettings.refresh();
    await familyMembers.refresh();
    await patients.refresh();
    await medications.refresh();
    await nfcTags.refresh();
    await doseEvents.refresh();
    await patientWeights.refresh();
    showToast("Data refreshed.", "success");
  };

  document.querySelector("#firebase-prototype").onclick = () => {
    location.href = "/cappy/firebase/";
  };

  document.querySelector("#out").onclick = async () => {
    await signOut();
    location.href = "/cappy/auth/";
  };
}
