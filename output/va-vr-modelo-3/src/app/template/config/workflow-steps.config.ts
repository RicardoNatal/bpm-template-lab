import { StepConfig } from '@template/types/template.types';

/**
 * ETAPAS DO FLUXO
 *
 * Definição declarativa de cada etapa do BPM.
 *
 * Decisão de arquitetura: a etapa 'revisao' é explicitamente declarada como
 * uma variante de 'solicitacao' (variantOf: 'solicitacao'). Ambas usam
 * SolicitacaoComponent; o modo 'review' é injetado via route data (stepId/mode),
 * acessível pelo componente via ActivatedRoute.
 *
 * Para gerar o modelo-2 ou modelo-1, um gerador deve:
 * 1. Filtrar as etapas com base no preset escolhido
 * 2. Remover rotas, módulos e referências das etapas desabilitadas
 * 3. As etapas 'optional: false' nunca podem ser removidas
 */
export const WORKFLOW_STEPS: StepConfig[] = [
  {
    id: 'solicitacao',
    label: 'Solicitação',
    route: 'solicitacao',
    componentClass: 'SolicitacaoComponent',
    mode: 'edit',
    blocks: ['dados-solicitante', 'beneficio-atual', 'dados-solicitacao'],
    features: [
      'buscar-dados-solicitante',
      'buscar-beneficio-atual',
      'buscar-vales-empresa',
    ],
    optional: false,
  },
  {
    id: 'revisao',
    label: 'Revisão pelo Solicitante',
    route: 'revisao',
    componentClass: 'SolicitacaoComponent',
    mode: 'review',
    blocks: [
      'dados-solicitante',
      'beneficio-atual',
      'dados-solicitacao',
      'observacao-rh',
    ],
    features: ['revisao-pelo-solicitante', 'observacao-rh'],
    optional: true,
    // Reutiliza SolicitacaoComponent com mode='review'.
    // O componente detecta o modo via route data (stepId), não por URL.
    variantOf: 'solicitacao',
  },
  {
    id: 'analise-rh',
    label: 'Análise RH',
    route: 'analise-rh',
    componentClass: 'AnaliseRhComponent',
    mode: 'edit',
    blocks: [
      'dados-solicitante',
      'beneficio-atual',
      'dados-solicitacao',
      'observacao-rh',
    ],
    features: ['gravar-beneficio', 'analise-rh-com-aprovacao', 'observacao-rh'],
    optional: true,
  },
  {
    id: 'detalhes',
    label: 'Detalhes',
    route: 'detalhes',
    componentClass: 'DetalhesComponent',
    mode: 'readonly',
    blocks: [
      'dados-solicitante',
      'beneficio-atual',
      'dados-solicitacao',
      'observacao-rh',
    ],
    features: [],
    optional: true,
  },
];
