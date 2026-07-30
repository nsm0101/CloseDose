# PEM Reassessment Clock clinical specification

## Intended population

Emergency clinicians managing serial reassessment after treatments such as
procedural sedation, anaphylaxis, croup, asthma, or status epilepticus.

## Clinical purpose

Record identifier-free treatments and reassessments locally, surface the next
institution-configured expected clinical check, and produce a copyable timeline
for the medical record.

## Evidence baseline

No universal observation or disposition rules are accepted. Each institution
must version and approve its pathway-specific timing configuration and source
mapping before use.

## Explicit non-goals

- No universal observation period, disposition rule, diagnosis, medication
  selection, dose calculation, or automatic discharge readiness statement.
- No patient identifiers, timestamps tied to identity, saved case, or audit log.

## Questions requiring clinical resolution

- Which events are stopwatch intervals versus wall-clock chart events?
- Which reassessments are expected, optional, or escalation triggers per pathway?
- How are late, skipped, repeated, and corrected events represented?
- Which timeline language is safe to copy without implying an assessment occurred?

## Required named reviewers

PEM, pathway-specific specialty owners, pediatric pharmacy, emergency nursing,
quality and safety, clinical informatics, institutional policy, health
information management, and regulatory review.

## Simulation acceptance cases

- An anaphylaxis configuration starts a reviewed reassessment timer without
  presenting a universal disposition time.
- A procedural sedation case separates medication time, monitoring, and recovery
  criteria.
- A late asthma reassessment is marked overdue without inventing findings.
- Reset and tab closure remove all local timeline state.

## Release boundary

Remain Planned until signed institutional configurations, pathway review,
timer-boundary tests, chart-copy review, privacy review, and simulations pass.
