// /cappy/scan.js

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1) Supabase client
const supabaseUrl = "https://tfmpgxwzgdzndbdzsftx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbXBneHd6Z2R6bmRiZHpzZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg0MDcsImV4cCI6MjA3OTc0NDQwN30.X5f5YulGHxjJDFX2i7T3vDZXD3Gt9MY8SyvFybTHCKc";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2) Simple SVG bottle art for overlay
const tylBottleSvg = `
<svg width="64" height="96" viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="10" width="28" height="10" fill="#123934" />
  <rect x="14" y="20" width="36" height="62" rx="10" fill="#24A687" />
  <rect x="16" y="42" width="32" height="28" rx="6" fill="#F5F7FA" />
  <text x="32" y="52" text-anchor="middle" font-size="10" fill="#123934"
        font-family="system-ui, -apple-system">
    ACET
  </text>
  <text x="32" y="64" text-anchor="middle" font-size="8" fill="#555"
        font-family="system-ui, -apple-system">
    160 mg/5 mL
  </text>
</svg>
`;

// 3) Read token from https://closedose.com/cappy/scan?token=TYL_CH_SUSP
function getTokenFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("token");
}

// 4) Fetch medication from Supabase by token/code
async function fetchMedicationByToken(token) {
  const { data, error } = await supabase
    .from("otc_medications")
    .select("*")
    .eq("code", token)
    .single();

  if (error) {
    console.error("Error loading medication:", error);
    throw error;
  }
  return data;
}

// 5) Render overlay UI
function showMedicationOverlay(med) {
  const backdrop = document.getElementById("med-overlay-backdrop");
  const title = document.getElementById("med-title");
  const subtitle = document.getElementById("med-subtitle");
  const concentration = document.getElementById("med-concentration");
  const category = document.getElementById("med-category");
  const warning = document.getElementById("med-warning");
  const badge = document.getElementById("med-badge");
  const svgContainer = document.getElementById("med-overlay-svg");
  const logoImg = document.getElementById("med-brand-logo");

  title.textContent = med.brand_name || med.generic_name;
  subtitle.textContent = med.form || "";
  concentration.textContent = med.concentration_label
    ? `Concentration: ${med.concentration_label}`
    : "";
  category.textContent = med.category || "";
  // You can replace this with a generic OTC warning or a field from DB later
  warning.textContent =
    "Always follow package instructions and dosing guidance from your clinician.";
  badge.textContent = "OTC";

  // Bottle art
  svgContainer.innerHTML = tylBottleSvg;

  // Brand logo
  if (med.brand_logo_url) {
    logoImg.src = med.brand_logo_url;
    logoImg.style.display = "block";
  } else {
    logoImg.style.display = "none";
  }

  backdrop.classList.remove("hidden");

  document
    .getElementById("med-overlay-close-btn")
    .addEventListener(
      "click",
      () => {
        backdrop.classList.add("hidden");
      },
      { once: true }
    );

  document
    .getElementById("med-open-calculator-btn")
    .addEventListener(
      "click",
      () => {
        backdrop.classList.add("hidden");
        openDoseCalculatorForMedication(med);
      },
      { once: true }
    );
}

// 6) Hook into your existing CloseDose calculator (placeholder)
function openDoseCalculatorForMedication(med) {
  console.log("Open calculator for medication:", med.code);
  // Example: redirect with query param
  // window.location.href = `/calculator.html?med=${encodeURIComponent(med.code)}`;
}

// 7) Page init
async function initScanPage() {
  const token = getTokenFromUrl();
  if (!token) {
    console.warn("No token in URL");
    return;
  }

  try {
    const med = await fetchMedicationByToken(token);
    showMedicationOverlay(med);
  } catch (e) {
    // TODO: show a friendly error message in the UI
    console.error("Failed to load medication for token", token);
  }
}

initScanPage();
