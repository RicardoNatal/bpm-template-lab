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
 * MANIFESTO DO TEMPLATE — ENTRYPOINT PRINCIPAL
 *
 * Esta constante é a fonte única de verdade para geradores e IA.
 * Importar WORKFLOW_TEMPLATE_MANIFEST é suficiente para obter toda a
 * estrutura necessária para derivar variantes menores do fluxo.
 *
 * Checklist para um gerador derivar um preset:
 * 1. Escolher PresetId em presets[]
 * 2. Filtrar steps[] pelos enabledSteps do preset
 * 3. Filtrar routes[] pelos steps ativos
 * 4. Remover blockInstances[] dos steps desativados e de disabledBlockInstances
 * 5. Remover subBlockSchemas de fieldSchemas[] conforme disabledBlocks
 * 6. Filtrar processVariables[] que requiredFeature não está em enabledFeatures
 * 7. Ajustar validators em fieldSchemas[] onde validationVariable=true
 * 8. Percorrer dependencies[] para cascatas transitivas
 */
export const WORKFLOW_TEMPLATE_MANIFEST: WorkflowTemplateManifest = {
  templateId: 'modelo-padrao-va-vr',
  name: 'Troca de Benefício VA/VR',
  description:
    'Fluxo BPM para solicitação de troca de vale alimentação/refeição (VA/VR) ' +
    'pelo colaborador, com análise do RH e gravação do benefício no sistema Senior.',
  version: '1.0.0',
  baseModel: 'modelo-3',

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
      id: 'buscar-dados-solicitante',
      label: 'Busca de dados do solicitante',
      description:
        'Consulta os dados do colaborador logado via Senior XT (retornaSolicitante). ' +
        'Preenche automaticamente o bloco dados-solicitante na etapa de solicitação.',
      optional: false,
    },
    {
      id: 'buscar-beneficio-atual',
      label: 'Busca de benefício atual',
      description:
        'Consulta o benefício VA/VR atual do colaborador (retornaBeneficioAtual). ' +
        'Exibido como informação no bloco beneficio-atual.',
      optional: false,
    },
    {
      id: 'buscar-vales-empresa',
      label: 'Busca de vales disponíveis por empresa',
      description:
        'Consulta os vales configurados para a empresa do colaborador (retornaValesPorEmpresa). ' +
        'Popula as opções de troca no bloco dados-solicitacao. ' +
        'Exige exatamente 2 vales configurados para a empresa.',
      optional: false,
      enabledBy: ['buscar-beneficio-atual'],
    },
    {
      id: 'gravar-beneficio',
      label: 'Gravação do novo benefício no Senior',
      description:
        'Persiste a troca de benefício no sistema Senior (gravaBeneficioNovo) ' +
        'quando o RH aciona a ação "Aprovar" na etapa analise-rh.',
      optional: true,
      enabledBy: ['analise-rh-com-aprovacao'],
    },
    {
      id: 'revisao-pelo-solicitante',
      label: 'Revisão pelo solicitante',
      description:
        'Etapa em que o solicitante revisa os dados preenchidos antes de seguir. ' +
        'Reutiliza SolicitacaoComponent em modo review (variantOf: solicitacao). ' +
        'O componente detecta o modo via route data, não por URL. ' +
        'Remove esta feature para ir direto da solicitação para a análise.',
      optional: true,
    },
    {
      id: 'analise-rh-com-aprovacao',
      label: 'Análise de RH com Aprovar/Revisar',
      description:
        'Etapa de análise do RH com duas ações disponíveis: Aprovar (grava benefício) ' +
        'ou Revisar (devolve ao solicitante). Controlado pelo nextAction.name no submit.',
      optional: true,
    },
    {
      id: 'observacao-rh',
      label: 'Observação do RH',
      description:
        'Campo de observação preenchido pelo RH na etapa analise-rh. ' +
        'Exibido como somente-leitura na revisão e nos detalhes. ' +
        'Obrigatório apenas quando a ação é "Revisar".',
      optional: true,
    },
  ],

  allowedOperations: [
    'disable_step',
    'disable_route',
    'disable_feature',
    'remove_block',
    'remove_block_instance',
    'add_field',
    'remove_field',
    'change_validation',
    'rename_label',
    'filter_process_variables_by_feature',
    'derive_variant_from_preset',
  ],
};

