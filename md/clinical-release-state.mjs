export function resolveClinicalReleaseState(record, buildMode) {
  const publicReleaseApproved =
    buildMode === 'production' &&
    record.publicReleaseApproved === true &&
    record.status === 'Available';

  return Object.freeze({
    publicReleaseApproved,
    status: publicReleaseApproved ? 'Available' : 'Clinical review',
    detail: publicReleaseApproved
      ? `Clinical review completed ${record.clinicalReviewDate}`
      : 'Not approved for clinical use',
    applicationLabel: publicReleaseApproved
      ? `Available / clinical review completed ${record.clinicalReviewDate}`
      : 'Clinical review / not approved for clinical use'
  });
}
