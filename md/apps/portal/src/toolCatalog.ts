import releaseManifest from '../../../clinical-release-manifest.json';

export type ToolStatus = 'Planned' | 'Clinical review' | 'Available';
export type ToolAudience = 'Community EM' | 'Rural EM' | 'PEM';
export type ToolCategory =
  | 'Airway and RSI'
  | 'Procedures and comfort'
  | 'Transfer and workflow'
  | 'Specialty emergencies';
export type ToolRoute =
  | '/PIG/'
  | '/RSI/'
  | '/PMD/'
  | '/DEVICE/'
  | '/SEDATION/'
  | '/TRANSFER/'
  | '/AGITATION/'
  | '/NEWBORN/'
  | '/CHD/'
  | '/INGESTION/'
  | '/CLOCK/';

export interface ToolCatalogEntry {
  id:
    | 'pig'
    | 'rsi'
    | 'pmd'
    | 'device'
    | 'sedation'
    | 'transfer'
    | 'agitation'
    | 'newborn'
    | 'chd'
    | 'ingestion'
    | 'clock';
  shortTitle: string;
  title: string;
  task: string;
  status: ToolStatus;
  audience: readonly ToolAudience[];
  category: ToolCategory;
  evidenceVersion: string | null;
  clinicalReviewDate: string | null;
  canonicalRoute: ToolRoute;
  publiclyAccessible: boolean;
}

export const toolCatalog = [
  {
    id: 'pig',
    shortTitle: 'PIG',
    title: 'Pediatric Airway Reference Calculator',
    task: 'Size pediatric airway equipment by age.',
    status: 'Available',
    audience: ['Community EM', 'PEM'],
    category: 'Airway and RSI',
    evidenceVersion: 'PIG-CAR ef67724',
    clinicalReviewDate: null,
    canonicalRoute: '/PIG/',
    publiclyAccessible: true
  },
  {
    id: 'rsi',
    shortTitle: 'RSI',
    title: 'Pediatric Emergency RSI Reference and Calculator',
    task: 'Calculate RSI medication references and run airway checklists.',
    status: 'Available',
    audience: ['Community EM', 'PEM'],
    category: 'Airway and RSI',
    evidenceVersion: 'CC-RSI a309bda',
    clinicalReviewDate: null,
    canonicalRoute: '/RSI/',
    publiclyAccessible: true
  },
  {
    id: 'pmd',
    shortTitle: 'PMD',
    title: 'PREtendingMD: PEM FlowMaster',
    task: 'Coordinate an administrator-approved PEM shift and handoff.',
    status: 'Available',
    audience: ['PEM'],
    category: 'Transfer and workflow',
    evidenceVersion: 'Production 700958d',
    clinicalReviewDate: null,
    canonicalRoute: '/PMD/',
    publiclyAccessible: true
  },
  {
    id: 'device',
    shortTitle: 'DEVICE',
    title: 'Peds Device Rescue',
    task: 'Troubleshoot a pediatric tracheostomy emergency and prepare handoff.',
    status: releaseManifest.device.status as ToolStatus,
    audience: ['Community EM', 'PEM'],
    category: 'Specialty emergencies',
    evidenceVersion: 'NTSP pediatric algorithm, review January 2024',
    clinicalReviewDate: releaseManifest.device.clinicalReviewDate,
    canonicalRoute: '/DEVICE/',
    publiclyAccessible: releaseManifest.device.publicReleaseApproved
  },
  {
    id: 'sedation',
    shortTitle: 'SEDATION',
    title: 'Pediatric Comfort and Sedation Console',
    task: 'Compare comfort, analgesia, anxiolysis, and sedation reference options.',
    status: releaseManifest.sedation.status as ToolStatus,
    audience: ['Community EM', 'PEM'],
    category: 'Procedures and comfort',
    evidenceVersion: 'AAP/AAPD guideline, reaffirmed December 2025',
    clinicalReviewDate: releaseManifest.sedation.clinicalReviewDate,
    canonicalRoute: '/SEDATION/',
    publiclyAccessible: releaseManifest.sedation.publicReleaseApproved
  },
  {
    id: 'transfer',
    shortTitle: 'TRANSFER',
    title: 'Peds Transfer Ready',
    task: 'Prepare stabilization, transport, family, records, and verbal handoff.',
    status: 'Planned',
    audience: ['Community EM', 'Rural EM'],
    category: 'Transfer and workflow',
    evidenceVersion: 'EMSC Pediatric Interfacility Transfer Guide, 2026',
    clinicalReviewDate: null,
    canonicalRoute: '/TRANSFER/',
    publiclyAccessible: false
  },
  {
    id: 'agitation',
    shortTitle: 'AGITATION',
    title: 'Agitation SafeSteps',
    task: 'Structure neurodiversity-aware de-escalation and reassessment.',
    status: 'Planned',
    audience: ['Community EM', 'PEM'],
    category: 'Specialty emergencies',
    evidenceVersion: 'BRACHA-S study, 2025',
    clinicalReviewDate: null,
    canonicalRoute: '/AGITATION/',
    publiclyAccessible: false
  },
  {
    id: 'newborn',
    shortTitle: 'NEWBORN',
    title: 'Sick Newborn: First 15 Minutes',
    task: 'Organize parallel stabilization actions for an undifferentiated neonate.',
    status: 'Planned',
    audience: ['Community EM', 'PEM'],
    category: 'Specialty emergencies',
    evidenceVersion: null,
    clinicalReviewDate: null,
    canonicalRoute: '/NEWBORN/',
    publiclyAccessible: false
  },
  {
    id: 'chd',
    shortTitle: 'CHD',
    title: 'CHD Emergency Navigator',
    task: 'Frame known congenital heart physiology and cardiology handoff.',
    status: 'Planned',
    audience: ['Community EM', 'PEM'],
    category: 'Specialty emergencies',
    evidenceVersion: 'AAP CHD point-of-care tools',
    clinicalReviewDate: null,
    canonicalRoute: '/CHD/',
    publiclyAccessible: false
  },
  {
    id: 'ingestion',
    shortTitle: 'INGESTION',
    title: 'High-Risk Ingestion Navigator',
    task: 'Prepare imaging, consultation, mitigation, removal, or transfer steps.',
    status: 'Planned',
    audience: ['Community EM', 'PEM'],
    category: 'Specialty emergencies',
    evidenceVersion: 'Poison Control button battery guidance',
    clinicalReviewDate: null,
    canonicalRoute: '/INGESTION/',
    publiclyAccessible: false
  },
  {
    id: 'clock',
    shortTitle: 'CLOCK',
    title: 'PEM Reassessment Clock',
    task: 'Track local-only treatments and institution-configurable reassessments.',
    status: 'Planned',
    audience: ['PEM'],
    category: 'Transfer and workflow',
    evidenceVersion: null,
    clinicalReviewDate: null,
    canonicalRoute: '/CLOCK/',
    publiclyAccessible: false
  }
] satisfies readonly ToolCatalogEntry[];
