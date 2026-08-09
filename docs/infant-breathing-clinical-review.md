# Infant Breathing Guide clinical release record

- Route: `/infant-breathing/`
- Audience: caregivers of infants from birth to under 12 months
- Status: **NOT APPROVED FOR PUBLIC RELEASE — pending named pediatric clinical approval of the exact `/infant-breathing/` artifact.**
- Evidence review date: 2026-08-07
- Implementation branch: `codex/infant-breathing-guide`

## Reviewed scope

Approval must cover the representative animations, parent-facing descriptions, emergency actions, WHO fast-breathing screening cutoffs, 60-second counting workflow, copied observation summary, and the statement that absence of a depicted sign does not rule out illness.

## Evidence set

- Royal Children’s Hospital Melbourne, respiratory severity assessment: <https://www.rch.org.au/clinicalguide/guideline_index/Assessment_of_severity_of_respiratory_conditions/>
- Stanford Newborn Nursery, lungs and chest clinical photo guide: <https://med.stanford.edu/newborns/professional-education/photo-gallery/lungs-chest.html>
- WHO, *Oxygen therapy for children*: <https://iris.who.int/bitstream/handle/10665/204584/9789241549554_eng.pdf?sequence=1>
- Norfolk and Norwich University Hospitals NHS, newborn and infant physical examination guideline: <https://www.nnuh.nhs.uk/publication/download/newborn-and-infant-physical-examination-nipe-ca4069-v6>
- Children’s Health Queensland, bronchiolitis clinical guideline: <https://www.childrens.health.qld.gov.au/__data/assets/pdf_file/0038/176879/CHQ-GDL-60012-bronchiolitis.pdf>
- Children’s Hospital of Philadelphia, signs of respiratory distress: <https://www.chop.edu/conditions-diseases/signs-respiratory-distress-children>

## Representative release tests

1. The untouched default state says that no observations have been entered and does not reassure the caregiver that the baby is safe.
2. The emergency warning remains visible without animation or color and gives U.S. and international emergency-number wording.
3. Comfortable breathing remains abdomen-led and does not display recession, nasal flare, throat tug, grunting, or head bobbing.
4. Intercostal and subcostal recession appear as localized inspiratory grooves rather than colored bands.
5. Nasal flare moves the alar tissue outward during inspiration without changing facial expression.
6. Grunting appears only during expiration; head bobbing remains a small respiration-synchronous nod.
7. Signs can be selected independently and the copy states that they can occur in different combinations.
8. A breathing-rate result is not classified until a full 60-second calm count is complete; birth–59 days uses a 60/min fast-breathing cutoff and 2–11 months uses 50/min.
9. A fast completed count with no selected effort sign uses rate-specific guidance and does not claim that the belly is working harder.
10. Selecting an emergency sign during an active count immediately cancels the timer and records the rate as not measured because emergency signs were selected.
11. A result below the screening cutoff explicitly states that it does not rule out breathing distress.
12. The guide does not load analytics and does not submit age, selected signs, tap timing, rate, triage level, or copied summaries.

## Required approval before merge

- Clinical reviewer name and credentials: **Pending**
- Clinical role/organization: **Pending**
- Approval date: **Pending**
- Approved scope or limitations: **Pending**
- Decision: **Pending**

## Rebuild the self-hosted stylesheet

The guide does not execute Tailwind’s production CDN. Rebuild its pinned static stylesheet from the repository root with:

```sh
npx --yes tailwindcss@3.4.17 \
  -i docs/infant-breathing-tailwind.input.css \
  -o public/infant-breathing/infant-breathing.css \
  --content public/infant-breathing/index.html \
  --minify
```
