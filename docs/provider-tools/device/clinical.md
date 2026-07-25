# Peds Device Rescue Clinical Review Specification

## Status

Clinical review / not approved for clinical use.

Every open question and required review below is a release gate. None is an implementation placeholder.

## Intended population

The intended population is a child with an existing tracheostomy who has an acute airway, oxygenation, or ventilation concern and is being assessed by a trained responder.

The application supports a structured review of immediate rescue actions, device identification, tracheostomy troubleshooting, equipment preparation, and an identifier-free transfer handoff.

## Excluded situations

The application does not cover:

- Initial tracheostomy placement.
- Elective tracheostomy changes.
- Diagnosis of the cause of deterioration.
- Selection of medication, dose, route, or fluid.
- Procedures performed by responders who are not trained for them.
- Replacement of local emergency response, resuscitation, difficult-airway, or transfer protocols.
- Collection of identifiers or creation of a clinical record.

## Source provenance

- Organization: National Tracheostomy Safety Project.
- Source: Pediatric emergency tracheostomy algorithm.
- Source review date carried in the application: January 2024.
- Application version: 0.1.0.
- Application status: Clinical review / not approved for clinical use.

The source metadata is returned with every deterministic guidance result so downstream presentation cannot silently separate the guidance from its provenance and review status.

## Algorithm mapping

| Review input | Application mapping |
| --- | --- |
| Every branch | Call for help, apply high-flow oxygen to both the face and tracheostomy or stoma, then open the airway. |
| Breathing not assessed | Show no breathing conclusion or branch-specific breathing support guidance until the responder explicitly records present or absent. |
| Suction passage not assessed | Show no tube-patency conclusion until the responder explicitly records whether the catheter passes. |
| Suction catheter passes | Report the tube as patent, continue ABCDE assessment, and warn that partial obstruction may remain. |
| Suction catheter does not pass | Remove attachments, remove the inner cannula if present, attempt suction, and deflate the cuff if present. |
| Breathing absent | Surface five rescue breaths and CPR if there are no signs of life. |
| Upper airway patent | Face ventilation with stoma occlusion. |
| Upper airway obstructed | Stoma ventilation. |
| Upper-airway patency unknown | An advanced airway responder sees both face ventilation with stoma occlusion and stoma ventilation routes. |
| Established tracheostomy | Tube change language is limited to a trained responder. |
| Fresh or uncertain tracheostomy | Warn against blind reinsertion and call for immediate expert airway help. |
| Transfer | Build an identifier-free handoff containing device details, caregiver-confirmed baseline, observed failure, actions, current oxygenation and ventilation route, accompanying equipment, and explicit unknown values. |

The application applies these explicit mappings only. It does not infer a diagnosis.

## Dangerous-action boundary

- A responder must not interpret the interface as procedural credentialing.
- Tracheostomy tube change language appears only for a trained responder when the tracheostomy is established.
- Blind reinsertion is explicitly prohibited when the tracheostomy is fresh or its maturity is uncertain.
- Fresh or uncertain tracheostomy state requires immediate expert airway help.
- Unknown upper-airway patency exposes both ventilation routes only for an advanced airway responder.
- The application does not calculate, rank, or infer a diagnosis.

## Required reviewers

Release requires recorded approval from all of these reviewer roles:

1. Named pediatric emergency medicine physician (mandatory and not interchangeable with pediatric critical care).
2. Pediatric critical care physician.
3. Pediatric otolaryngology or pediatric tracheostomy clinical lead.
4. Pediatric respiratory therapy lead.
5. Pediatric tracheostomy nursing lead.
6. Resuscitation education or simulation lead.
7. Clinical safety and human-factors reviewer.
8. Accessibility reviewer.
9. Regulatory and quality-system owner.
10. Privacy and security reviewer.

## Regulatory gate

The regulatory and quality-system owner must determine the applicable product classification, intended-use wording, documentation controls, change control, clinical validation evidence, complaint handling, and release authority before any clinical deployment.

The application must remain marked `Clinical review / not approved for clinical use` and excluded from a production clinical route until the required reviews, open questions, simulated acceptance cases, and release evidence are recorded as approved.

## Open clinical-review questions

Each question requires a documented disposition before release:

1. Does `high-flow oxygen to both the face and tracheostomy or stoma` exactly match the approved source wording and local equipment practice?
2. Does the displayed ordering of airway opening, device assessment, suction, cuff deflation, rescue breaths, ventilation, and CPR preserve the intended source sequence in every simulated branch?
3. What locally approved definition of an `established` tracheostomy must be presented to responders?
4. Is the boundary between trained responder and advanced airway responder sufficiently clear for each deployment setting?
5. What approved assessment defines upper-airway patency for this tool, and should the interface display it?
6. Does the source require additional distinctions for uncuffed tubes, fenestrated tubes, speaking valves, humidification devices, or other attachments?
7. Does the five-rescue-breath and CPR wording require local resuscitation terminology or escalation detail?
8. Which child-specific equipment must be included in the transfer checklist for each care setting?
9. Are caregiver questions appropriate, complete, and usable during high-stress simulated scenarios?
10. Does the handoff contain all required transfer information while remaining free of identifiers?

## Simulated acceptance cases

All simulated cases begin with help, high-flow oxygen to both face and tracheostomy or stoma, and airway opening.

1. Initial state before breathing or suction observation: show no tube-patency or breathing conclusion.
2. Established tracheostomy, breathing present, suction catheter passes, upper airway patent: report a patent tube, continue ABCDE assessment, warn about possible partial obstruction, and show face ventilation with stoma occlusion.
3. Established cuffed tracheostomy with inner cannula, suction catheter does not pass: remove attachments, remove the inner cannula, attempt suction, deflate the cuff, and limit tube change language to a trained responder.
4. Breathing absent with no signs of life: show five rescue breaths and CPR.
5. Obstructed upper airway: show stoma ventilation.
6. Unknown upper-airway patency: show both ventilation routes for an advanced airway responder.
7. Fresh tracheostomy with a catheter that does not pass: prohibit blind reinsertion and call for immediate expert airway help.
8. Uncertain tracheostomy maturity: prohibit blind reinsertion and call for immediate expert airway help.
9. Handoff with omitted values: render each missing value as `unknown`, include required transfer categories, and include no identifier field.
10. Invalid enumerated input: stop processing with a descriptive validation error.

Simulation evidence must include keyboard-only use, screen-reader review, narrow mobile viewport review, interruption and resumption, and high-stress comprehension testing.
