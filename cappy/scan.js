// /cappy/scan.js

import { OTC_MEDICATIONS } from "./public/med-config.js";

const tylBottleSvg = `
<svg width="64" height="96" viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="10" width="28" height="10" fill="#123934" />
  <rect x="14" y="20" width="36" height="62" rx="10" fill="#24A687" />
  <rect x="16" y="42" width="32" height="28" rx="6" fill="#F5F7FA" />
  <text x="32" y="52" text-anchor="middle" font-size="10" fill="#123934" font-family="system-ui, -apple-system">
    ACET
  </text>
  <text x="32" y="64" text-anchor="middle" font-size="8" fill="#555" font-family="system-ui, -apple-system">
    160 mg/5 mL
  </text>
</svg>
`;

// 1) Parse token from https://closedose.com/cappy/scan?token=TYL_CH_SUSP
function getTokenFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("token");
}

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

  title.textContent = med.ui?.overlay_title || med.generic_name;
  subtitle.textContent = med.ui?.overlay_subtitle || med.concentration_label;
  concentration.textContent = `Concentration: ${med.concentration_label}`;
  category.textContent = med.otc_category || "";
  warning.textContent = med.warning_short || "";
  badge.textContent = med.ui?.badge_text || "OTC";

  // Insert SVG bottle art
  svgContainer.innerHTML = tylBottleSvg;

  // Brand logo image
  if (med.ui?.brand_logo_url) {
    logoImg.src = med.ui.brand_logo_url;
    logoImg.style.display = "block";
  } else {
    logoImg.style.display = "none";
  }

  backdrop.classList.remove("hidden");

  // Close overlay
  document
    .getElementById("med-overlay-close-btn")
    .addEventListener(
      "click",
      () => {
        backdrop.classList.add("hidden");
      },
      { once: true }
    );

  // Use for dosing
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

// TODO: hook this into your existing CloseDose calculator
function openDoseCalculatorForMedication(med) {
  console.log("Open calculator for", med.med_id);
  // e.g.:
  // window.location.href = `/calculator.html?med=${encodeURIComponent(med.med_id)}`;
}

function initScanPage() {
  const token = getTokenFromUrl();

  if (!token) {
    console.warn("No token found in URL.");
    return;
  }

  const med = OTC_MEDICATIONS[token];
  if (!med) {
    console.warn("Unknown NFC token:", token);
    // Show a friendly error UI instead if you want
    return;
  }

  showMedicationOverlay(med);
}

initScanPage();
