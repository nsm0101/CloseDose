export type ToolRoute = '/PIG/' | '/RSI/' | '/PMD/';

export interface ToolCatalogEntry {
  id: 'pig' | 'rsi' | 'pmd';
  shortTitle: 'PIG' | 'RSI' | 'PMD';
  title: string;
  scope: string;
  status: 'Available';
  route: ToolRoute;
}

export const toolCatalog = [
  {
    id: 'pig',
    shortTitle: 'PIG',
    title: 'Pediatric Airway Reference Calculator',
    scope: 'Age-based airway sizing and equipment reference.',
    status: 'Available',
    route: '/PIG/'
  },
  {
    id: 'rsi',
    shortTitle: 'RSI',
    title: 'Pediatric Emergency RSI Reference and Calculator',
    scope: 'Weight-based medication reference, timed sequence support, and checklists.',
    status: 'Available',
    route: '/RSI/'
  },
  {
    id: 'pmd',
    shortTitle: 'PMD',
    title: 'PREtendingMD: PEM FlowMaster',
    scope: 'Administrator-approved, real-time pediatric emergency medicine shift workflow and handoff support.',
    status: 'Available',
    route: '/PMD/'
  }
] satisfies readonly ToolCatalogEntry[];
