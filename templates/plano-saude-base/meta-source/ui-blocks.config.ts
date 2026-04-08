import { BlockConfig } from './template.types';

/**
 * BLOCOS DE UI — Gerado por ai-bootstrap-meta
 */
export const UI_BLOCKS: BlockConfig[] = [
  {
    id: 'dados-solicitante',
    label: 'Dados do Solicitante',
    selector: 'app-dados-solicitante',
    optional: false,
    readOnlyInSteps: ['detalhes', 'analise-rh', 'revisao'],
  },
  {
    id: 'dados-gestor',
    label: 'Dados do Gestor',
    selector: 'app-dados-gestor',
    optional: true,
    readOnlyInSteps: ['detalhes', 'analise-rh', 'revisao'],
  },
  {
    id: 'dados-solicitacao',
    label: 'Dados da Solicitação',
    selector: 'app-dados-solicitacao',
    optional: false,
    readOnlyInSteps: ['analise-rh', 'revisao'],
  },
  {
    id: 'observacao',
    label: 'Observação',
    selector: 'app-observacao',
    optional: false,
    readOnlyInSteps: ['revisao'],
  },
  {
    id: 'dados-dependentes',
    label: 'Dados dos Dependentes',
    selector: 'hst-selectable-table',
    optional: false,
    readOnlyInSteps: [],
  },
];
