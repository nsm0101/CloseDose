export type ToolRoute = '/PIG/' | '/RSI/';

export interface ToolCatalogEntry {
  id: 'pig' | 'rsi';
  shortTitle: 'PIG' | 'RSI';
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
  }
] satisfies readonly ToolCatalogEntry[];
