# Pediatric Comfort and Sedation clinical specification

## Status and intended use

Status: **Clinical review / not approved for clinical use**

This application is a transparent bedside comparison console for pediatric comfort, analgesia, anxiolysis, and dissociative sedation review. It does not recommend or select a best agent. It does not prescribe, combine agents, calculate concentrations or volumes, replace local policy, or replace credentialed clinical judgment.

The intended population is infants and children undergoing review for laceration repair, fracture reduction, abscess drainage, foreign-body removal, imaging, vascular access, or another procedure. Each medication option retains the population boundary of its named source.

## Named evidence sources

1. American Academy of Pediatrics and American Academy of Pediatric Dentistry, *Guidelines for Monitoring and Management of Pediatric Patients Before, During, and After Sedation for Diagnostic and Therapeutic Procedures*. Originally published June 1, 2019. Reaffirmed December 2025 with reference updates.
2. Royal Children's Hospital Melbourne, *Ketamine use for procedural sedation*. Updated December 2021.
3. Texas Children's Hospital, *Procedural Sedation Guideline*. Dated February 2023.

The displayed AAP reaffirmation field uses December 2025 as required. The AAPD-hosted edition describes a June 2025 reaffirmation and appears in its November/December 2025 publication issue. Clinical reviewers must resolve this source-harmonization difference before release without changing the original June 1, 2019 publication date.

## Medication provenance, formula, and cap table

All displayed values are source references, not orders. Weight multiplication occurs first, the applicable cap is applied second, and the display value is rounded to one decimal. No concentration, volume, combined-agent, or best-agent calculation exists.

| Option | Population | Formula | Cap | Onset | Source |
| --- | --- | --- | --- | --- | --- |
| Intranasal midazolam | Infants and children | 0.2-0.4 mg/kg | 10 mg total; 5 mg per naris | 10-15 min | Texas Children's Hospital, February 2023 |
| Intranasal fentanyl analgesia | Age at least 12 months | 1.5-2 mcg/kg | 100 mcg total; 50 mcg per naris | 7-20 min | Texas Children's Hospital, February 2023 |
| IV ketamine initial | Age at least 3 months | 1-1.5 mg/kg | Included in 4.5 mg/kg cumulative cap | 1 min | Royal Children's Hospital Melbourne, December 2021 |
| IV ketamine repeat | Age at least 3 months | 0.25-0.5 mg/kg at 10 minutes if needed | 4.5 mg/kg cumulative | Not separately stated | Royal Children's Hospital Melbourne, December 2021 |
| IM ketamine initial | Age at least 3 months | 4 mg/kg | Included in 6 mg/kg cumulative cap | 3-4 min | Royal Children's Hospital Melbourne, December 2021 |
| IM ketamine repeat | Age at least 3 months | 2 mg/kg at 10 minutes if needed | 6 mg/kg cumulative | Not separately stated | Royal Children's Hospital Melbourne, December 2021 |

For intranasal options, the application displays total range and cap metadata only. It does not split a calculated amount by naris.

## Population exclusions and review flags

- Intranasal fentanyl returns a structured exclusion below 12 months.
- IV and IM ketamine return a structured exclusion below 3 months.
- The ketamine source lists infants younger than 3 months as an absolute contraindication.
- The ketamine source lists age younger than 12 months as a relative contraindication in some jurisdictions.
- The ketamine source lists current significant respiratory illness and known difficult airway, prior airway surgery, or congenital airway anomaly among relative contraindications requiring experienced senior review.
- Airway or OSA concern, respiratory illness, ASA III or greater, congenital heart disease, previous sedation complication, and interacting sedative status begin unassessed. A recorded concern surfaces a prompt and never hides medication options.

The console does not infer eligibility from procedure, age, weight, or a risk flag beyond the explicit age exclusions above.

## Interaction warnings

- Medication cards are separate comparison options. They are never displayed as a regimen.
- A recorded interacting sedative flag prompts review of additive respiratory and sedation effects with pediatric pharmacy.
- The application must not calculate a combined dose, suggest a combination, or imply that selecting multiple comparison cards authorizes coadministration.
- Actual medication history, allergies, contraindications, route feasibility, local formulary, and interactions require independent clinical verification.

## Comfort and non-calculated options

Nonpharmacologic comfort and local anesthesia remain visible as a distinct foundational option. Nitrous oxide remains visible as a qualitative minimal-sedation option. Neither produces a dose. Their presentation must not imply that they are preferred, sufficient, or safe for an individual child.

## Monitoring and preparation basis

The AAP/AAPD guideline provides the system-level basis:

- presedation evaluation for conditions that increase risk;
- focused airway examination;
- understanding of medication effects and interactions;
- trained staff able to rescue from a deeper level of sedation;
- age and size appropriate airway and venous-access equipment;
- appropriate medications and reversal agents;
- physiologic monitoring during and after the procedure;
- a properly equipped and staffed recovery area.

The console surfaces SOAPME preparation as user-confirmed checks:

- **S:** suction;
- **O:** oxygen;
- **A:** age and size appropriate airway equipment;
- **P:** pharmacy supplies, intended medication, and rescue medications;
- **M:** monitors selected for intended and actual sedation depth;
- **E:** special equipment and immediate rescue access.

For ketamine, the Royal Children's Hospital source requires pulse oximetry and cardiac monitoring, clinician attendance until recovery is well established, and close observation of airway and chest movement.

## Recovery basis

The application records criteria but never declares recovery or authorizes discharge.

- The AAP/AAPD basis is recovery to the presedation level of consciousness before discharge from medical or dental supervision, with appropriate discharge instructions.
- The Royal Children's Hospital ketamine basis is return to premorbid neurologic baseline, with age-appropriate ambulation and verbalization before discharge when applicable.
- Local recovery, observation, supervision, escalation, and discharge rules remain controlling.

## Required clinical and quality review

All of the following approvals are mandatory before the regulatory gate can open:

1. Named Pediatric emergency medicine physician.
2. Named Pediatric pharmacy reviewer.
3. Named Pediatric anesthesia reviewer.
4. Nursing and sedation operations review.
5. Human factors and accessibility review.
6. Privacy and security review.
7. Regulatory and quality-system owner approval.

## Regulatory gate

The route must remain **Clinical review / not approved for clinical use** until reviewers approve medication provenance, age boundaries, formulas, cap application, one-decimal display, risk prompts, monitoring language, recovery criteria, documentation output, and release controls. Passing software tests does not open the regulatory gate.

## Open clinical-review questions

1. Reconcile the AAP December 2025 reaffirmation statement with the AAPD June 2025 reaffirmation statement and record the approved citation form.
2. Confirm that the Texas Children's Hospital source supports every displayed intranasal midazolam and fentanyl range, onset, total cap, per-naris cap, and population statement.
3. Confirm whether any local jurisdiction requires a ketamine age boundary stricter than the displayed source exclusion.
4. Confirm whether the IV ketamine warning for total doses above 2.5 mg/kg should be added before release.
5. Confirm the approved scope and wording for nitrous oxide and local-anesthesia comparison without adding an unsupported calculation.
6. Confirm monitoring language by intended and actual sedation depth, including capnography and documentation frequency.
7. Confirm local recovery and discharge criteria, credentialing, staffing, rescue, fasting, consent, and escalation requirements.
