// /cappy/scan.js

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase client config
const supabaseUrl = "https://tfmpgxwzgdzndbdzsftx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbXBneHd6Z2R6bmRiZHpzZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg0MDcsImV4cCI6MjA3OTc0NDQwN30.X5f5YulGHxjJDFX2i7T3vDZXD3Gt9MY8SyvFybTHCKc";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const scanStatus = document.getElementById("scan-status");
const overlayBackdrop = document.getElementById("med-overlay-backdrop");
const familyMemberList = document.getElementById("family-member-list");
const familyNote = document.getElementById("family-note");
const weightModal = document.getElementById("weight-modal");
const weightForm = document.getElementById("weight-form");
const weightInput = document.getElementById("weight-input");
const weightUnitSelect = document.getElementById("weight-unit");
const weightDateInput = document.getElementById("weight-date");
const weightModalTitle = document.getElementById("weight-modal-title");
const weightModalMessage = document.getElementById("weight-modal-message");
const weightModalActions = document.getElementById("weight-modal-actions");

const BOTTLE_SVG = `
<svg width="64" height="96" viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="10" width="28" height="10" fill="#123934" />
  <rect x="14" y="20" width="36" height="62" rx="10" fill="#24A687" />
  <rect x="16" y="42" width="32" height="28" rx="6" fill="#F5F7FA" />
</svg>
`;

function setStatusMessage(message, isError = false) {
  if (!scanStatus) return;
  scanStatus.textContent = message;
  scanStatus.style.color = isError ? "#b91c1c" : "inherit";
}

function getCodeFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("code");
}

async function fetchOtcMedication(code) {
  const { data, error } = await supabase
    .from("otc_medications")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !data) {
    throw error || new Error("Medication not found");
  }
  return data;
}

async function requireAuthOrRedirect() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Auth error", error);
    throw error;
  }
  if (!data.session) {
    const redirectTarget = encodeURIComponent(window.location.href);
    window.location.href = `/cappy/login?redirect=${redirectTarget}`;
    return null;
  }
  return data.session.user;
}

async function fetchFamilyAndMembers(user) {
  const { data: memberships, error: membershipError } = await supabase
    .from("user_families")
    .select("family_id, role, family:family_id(id, name)")
    .eq("user_id", user.id);

  if (membershipError) {
    throw membershipError;
  }

  const preferredFamilyId = user.user_metadata?.family_id;
  const activeMembership =
    memberships?.find((entry) => entry.family_id === preferredFamilyId) ||
    memberships?.[0];

  if (!activeMembership?.family_id) {
    throw new Error("Family not found");
  }

  const { data: family, error: famError } = await supabase
    .from("families")
    .select("*")
    .eq("id", activeMembership.family_id)
    .single();

  if (famError || !family) {
    throw famError || new Error("Family not found");
  }

  const { data: members, error: memberError } = await supabase
    .from("family_members")
    .select("*")
    .eq("family_id", family.id)
    .order("date_of_birth", { ascending: true });

  if (memberError) {
    throw memberError;
  }

  return { family, members: members || [] };
}

async function fetchLatestWeightLog(memberId) {
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("family_member_id", memberId)
    .order("measured_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.warn("Weight log error", error);
    return null;
  }
  return data || null;
}

async function fetchLatestDoseLog(memberId, medCode) {
  const query = supabase
    .from("dose_logs")
    .select("*")
    .eq("family_member_id", memberId)
    .order("administered_at", { ascending: false })
    .limit(1);

  if (medCode) {
    query.eq("medication_code", medCode);
  }

  const { data, error } = await query.single();
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.warn("Dose log error", error);
    return null;
  }
  return data || null;
}

function formatDoseStatus(log) {
  if (!log) return "No dose logged yet";
  const time = new Date(log.administered_at).toLocaleString();
  const amount = log.dose_amount ? `${log.dose_amount} ${log.dose_unit || ""}`.trim() : "";
  return amount ? `Last dose: ${amount} on ${time}` : `Last dose: ${time}`;
}

function formatAge(dob) {
  if (!dob) return "Age unknown";
  const ageMonths = getAgeInMonths(dob);
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  if (years <= 0) return `${months} months`;
  if (months === 0) return `${years} years`;
  return `${years} years ${months} months`;
}

function getAgeInMonths(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(months, 0);
}

function daysBetween(dateA, dateB) {
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function formatWeightStatus(log) {
  if (!log) return "No weight yet";
  const daysOld = daysBetween(new Date(), new Date(log.measured_at));
  const freshness = daysOld <= 7 ? "fresh" : `${daysOld}d old`;
  return `${Number(log.weight_kg).toFixed(1)} kg • ${freshness}`;
}

function showMedicationOverlay(med) {
  document.getElementById("med-title").textContent =
    med.brand_name || med.generic_name || "Medication";
  document.getElementById("med-subtitle").textContent = med.form || "";
  document.getElementById("med-concentration").textContent = med.concentration_label
    ? `Concentration: ${med.concentration_label}`
    : "";
  document.getElementById("med-category").textContent = med.category || "";
  document.getElementById("med-warning").textContent =
    "Always follow package instructions and dosing guidance from your clinician.";

  const svgContainer = document.getElementById("med-overlay-svg");
  svgContainer.innerHTML = BOTTLE_SVG;

  const logoImg = document.getElementById("med-brand-logo");
  if (med.brand_logo_url) {
    logoImg.src = med.brand_logo_url;
    logoImg.style.display = "block";
  } else if (med.code === "TYL_CH_SUSP") {
    logoImg.src = "/cappy/assets/brands/tyl_ch_susp.png";
    logoImg.style.display = "block";
  } else {
    logoImg.style.display = "none";
  }

  overlayBackdrop.classList.remove("hidden");
  document
    .getElementById("med-overlay-close-btn")
    .addEventListener(
      "click",
      () => overlayBackdrop.classList.add("hidden"),
      { once: true }
    );
}

function renderFamilyMembers(med, members) {
  familyMemberList.innerHTML = "";
  if (!members.length) {
    familyNote.textContent = "Add your family in Cappy! to continue.";
    return;
  }
  familyNote.textContent = "Tap a child to check weight and dosing.";

  const statusPromises = members.map((member) =>
    Promise.all([
      fetchLatestWeightLog(member.id),
      fetchLatestDoseLog(member.id, med.code),
    ]).then(([log, doseLog]) => ({ member, log, doseLog }))
  );

  Promise.all(statusPromises).then((results) => {
    results.forEach(({ member, log, doseLog }) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "member-chip";
      chip.innerHTML = `
        <span class="member-name">${member.name}</span>
        <span class="member-meta">${formatAge(member.date_of_birth)}</span>
        <span class="member-meta">${formatWeightStatus(log)}</span>
        <span class="member-meta">${formatDoseStatus(doseLog)}</span>
      `;
      chip.addEventListener("click", () =>
        handleFamilyMemberSelection(med, member, log)
      );
      familyMemberList.appendChild(chip);
    });
  });
}

function openWeightModal({ title, message, showForm = false, actions = [] }) {
  weightModalTitle.textContent = title;
  weightModalMessage.textContent = message;
  weightForm.classList.toggle("hidden", !showForm);
  weightModalActions.innerHTML = "";
  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.textContent = action.label;
    btn.className = `btn ${action.primary ? "btn-primary" : "btn-secondary"}`;
    btn.addEventListener("click", action.onClick, { once: true });
    weightModalActions.appendChild(btn);
  });
  if (showForm) {
    const today = new Date().toISOString().slice(0, 10);
    weightDateInput.value = weightDateInput.value || today;
    weightInput.focus();
  }
  weightModal.classList.remove("hidden");
}

function closeWeightModal() {
  weightModal.classList.add("hidden");
  weightModalActions.innerHTML = "";
}

async function saveWeightLog(member, med, onComplete) {
  const rawWeight = Number(weightInput.value);
  if (Number.isNaN(rawWeight) || rawWeight <= 0) {
    alert("Please enter a valid weight.");
    return;
  }
  const unit = weightUnitSelect.value;
  const measuredAt = weightDateInput.value
    ? new Date(weightDateInput.value)
    : new Date();
  const weightKg = unit === "lb" ? rawWeight / 2.20462 : rawWeight;

  const { error } = await supabase.from("weight_logs").insert({
    family_member_id: member.id,
    weight_kg: weightKg,
    measured_at: measuredAt.toISOString(),
  });

  if (error) {
    console.error("Failed to save weight", error);
    alert("Could not save weight. Please try again.");
    return;
  }

  closeWeightModal();
  onComplete(weightKg);
}

function promptForWeight(med, member) {
  openWeightModal({
    title: `Enter weight for ${member.name}`,
    message: "We need a recent weight to calculate an accurate dose.",
    showForm: true,
    actions: [
      {
        label: "Save weight",
        primary: true,
        onClick: () =>
          saveWeightLog(member, med, (weightKg) =>
            proceedToDosing(med, member, weightKg)
          ),
      },
      { label: "Cancel", primary: false, onClick: () => closeWeightModal() },
    ],
  });
}

function promptForStaleWeight(med, member, log) {
  const weightText = `${Number(log.weight_kg).toFixed(1)} kg`;
  const daysOld = daysBetween(new Date(), new Date(log.measured_at));
  openWeightModal({
    title: `${member.name}'s weight`,
    message: `Last recorded weight: ${weightText} from ${daysOld} days ago. For accurate dosing, please confirm or update the weight.`,
    showForm: false,
    actions: [
      {
        label: `Use ${weightText} for now`,
        primary: true,
        onClick: () => {
          closeWeightModal();
          proceedToDosing(med, member, log.weight_kg);
        },
      },
      {
        label: "Update weight",
        primary: false,
        onClick: () => {
          openWeightModal({
            title: `Update weight for ${member.name}`,
            message: "Enter the new measured weight.",
            showForm: true,
            actions: [
              {
                label: "Save weight",
                primary: true,
                onClick: () =>
                  saveWeightLog(member, med, (weightKg) =>
                    proceedToDosing(med, member, weightKg)
                  ),
              },
              {
                label: "Cancel",
                primary: false,
                onClick: () => closeWeightModal(),
              },
            ],
          });
        },
      },
    ],
  });
}

function proceedToDosing(med, member, weightKg) {
  const ageInMonths = getAgeInMonths(member.date_of_birth);
  openDosingForSelection({ med, familyMember: member, weightKg, ageInMonths });
}

async function handleFamilyMemberSelection(med, member, cachedLog) {
  setStatusMessage(`Preparing dosing for ${member.name}...`);
  const log = cachedLog || (await fetchLatestWeightLog(member.id));
  if (!log) {
    promptForWeight(med, member);
    return;
  }
  const daysOld = daysBetween(new Date(), new Date(log.measured_at));
  if (daysOld > 7) {
    promptForStaleWeight(med, member, log);
    return;
  }
  proceedToDosing(med, member, log.weight_kg);
}

function openDosingForSelection({ med, familyMember, weightKg, ageInMonths }) {
  console.log("Open dosing flow", { med, familyMember, weightKg, ageInMonths });
  const params = new URLSearchParams({
    code: med.code,
    member_id: familyMember.id,
    weight_kg: weightKg,
  });
  window.location.href = `/cappy/calculator.html?${params.toString()}`;
}

function wireCalculatorButton(med) {
  const button = document.getElementById("med-open-calculator-btn");
  button.replaceWith(button.cloneNode(true));
  const newButton = document.getElementById("med-open-calculator-btn");
  newButton.addEventListener("click", () => {
    const params = new URLSearchParams({ code: med.code });
    window.location.href = `/cappy/calculator.html?${params.toString()}`;
  });
}

async function initScanPage() {
  const code = getCodeFromUrl();
  if (!code) {
    setStatusMessage("No medication code found in the link.", true);
    return;
  }

  setStatusMessage("Looking up medication...");
  let med;
  try {
    med = await fetchOtcMedication(code);
    setStatusMessage(`Loaded ${med.brand_name || med.generic_name}.`);
  } catch (error) {
    console.error(error);
    setStatusMessage("We couldn't find this medication.", true);
    return;
  }

  showMedicationOverlay(med);

  const user = await requireAuthOrRedirect();
  if (!user) return;

  try {
    const { members } = await fetchFamilyAndMembers(user);
    renderFamilyMembers(med, members);
    wireCalculatorButton(med);
    setStatusMessage("Select who needs this medication.");
  } catch (error) {
    console.error(error);
    setStatusMessage(
      "We could not load your family information. Please try again later.",
      true
    );
  }
}

initScanPage();
