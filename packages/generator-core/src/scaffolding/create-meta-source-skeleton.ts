import * as path from 'node:path';
import { writeFile } from '../io/index.js';
import type { InferredRoute, InferredComponent } from '../types/meta-source.types.js';

/**
 * Gera arquivos placeholder em meta-source/ para um novo template.
 *
 * Os arquivos seguem o mesmo padrão estrutural do VA/VR base, mas com
 * dados genéricos que PRECISAM de revisão manual.
 */
export function createMetaSourceSkeleton(
  metaSourceDir: string,
  templateId: string,
  routes: InferredRoute[],
  components: InferredComponent[],
): string[] {
  const created: string[] = [];

  // template.types.ts
  writeFile(
    path.join(metaSourceDir, 'template.types.ts'),
    generateTemplateTypes(templateId, routes),
  );
  created.push('meta-source/template.types.ts');

  // workflow-steps.config.ts
  writeFile(
    path.join(metaSourceDir, 'workflow-steps.config.ts'),
    generateStepsConfig(routes),
  );
  created.push('meta-source/workflow-steps.config.ts');

  // workflow-routes.config.ts
  writeFile(
    path.join(metaSourceDir, 'workflow-routes.config.ts'),
    generateRoutesConfig(routes),
  );
  created.push('meta-source/workflow-routes.config.ts');

  // workflow-presets.config.ts
  writeFile(
    path.join(metaSourceDir, 'workflow-presets.config.ts'),
    generatePresetsConfig(routes),
  );
  created.push('meta-source/workflow-presets.config.ts');

  // ui-blocks.config.ts
  writeFile(
    path.join(metaSourceDir, 'ui-blocks.config.ts'),
    generateBlocksConfig(),
  );
  created.push('meta-source/ui-blocks.config.ts');

  // ui-block-instances.config.ts
  writeFile(
    path.join(metaSourceDir, 'ui-block-instances.config.ts'),
    generateBlockInstancesConfig(),
  );
  created.push('meta-source/ui-block-instances.config.ts');

  // field-schemas.config.ts
  writeFile(
    path.join(metaSourceDir, 'field-schemas.config.ts'),
    generateFieldSchemasConfig(),
  );
  created.push('meta-source/field-schemas.config.ts');

  // process-variables.config.ts
  writeFile(
    path.join(metaSourceDir, 'process-variables.config.ts'),
    generateProcessVariablesConfig(),
  );
  created.push('meta-source/process-variables.config.ts');

  // dependencies.config.ts
  writeFile(
    path.join(metaSourceDir, 'dependencies.config.ts'),
    generateDependenciesConfig(),
  );
  created.push('meta-source/dependencies.config.ts');

  // workflow-template.manifest.ts
  writeFile(
    path.join(metaSourceDir, 'workflow-template.manifest.ts'),
    generateManifest(templateId),
  );
  created.push('meta-source/workflow-template.manifest.ts');

  return created;
}

// ---------------------------------------------------------------------------
// Geradores de conteúdo dos arquivos
// ---------------------------------------------------------------------------

function toStepId(route: InferredRoute): string {
  return route.path.replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\/]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function generateTemplateTypes(templateId: string, routes: InferredRoute[]): string {
  const stepIds = routes.map(toStepId);
  const stepUnion = stepIds.length > 0
    ? stepIds.map((s) => `'${s}'`).join(' | ')
    : `'step-1' | 'step-2'`;

  return `/**
 * TEMPLATE TYPES — ${templateId}
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Tipos declarativos do template. Adapte os union types conforme
 * a realidade do seu fluxo BPM.
 */

// TODO: Ajustar StepId conforme as etapas reais do seu fluxo
export type StepId = ${stepUnion};

// TODO: Definir os BlockId conforme os blocos de UI do projeto
export type BlockId = 'bloco-placeholder-1' | 'bloco-placeholder-2';

// TODO: Definir as FeatureId conforme as funcionalidades do projeto
export type FeatureId = 'feature-placeholder-1' | 'feature-placeholder-2';

// TODO: Definir os PresetId conforme as variantes desejadas
export type PresetId = 'modelo-completo' | 'modelo-basico';

export type StepMode = 'edit' | 'readonly' | 'review';

export type ProcessVariableType = 'string' | 'number' | 'boolean' | 'json';

export type OperationType =
  | 'disable_step'
  | 'disable_route'
  | 'disable_feature'
  | 'remove_block'
  | 'remove_block_instance'
  | 'rename_label'
  | 'filter_process_variables_by_feature'
  | 'derive_variant_from_preset';

export interface StepConfig {
  id: StepId;
  label: string;
  route: string;
  componentClass: string;
  mode: StepMode;
  blocks: BlockId[];
  features: FeatureId[];
  optional: boolean;
  variantOf?: StepId;
}

export interface BlockConfig {
  id: BlockId;
  label: string;
  selector: string;
  optional: boolean;
  readOnlyInSteps: StepId[];
}

export interface FeatureConfig {
  id: FeatureId;
  label: string;
  description: string;
  optional: boolean;
  enabledBy?: FeatureId[];
}

export interface ProcessVariableConfig {
  key: string;
  label: string;
  type: ProcessVariableType;
  writtenBy: StepId[];
  readBy: StepId[];
  notification: boolean;
  optional: boolean;
  sourceComponent?: string;
  sourceField?: string;
  requiredFeature?: FeatureId;
}

export interface WorkflowPreset {
  id: PresetId;
  label: string;
  description: string;
  enabledSteps: StepId[];
  enabledFeatures: FeatureId[];
  disabledBlocks: BlockId[];
  disabledBlockInstances: string[];
}

export type BlockInstanceId = string;

export interface BlockInstanceConfig {
  instanceId: BlockInstanceId;
  blockId: BlockId;
  hostType: 'page' | 'block';
  hostId: StepId | BlockId;
  selector: string;
  templateFile: string;
  dataAttribute: BlockInstanceId;
  optional: boolean;
  inputs?: Record<string, any>;
}

export type ValidatorName = 'required' | 'maxLength' | 'minLength' | 'requiredTrue' | 'pattern';

export interface ValidatorConstraint {
  name: ValidatorName;
  value?: any;
}

export interface FieldSchema {
  id: string;
  label: string;
  type: 'select' | 'checkbox' | 'textarea' | 'text' | 'number' | 'date';
  validators: ValidatorConstraint[];
  optional: boolean;
  validationVariable: boolean;
  processVariableKey?: string;
  featureDependency?: FeatureId;
  readOnlyInSteps: StepId[];
}

export interface BlockFieldSchema {
  blockId: BlockId;
  fields: FieldSchema[];
  subBlocks?: SubBlockSchema[];
}

export interface SubBlockSchema {
  blockId: BlockId;
  selector: string;
  fields: FieldSchema[];
  optional: boolean;
}

export interface StepRouteConfig {
  stepId: StepId;
  path: string;
  modulePath: string;
  moduleName: string;
  hasNote?: string;
  routeData: { stepId: StepId; mode: StepMode };
}

export interface StepRouteData {
  stepId: StepId;
  mode: StepMode;
}

export type DependencyEntityType = 'step' | 'route' | 'feature' | 'block' | 'blockInstance' | 'field' | 'processVariable';

export interface DependencyRule {
  source: { type: DependencyEntityType; id: string };
  target: { type: DependencyEntityType; id: string };
  description: string;
}

export interface WorkflowTemplateManifest {
  templateId: string;
  name: string;
  description: string;
  version: string;
  baseModel: PresetId;
  steps: StepConfig[];
  features: FeatureConfig[];
  blocks: BlockConfig[];
  blockInstances: BlockInstanceConfig[];
  fieldSchemas: BlockFieldSchema[];
  processVariables: ProcessVariableConfig[];
  routes: StepRouteConfig[];
  presets: WorkflowPreset[];
  dependencies: DependencyRule[];
  allowedOperations: OperationType[];
}
`;
}

function generateStepsConfig(routes: InferredRoute[]): string {
  const steps = routes.length > 0
    ? routes.map((r) => {
        const id = toStepId(r);
        const label = toPascalCase(id).replace(/([a-z])([A-Z])/g, '$1 $2');
        const componentClass = r.componentName || `${toPascalCase(id)}Component`;
        return `  {
    id: '${id}',
    label: '${label}',
    route: '${r.path}',
    componentClass: '${componentClass}',
    mode: 'edit',
    blocks: [], // TODO: mapear blocos desta etapa
    features: [], // TODO: mapear features desta etapa
    optional: false,
  }`;
      }).join(',\n')
    : `  {
    id: 'step-1', // TODO: substituir pelo ID real
    label: 'Etapa 1',
    route: 'step-1',
    componentClass: 'Step1Component',
    mode: 'edit',
    blocks: [],
    features: [],
    optional: false,
  },
  {
    id: 'step-2', // TODO: substituir pelo ID real
    label: 'Etapa 2',
    route: 'step-2',
    componentClass: 'Step2Component',
    mode: 'edit',
    blocks: [],
    features: [],
    optional: false,
  }`;

  return `import { StepConfig } from './template.types';

/**
 * CONFIGURAÇÃO DE STEPS
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Cada step representa uma etapa do fluxo BPM.
 * Revise: blocks, features, mode, optional, variantOf.
 */
export const WORKFLOW_STEPS: StepConfig[] = [
${steps},
];
`;
}

function generateRoutesConfig(routes: InferredRoute[]): string {
  const routeEntries = routes.length > 0
    ? routes.map((r) => {
        const id = toStepId(r);
        const modulePath = r.modulePath || `./modules/${id}/${id}.module`;
        const moduleName = r.moduleName || `${toPascalCase(id)}Module`;
        return `  {
    stepId: '${id}',
    path: '${r.path}',
    modulePath: '${modulePath}',
    moduleName: '${moduleName}',
    routeData: { stepId: '${id}', mode: 'edit' }, // TODO: ajustar mode
  }`;
      }).join(',\n')
    : `  {
    stepId: 'step-1', // TODO: substituir
    path: 'step-1',
    modulePath: './modules/step-1/step-1.module',
    moduleName: 'Step1Module',
    routeData: { stepId: 'step-1', mode: 'edit' },
  }`;

  return `import { StepId, StepRouteConfig } from './template.types';

/**
 * CONFIGURAÇÃO DE ROTAS × STEPS
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 */
export const WORKFLOW_ROUTES: StepRouteConfig[] = [
${routeEntries},
];

export const STEP_ROUTE_MAP: Record<StepId, string> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.stepId, r.path]),
) as Record<StepId, string>;

export const ROUTE_STEP_MAP: Record<string, StepId> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.path, r.stepId]),
) as Record<string, StepId>;
`;
}

function generatePresetsConfig(routes: InferredRoute[]): string {
  const stepIds = routes.length > 0
    ? routes.map(toStepId)
    : ['step-1', 'step-2'];

  const stepsArray = stepIds.map((s) => `'${s}'`).join(', ');

  return `import { WorkflowPreset } from './template.types';

/**
 * CONFIGURAÇÃO DE PRESETS
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Presets definem quais steps, features e blocos ficam ativos em cada variante.
 * O preset 'modelo-completo' deve ser o baseModel no manifest.
 *
 * TODO: Definir presets reais com enabledSteps, enabledFeatures, disabledBlocks
 */
export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: 'modelo-completo',
    label: 'Modelo Completo',
    description: 'Todas as etapas e funcionalidades ativas. Modelo base.',
    enabledSteps: [${stepsArray}],
    enabledFeatures: [], // TODO: listar todas as features
    disabledBlocks: [],
    disabledBlockInstances: [],
  },
  {
    id: 'modelo-basico',
    label: 'Modelo Básico',
    description: 'TODO: definir o escopo do modelo básico',
    enabledSteps: [${stepIds[0] ? `'${stepIds[0]}'` : "'step-1'"}],
    enabledFeatures: [], // TODO: listar features ativas neste preset
    disabledBlocks: [], // TODO: listar blocos desabilitados
    disabledBlockInstances: [], // TODO: listar instâncias desabilitadas
  },
];
`;
}

function generateBlocksConfig(): string {
  return `import { BlockConfig } from './template.types';

/**
 * CONFIGURAÇÃO DE BLOCOS DE UI
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Cada bloco é um componente Angular reutilizável exibido em uma ou mais etapas.
 *
 * TODO: Mapear os blocos reais do projeto:
 * - Identificar componentes que aparecem em múltiplas etapas
 * - Definir se são opcionais
 * - Definir em quais etapas são somente-leitura
 */
export const UI_BLOCKS: BlockConfig[] = [
  {
    id: 'bloco-placeholder-1',
    label: 'Bloco Placeholder 1',
    selector: 'app-bloco-placeholder-1', // TODO: selector real
    optional: false,
    readOnlyInSteps: [],
  },
  {
    id: 'bloco-placeholder-2',
    label: 'Bloco Placeholder 2',
    selector: 'app-bloco-placeholder-2', // TODO: selector real
    optional: true,
    readOnlyInSteps: [],
  },
];
`;
}

function generateBlockInstancesConfig(): string {
  return `import { BlockInstanceConfig } from './template.types';

/**
 * INSTÂNCIAS FÍSICAS DE BLOCOS
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Cada instância mapeia um uso concreto de um bloco em um template HTML.
 *
 * TODO: Para cada bloco real, criar uma instância por cada etapa onde ele aparece:
 * - instanceId: '<blockId>-<hostId>'
 * - templateFile: caminho relativo ao project/
 * - dataAttribute: deve corresponder ao data-template-block-instance="..." no HTML
 *
 * O HTML correspondente precisa conter:
 *   <app-meu-bloco data-template-block-instance="instanceId">...</app-meu-bloco>
 */
export const UI_BLOCK_INSTANCES: BlockInstanceConfig[] = [
  // TODO: Criar instâncias reais. Exemplo:
  // {
  //   instanceId: 'bloco-placeholder-1-step-1',
  //   blockId: 'bloco-placeholder-1',
  //   hostType: 'page',
  //   hostId: 'step-1',
  //   selector: 'app-bloco-placeholder-1',
  //   templateFile: 'src/app/modules/step-1/step-1.component.html',
  //   dataAttribute: 'bloco-placeholder-1-step-1',
  //   optional: false,
  // },
];
`;
}

function generateFieldSchemasConfig(): string {
  return `import { BlockFieldSchema } from './template.types';

/**
 * SCHEMAS DE CAMPOS POR BLOCO
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Define os campos de formulário de cada bloco com validators e metadata.
 *
 * TODO: Mapear os campos reais de cada bloco:
 * - id: formControlName do campo
 * - validators: Validators.required, maxLength, etc.
 * - processVariableKey: se o campo alimenta uma variável de processo
 */
export const FIELD_SCHEMAS: BlockFieldSchema[] = [
  // TODO: Exemplo:
  // {
  //   blockId: 'bloco-placeholder-1',
  //   fields: [
  //     {
  //       id: 'campo1',
  //       label: 'Campo 1',
  //       type: 'text',
  //       validators: [{ name: 'required' }],
  //       optional: false,
  //       validationVariable: false,
  //       readOnlyInSteps: [],
  //     },
  //   ],
  // },
];
`;
}

function generateProcessVariablesConfig(): string {
  return `import { ProcessVariableConfig } from './template.types';

/**
 * VARIÁVEIS DE PROCESSO
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Cada variável representa um dado trafegado entre etapas do processo BPM.
 *
 * TODO: Mapear as variáveis reais:
 * - key: chave usada em VariaveisProcessoG7DTO
 * - writtenBy/readBy: quais steps escrevem/lêem
 * - sourceComponent: componente Angular que produz o valor
 * - requiredFeature: feature que deve estar ativa para a variável existir
 */
export const PROCESS_VARIABLES: ProcessVariableConfig[] = [
  // TODO: Exemplo:
  // {
  //   key: 'nomeVariavel',
  //   label: 'Nome da Variável',
  //   type: 'string',
  //   writtenBy: ['step-1'],
  //   readBy: ['step-2'],
  //   notification: false,
  //   optional: false,
  //   sourceComponent: 'AppMeuBlocoComponent',
  //   sourceField: 'campo1',
  // },
];
`;
}

function generateDependenciesConfig(): string {
  return `import { DependencyRule } from './template.types';

/**
 * REGRAS DE DEPENDÊNCIA ENTRE ENTIDADES
 *
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Define cascatas: ao desabilitar source, target também deve ser removido.
 *
 * TODO: Mapear dependências reais:
 * - feature → step (feature desabilitada remove step)
 * - step → route (step desabilitado remove rota)
 * - block → blockInstance (bloco desabilitado remove suas instâncias)
 * - feature → processVariable (feature desabilitada remove variável)
 */
export const DEPENDENCY_RULES: DependencyRule[] = [
  // TODO: Exemplo:
  // {
  //   source: { type: 'step', id: 'step-2' },
  //   target: { type: 'route', id: 'step-2' },
  //   description: 'Step step-2 removido implica remoção da rota step-2',
  // },
];
`;
}

function generateManifest(templateId: string): string {
  return `import { WorkflowTemplateManifest } from './template.types';
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
 * ⚠️  GERADO AUTOMATICAMENTE PELO BOOTSTRAP — REQUER REVISÃO MANUAL
 *
 * Esta constante é a fonte única de verdade para geradores.
 * Importar WORKFLOW_TEMPLATE_MANIFEST é suficiente para obter toda a
 * estrutura necessária para derivar variantes.
 */
export const WORKFLOW_TEMPLATE_MANIFEST: WorkflowTemplateManifest = {
  templateId: '${templateId}',
  name: 'TODO: Nome do Template', // TODO: definir nome
  description: 'TODO: Descrição do template', // TODO: definir descrição
  version: '1.0.0',
  baseModel: 'modelo-completo',

  steps: WORKFLOW_STEPS,
  blocks: UI_BLOCKS,
  blockInstances: UI_BLOCK_INSTANCES,
  fieldSchemas: FIELD_SCHEMAS,
  processVariables: PROCESS_VARIABLES,
  routes: WORKFLOW_ROUTES,
  presets: WORKFLOW_PRESETS,
  dependencies: DEPENDENCY_RULES,

  features: [
    // TODO: Definir features reais do template
    {
      id: 'feature-placeholder-1',
      label: 'Feature Placeholder 1',
      description: 'TODO: descrever esta feature',
      optional: false,
    },
    {
      id: 'feature-placeholder-2',
      label: 'Feature Placeholder 2',
      description: 'TODO: descrever esta feature',
      optional: true,
    },
  ],

  allowedOperations: [
    'disable_step',
    'disable_route',
    'disable_feature',
    'remove_block',
    'remove_block_instance',
    'rename_label',
    'filter_process_variables_by_feature',
    'derive_variant_from_preset',
  ],
};
`;
}
