import releaseManifest from '../../../clinical-release-manifest.json';
import registry from '../../../tools.registry.json';

/**
 * The portal catalog is derived from `md/tools.registry.json`, the single source
 * of truth shared with the build, redirects, docs, and contract tests. Adding a
 * tool means adding a registry entry; nothing in this file changes.
 *
 * Release state for gated tools still comes from `clinical-release-manifest.json`
 * at runtime, so a tool awaiting named clinical approvals cannot be surfaced as
 * available by editing the registry alone.
 */
export type ToolStatus = 'Planned' | 'Clinical review' | 'Available';
export type ToolAudience = 'Community EM' | 'Rural EM' | 'PEM';
export type ToolCategory =
  | 'Airway and RSI'
  | 'Procedures and comfort'
  | 'Transfer and workflow'
  | 'Specialty emergencies';

export interface ToolCatalogEntry {
  id: string;
  shortTitle: string;
  title: string;
  task: string;
  status: ToolStatus;
  audience: readonly ToolAudience[];
  category: ToolCategory;
  evidenceVersion: string | null;
  clinicalReviewDate: string | null;
  canonicalRoute: string;
  publiclyAccessible: boolean;
}

type GatedReleaseRecord = {
  status: string;
  publicReleaseApproved: boolean;
  clinicalReviewDate: string | null;
};

const gatedReleases = releaseManifest as unknown as Record<string, GatedReleaseRecord>;

type RegistryTool = (typeof registry.tools)[number];

function releaseStateFor(tool: RegistryTool): Pick<
  ToolCatalogEntry,
  'status' | 'clinicalReviewDate' | 'publiclyAccessible'
> {
  const release = tool.release as { kind: string; manifestKey?: string };

  if (release.kind === 'gated') {
    const record = gatedReleases[release.manifestKey as string];
    if (!record) {
      throw new Error(`missing clinical release record for gated tool: ${tool.id}`);
    }
    return {
      status: record.status as ToolStatus,
      clinicalReviewDate: record.clinicalReviewDate,
      publiclyAccessible: record.publicReleaseApproved
    };
  }

  if (release.kind === 'planned') {
    return { status: 'Planned', clinicalReviewDate: null, publiclyAccessible: false };
  }

  return { status: 'Available', clinicalReviewDate: null, publiclyAccessible: true };
}

export const categoryOrder = registry.categoryOrder as readonly ToolCategory[];

export const toolCatalog: readonly ToolCatalogEntry[] = registry.tools.map((tool) => ({
  id: tool.id,
  shortTitle: tool.shortTitle,
  title: tool.title,
  task: tool.task,
  audience: tool.audience as readonly ToolAudience[],
  category: tool.category as ToolCategory,
  evidenceVersion: tool.evidenceVersion,
  canonicalRoute: tool.route,
  ...releaseStateFor(tool)
}));
