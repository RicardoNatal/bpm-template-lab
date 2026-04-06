import { BlockConfig } from '@template/types/template.types';

/**
 * BLOCOS DE UI
 *
 * Cada entrada corresponde a um componente Angular reutilizável do diretório
 * src/app/shared/components/.
 *
 * O campo 'readOnlyInSteps' declara explicitamente em quais etapas o bloco
 * é exibido como somente-leitura, sem necessidade de ler o componente.
 *
 * O campo 'optional: true' indica que o bloco pode ser removido por um gerador
 * ao derivar presets menores.
 */
export const UI_BLOCKS: BlockConfig[] = [
  {
    id: 'dados-solicitante',
    label: 'Dados do Solicitante',
    selector: 'app-dados-solicitante',
    optional: false,
    readOnlyInSteps: ['revisao', 'analise-rh', 'detalhes'],
  },
  {
    id: 'beneficio-atual',
    label: 'Benefício Atual',
    selector: 'app-beneficio-atual',
    optional: false,
    readOnlyInSteps: ['revisao', 'analise-rh', 'detalhes'],
  },
  {
    id: 'dados-solicitacao',
    label: 'Dados da Solicitação',
    selector: 'app-dados-solicitacao',
    optional: false,
    readOnlyInSteps: ['analise-rh', 'detalhes'],
  },
  {
    id: 'observacao-rh',
    label: 'Observação do RH',
    selector: 'app-observacao',
    optional: true,
    // Na revisão: exibido como somente-leitura (preenchido pelo RH na etapa anterior).
    // Nos detalhes: também somente-leitura.
    // Na análise-rh: editável pelo RH.
    readOnlyInSteps: ['revisao', 'detalhes'],
  },
  {
    id: 'observacao-solicitante',
    label: 'Observação do Solicitante',
    selector: 'app-observacao',
    optional: true,
    readOnlyInSteps: ['revisao', 'analise-rh', 'detalhes'],
  },
  {
    id: 'termo-adesao',
    label: 'Termo de Adesão',
    selector: 'app-termo-adesao',
    optional: true,
    readOnlyInSteps: ['revisao', 'analise-rh', 'detalhes'],
  },
];
