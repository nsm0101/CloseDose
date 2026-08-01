# Pediatric Airway Scenario Guide V2 Clinical Specification

Status: **Public clinical-review reference / not approved for clinical use**

The public `/AIRWAY-SCENARIOS/` application presents a patient-first flow that combines exact age, verified weight, clinical scenario, patient factors, source-mapped cautions, medication considerations, pearls, pitfalls, and exceptional cases. The imported medication values remain byte-pinned. Public availability does not represent completion of the named clinical or regulatory reviews below, so the application retains a prominent `Clinical review / not approved for clinical use` boundary.

## Intended population

Emergency clinicians caring for infants, children, and adolescents through 18 years of age, especially community emergency physicians who infrequently perform pediatric tracheal intubation. The candidate covers the nine scenarios already present in the imported source: sepsis or septic shock, stable trauma, hypotensive trauma, stable elevated intracranial pressure, unstable elevated intracranial pressure, status asthmaticus, status epilepticus, congenital heart disease, and neonates.

## Evidence baseline

The candidate patient-context prompts use these primary or authoritative sources:

- [Surviving Sepsis Campaign International Guidelines for the Management of Sepsis and Septic Shock in Children, 2026](https://sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-pediatric-guidelines). The filterable recommendations report insufficient evidence for intubation based only on fluid-refractory, catecholamine-resistant septic shock without respiratory failure and conditionally suggest against etomidate when intubating children with sepsis or septic shock.
- [Brain Trauma Foundation Guidelines for the Management of Pediatric Severe TBI, Third Edition](https://braintrauma.org/coma/guidelines/pediatric). The guideline addresses cerebral perfusion, intracranial pressure, hyperosmolar therapy, and avoidance of routine prophylactic severe hyperventilation.
- [FDA QUELICIN succinylcholine prescribing information, reference ID 5069935](https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/008845s080lbl.pdf). The label contains the pediatric hyperkalemic rhabdomyolysis boxed warning and contraindications for skeletal muscle myopathy, injury after the acute phase, and malignant hyperthermia susceptibility.
- [ESAIC and British Journal of Anaesthesia joint neonatal and infant airway guideline, 2023](https://pubmed.ncbi.nlm.nih.gov/38065762/). The guideline addresses airway assessment, neuromuscular blockade, age-adapted video laryngoscopy, apneic oxygenation, rescue supraglottic airway use, attempt limitation, and waveform end-tidal carbon dioxide confirmation.
- [NEAR4KIDS pediatric emergency-department intubation study](https://pubmed.ncbi.nlm.nih.gov/34923705/). Shock and limited mouth opening were independently associated with adverse tracheal-intubation events.
- [Pediatric ED intubation-attempt study](https://pubmed.ncbi.nlm.nih.gov/34872932/). Additional attempts were associated with higher adjusted odds of adverse events.
- [AHA and AAP Pediatric Advanced Life Support guideline, 2025](https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-advanced-life-support). Relevant sections include hypotensive hemorrhagic shock, single-ventricle and shunt-dependent physiology, and pediatric resuscitation.
- [AARC and PALISI Pediatric Critical Asthma guideline, 2025](https://pubmed.ncbi.nlm.nih.gov/40323974/).
- [AAP Status Epilepticus point-of-care reference, 2024](https://publications.aap.org/pediatriccare/article/doi/10.1542/aap.ppcqr.396479/153/Status-Epilepticus).
- Imported medication values, scenario classifications, and medication limitations remain pinned to CC-RSI commit `a309bdaa7b7736051753a852b274b295ae00c67d` during review.

Source inclusion is not approval of the candidate wording. Every displayed inference and every connection between a patient factor and a medication must be validated by the named reviewers.

## Explicit non-goals

- Do not diagnose the child or determine that intubation is indicated.
- Do not select a best medication, hide a medication, or imply that one scenario label overrides an allergy, contraindication, physiology, or institutional policy.
- Do not infer age from weight or weight from age.
- Do not replace PALS, NRP, trauma, difficult-airway, sepsis, critical-asthma, status-epilepticus, congenital-cardiac, pharmacy, or institutional guidance.
- Do not cover tube sizing, ventilator setup, post-intubation sedation, transport stabilization, or longitudinal treatment. Existing independent tools retain those responsibilities.
- Do not store identifiers, patient context, selections, calculations, or activity.
- Do not use AI, analytics, accounts, external runtime calls, or cross-tool patient state.

## Candidate flow and clinical boundary

The candidate asks for exact age, an explicit age unit, independently verified weight, one imported scenario, and optional patient factors. It then presents:

1. Physiology or clinical priorities to protect.
2. Age-, scenario-, and factor-derived cautions with an evidence identifier.
3. The imported scenario medication classification and unchanged weight calculation.
4. The imported scenario rationale.
5. Team-briefing pearls and pitfalls.
6. Expandable imported drug limitations and paralysis information.
7. Evidence metadata adjacent to the output.

Patient factors never remove or promote an option. They add qualitative review prompts. A warning is not a diagnosis, medication order, or substitute for the current product label and institutional policy.

## Questions requiring clinical resolution

1. Are the nine imported scenario classifications still acceptable, including the distinction between stable and unstable trauma or elevated intracranial pressure?
2. Are all imported induction-agent rankings, rationales, and calculated doses current for US emergency practice?
3. Should the imported neonatal scenario list propofol as preferred, ketamine as alternative, etomidate as avoided, and succinylcholine as avoided? Neonatology, pediatric anesthesia, PEM, and pharmacy must resolve this before the clinical-review warning can be removed.
4. The imported component applies procedural-sedation language about ketamine in infants younger than 3 months to crash intubation. Should that language be removed, rewritten, or explicitly separated from RSI?
5. Does the imported mitochondrial-disease statement about propofol have an appropriate primary source and scope for a single emergency induction dose, or should it remain a specialist-review prompt only?
6. Is the 2026 SCCM conditional suggestion against etomidate presented with sufficient evidence-strength context and without converting a conditional guideline statement into an absolute contraindication?
7. Are injury timing, burn, denervation, upper-motor-neuron injury, hyperkalemia, myopathy, and malignant-hyperthermia prompts fully aligned with the current FDA label and local policy?
8. Should the age model use calendar age, corrected gestational age, postmenstrual age, or another neonatal field for preterm infants?
9. Which congenital-heart fields are mandatory before any lesion-specific content can appear? The candidate currently refuses lesion-specific advice.
10. Are the asthma and status-epilepticus pearls sufficiently bounded and source mapped?
11. Should exact age and verified weight be mandatory before the imported dose calculation is visible?
12. Does the combined patient-specific output constitute time-critical treatment direction requiring additional regulatory controls?

## Required named reviewers

Removal of the clinical-review warning or representation as clinically approved requires all of these recorded approvals:

1. Pediatric Emergency Medicine physician.
2. Pediatric anesthesiology or pediatric airway specialist.
3. Pediatric critical care physician.
4. Pediatric pharmacist.
5. Neonatology reviewer for neonatal and young-infant content.
6. Pediatric trauma or neurosurgical reviewer for trauma and severe TBI content.
7. Pediatric pulmonology or critical-asthma reviewer.
8. Pediatric neurology reviewer for status epilepticus.
9. Congenital cardiology or cardiac critical-care reviewer.
10. Emergency nursing, respiratory therapy, and human-factors reviewer.
11. Accessibility reviewer.
12. Institutional airway, formulary, and policy owner.
13. Privacy and security reviewer.
14. Regulatory and quality-system owner.

## Simulation acceptance cases

- A community emergency physician enters a 2-month-old, selects septic shock, and finds the young-infant and sepsis hemodynamic cautions within three interactions and 20 seconds.
- A child with suspected Duchenne muscular dystrophy surfaces the FDA succinylcholine warning without hiding other medication options.
- A patient with hyperkalemia plus a burn after the acute phase surfaces both source-mapped cautions without merging them into one unsupported claim.
- A hypotensive trauma case keeps perfusion and hemorrhage-control priorities ahead of the imported medication classification.
- A severe TBI case highlights avoidance of secondary hypoxemia, hypotension, and routine prophylactic severe hyperventilation.
- A status-epilepticus case warns that neuromuscular blockade can mask motor activity and that airway control does not replace seizure treatment.
- A congenital-heart case requires lesion, stage, baseline saturation, ventricular function, and shunt dependence before lesion-specific targets.
- A neonatal scenario selected for an entered age older than 28 days produces a context mismatch rather than silently changing the age.
- Keyboard-only, screen-reader, 200% zoom, 320 px width, light-mode, and dark-mode simulations preserve reading order and visible selected states.

## Release boundary

By explicit product-owner direction on 2026-08-01, the canonical public route renders the integrated flow and keeps it visibly marked `Clinical review / not approved for clinical use`. The older imported component remains byte-pinned in source for provenance but is not shipped in the route artifact.

Passing software tests and public availability do not constitute clinical approval. The warning may be removed only after every open question is dispositioned, named reviewers approve the exact commit and source matrix, community-ED and PEM simulations pass, and regulatory review authorizes the intended use.
