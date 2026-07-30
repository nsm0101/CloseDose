# CHD Emergency Navigator clinical specification

## Intended population

Infants, children, and adolescents with known or suspected high-risk congenital
heart physiology presenting to an emergency clinician.

## Clinical purpose

Capture lesion, repair stage, baseline oxygen saturation, relevant medications,
and current presentation; explain reviewed physiology, complications, cautions,
supportive options, and a cardiology handoff.

## Evidence baseline

- AAP congenital heart defects point-of-care tools.
- Lesion-specific cardiology and cardiac critical-care sources for Fontan,
  Glenn, shunt-dependent, tetralogy spells, and ductal-dependent neonatal shock
  must be selected and versioned before implementation.

## Explicit non-goals

- No lesion diagnosis, target saturation, fluid amount, vasoactive selection,
  prostaglandin directive, ventilation setting, or transfer destination.
- No instruction to normalize a baseline value blindly.
- No identifiers or saved cardiac history.

## Questions requiring clinical resolution

- Which lesion and repair-stage combinations can share a physiology model?
- Which baseline saturation and preload or afterload cautions require direct
  cardiology confirmation?
- How are thrombosis, arrhythmia, plastic bronchitis, protein-losing enteropathy,
  shunt obstruction, and ductal closure represented without overdiagnosis?

## Required named reviewers

PEM, pediatric cardiology, cardiac critical care, congenital cardiac anesthesia,
pediatric pharmacy, transport medicine, emergency nursing, institutional policy,
and regulatory review.

## Simulation acceptance cases

- A Fontan patient with low baseline saturation displays physiology and preload
  cautions before generic normalization language.
- A shunt-dependent infant surfaces shunt failure and immediate cardiology
  escalation without diagnosing obstruction.
- An unknown repair-stage case requests clarification and produces an explicit
  unknown in handoff.
- A tetralogy spell case surfaces reviewed supportive options within 20 seconds.

## Release boundary

Remain Planned until lesion-state rules, every caution, pharmacy content,
cardiology handoff, regulatory classification, and simulation are approved.
