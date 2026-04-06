import { WorkflowPreset } from '@template/types/template.types';

/**
 * PRESETS DO TEMPLATE
 *
 * Cada preset define um recorte funcional do modelo base (modelo-3).
 * A estratégia de geração de variantes é subtrativa: parte-se do modelo completo
 * e removem-se as partes não listadas no preset alvo.
 *
 * Um gerador deve:
 * 1. Tomar o modelo-3 como base
 * 2. Desativar etapas não listadas em enabledSteps
 * 3. Desativar features não listadas em enabledFeatures
 * 4. Remover blocos listados em disabledBlocks
 * 5. Ajustar rotas e importações de módulos
 */
export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: 'modelo-3',
    label: 'Modelo Completo',
    description:
      'Fluxo completo: Solicitação → Revisão → Análise RH → Detalhes. ' +
      'Inclui revisão pelo solicitante antes da análise e gravação do benefício na aprovação.',
    enabledSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
    enabledFeatures: [
      'buscar-dados-solicitante',
      'buscar-beneficio-atual',
      'buscar-vales-empresa',
      'gravar-beneficio',
      'revisao-pelo-solicitante',
      'analise-rh-com-aprovacao',
      'observacao-rh',
    ],
    disabledBlocks: [],
    disabledBlockInstances: [],
  },
  {
    id: 'modelo-2',
    label: 'Modelo Intermediário',
    description:
      'Fluxo sem etapa de revisão: Solicitação → Análise RH → Detalhes. ' +
      'Adequado para fluxos onde a revisão pelo solicitante não é necessária.',
    enabledSteps: ['solicitacao', 'analise-rh', 'detalhes'],
    enabledFeatures: [
      'buscar-dados-solicitante',
      'buscar-beneficio-atual',
      'buscar-vales-empresa',
      'gravar-beneficio',
      'analise-rh-com-aprovacao',
      'observacao-rh',
    ],
    disabledBlocks: [],
    disabledBlockInstances: [
      // Instância de observação RH na solicitação é [hidden]=!isRevisao → sem revisão, remover.
      'observacao-rh-solicitacao',
    ],
  },
  {
    id: 'modelo-1',
    label: 'Modelo Básico',
    description:
      'Fluxo mínimo: Solicitação → Detalhes. ' +
      'Sem análise de RH intermediária. Adequado para processos de baixa complexidade ' +
      'onde a aprovação é automática ou feita por outro mecanismo externo ao fluxo.',
    enabledSteps: ['solicitacao', 'detalhes'],
    enabledFeatures: [
      'buscar-dados-solicitante',
      'buscar-beneficio-atual',
      'buscar-vales-empresa',
    ],
    disabledBlocks: ['observacao-rh'],
    disabledBlockInstances: [
      'observacao-rh-solicitacao',
      'observacao-rh-analise-rh',
      'observacao-rh-detalhes',
    ],
  },
];
