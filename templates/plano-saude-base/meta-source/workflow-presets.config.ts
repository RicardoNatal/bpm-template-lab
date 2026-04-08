import { WorkflowPreset } from './template.types';

/**
 * PRESETS (VARIANTES) — Gerado por ai-bootstrap-meta
 */
export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: 'completo',
    label: 'Fluxo Completo',
    description: 'Configuração completa com todas as etapas e funcionalidades habilitadas',
    enabledSteps: [
      'solicitacao',
      'revisao',
      'analise-rh',
      'detalhes',
    ],
    enabledFeatures: [
      'gestor-validation',
      'dependentes-management',
      'planos-integration',
      'readonly-fields',
      'observacao-rh',
      'senior-xt-integration',
    ],
    disabledBlocks: [],
    disabledBlockInstances: [],
  },
  {
    id: 'simplificado',
    label: 'Fluxo Simplificado',
    description: 'Configuração simplificada apenas com solicitação e detalhes, sem validação de RH',
    enabledSteps: ['solicitacao', 'detalhes'],
    enabledFeatures: ['planos-integration', 'readonly-fields', 'senior-xt-integration'],
    disabledBlocks: ['dados-gestor'],
    disabledBlockInstances: [],
  },
  {
    id: 'sem-dependentes',
    label: 'Sem Dependentes',
    description: 'Fluxo completo mas sem gerenciamento de dependentes',
    enabledSteps: [
      'solicitacao',
      'revisao',
      'analise-rh',
      'detalhes',
    ],
    enabledFeatures: [
      'gestor-validation',
      'planos-integration',
      'readonly-fields',
      'observacao-rh',
      'senior-xt-integration',
    ],
    disabledBlocks: ['dados-dependentes'],
    disabledBlockInstances: [],
  },
];
