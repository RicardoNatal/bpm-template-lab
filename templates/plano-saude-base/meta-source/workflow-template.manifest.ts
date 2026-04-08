import { WorkflowTemplateManifest } from './template.types';
import { WORKFLOW_STEPS } from './workflow-steps.config';
import { WORKFLOW_PRESETS } from './workflow-presets.config';
import { UI_BLOCKS } from './ui-blocks.config';
import { UI_BLOCK_INSTANCES } from './ui-block-instances.config';
import { FIELD_SCHEMAS } from './field-schemas.config';
import { PROCESS_VARIABLES } from './process-variables.config';
import { WORKFLOW_ROUTES } from './workflow-routes.config';
import { DEPENDENCY_RULES } from './dependencies.config';

/**
 * MANIFESTO DO TEMPLATE — plano-saude-base
 *
 * Gerado por ai-bootstrap-meta. Revise e ajuste conforme necessário.
 */
export const WORKFLOW_TEMPLATE_MANIFEST: WorkflowTemplateManifest = {
  templateId: 'plano-saude-base',
  name: 'Plano de Saúde Base',
  description: 'Fluxo BPM para solicitação e gestão de planos de saúde com integração Senior XT, incluindo validação de gestores, gerenciamento de dependentes e observações de RH',
  version: '1.0.0',
  baseModel: 'completo',

  steps: WORKFLOW_STEPS,
  blocks: UI_BLOCKS,
  blockInstances: UI_BLOCK_INSTANCES,
  fieldSchemas: FIELD_SCHEMAS,
  processVariables: PROCESS_VARIABLES,
  routes: WORKFLOW_ROUTES,
  presets: WORKFLOW_PRESETS,
  dependencies: DEPENDENCY_RULES,

  features: [
  {
    id: 'gestor-validation',
    label: 'Validação de Gestor',
    description: 'Verifica se o usuário possui papel de gestor na plataforma G7',
    optional: true,
    enabledBy: ['solicitacao'],
  },
  {
    id: 'dependentes-management',
    label: 'Gerenciamento de Dependentes',
    description: 'Funcionalidade para seleção e gestão de dependentes do plano de saúde',
    optional: false,
    enabledBy: ['solicitacao', 'revisao'],
  },
  {
    id: 'planos-integration',
    label: 'Integração com Planos',
    description: 'Integração com serviço SeniorXT para buscar planos de saúde disponíveis',
    optional: false,
    enabledBy: ['solicitacao', 'revisao'],
  },
  {
    id: 'readonly-fields',
    label: 'Campos Somente Leitura',
    description: 'Desabilita campos para visualização apenas',
    optional: false,
    enabledBy: ['revisao', 'analise-rh', 'detalhes'],
  },
  {
    id: 'observacao-rh',
    label: 'Observação do RH',
    description: 'Campo de observação específico para análise do RH',
    optional: true,
    enabledBy: ['revisao', 'analise-rh'],
  },
  {
    id: 'senior-xt-integration',
    label: 'Integração SeniorXT',
    description: 'Integração com sistema SeniorXT para gravação de dados do plano de saúde',
    optional: true,
    enabledBy: ['analise-rh'],
  },
  ],
};
