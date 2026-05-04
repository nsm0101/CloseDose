// /cappy/medication-config.js

export const OTC_MEDICATIONS = {
    "TYL_CH_SUSP": {
        token: "TYL_CH_SUSP",
        med_id: "tyl_children_susp_160_5",
        generic_name: "Acetaminophen",
        brand_examples: ["Children's Tylenol"],
        form: "Oral suspension",
        concentration_mg_per_5ml: 160,
        concentration_label: "160 mg per 5 mL",
        route: "PO",
        otc_category: "Pain reliever / fever reducer",
        // Dosing values will need to be validated against trusted references [source not verified]
        age_min_months: 24,              // [source not verified]
        age_max_years: 11,               // [source not verified]
        default_dose_mg_per_kg: 15,      // [source not verified]
        max_daily_mg_per_kg: 75,         // [source not verified]
        dose_interval_hours: 4,          // [source not verified]
        max_doses_per_24h: 5,            // [source not verified]
        warning_short:
            "Do not exceed the recommended daily dose or combine with other acetaminophen-containing products.",
        bottle_volume_ml: 118,           // approx 4 fl oz [source not verified]
        ui: {
            color_primary: "#24A687",
            color_accent: "#123934",
            icon_type: "bottle",
            badge_text: "OTC",
            overlay_title: "Children's Acetaminophen",
            overlay_subtitle: "160 mg per 5 mL Oral Suspension",
            brand_logo_url: "/assets/brands/tylenol-children.png"
        }
    }
};