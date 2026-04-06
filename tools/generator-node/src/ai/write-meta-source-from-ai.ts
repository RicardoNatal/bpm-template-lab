import * as path from 'node:path';
import * as fs from 'node:fs';
import type { AiBootstrapResponse } from './schemas/ai-bootstrap.schema.js';

/**
 * Escreve os arquivos TypeScript de meta-source/ a partir da resposta da IA.
 *
 * Gera arquivos seguindo exatamente o mesmo padrão estrutural do VA/VR base.
 * Retorna a lista de arquivos criados.
 */
export function writeMetaSourceFromAi(
  metaSourceDir: string,
  data: AiBootstrapResponse,
): string[] {
  if (!fs.existsSync(metaSourceDir)) {
    fs.mkdirSync(metaSourceDir, { recursive: true });
  }

  const created: string[] = [];

  const write = (fileName: string, content: string): void => {
    fs.writeFileSync(path.join(metaSourceDir, fileName), content, 'utf-8');
    created.push(`meta-source/${fileName}`);
  };

  write('template.types.ts', genTemplateTypes(data));
  write('workflow-steps.config.ts', genStepsConfig(data));
  write('workflow-routes.config.ts', genRoutesConfig(data));
  write('workflow-presets.config.ts', genPresetsConfig(data));
  write('ui-blocks.config.ts', genBlocksConfig(data));
  write('ui-block-instances.config.ts', genBlockInstancesConfig(data));
  write('field-schemas.config.ts', genFieldSchemasConfig(data));
  write('process-variables.config.ts', genProcessVariablesConfig(data));
  write('dependencies.config.ts', genDependenciesConfig(data));
  write('workflow-template.manifest.ts', genManifest(data));

  return created;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function q(s: string): string { return `'${s}'`; }
function union(items: string[]): string {
  return items.length > 0 ? items.map(q).join(' | ') : `'placeholder'`;
}
function indent(level: number): string { return '  '.repeat(level); }

function toArray(items: string[], level: number): string {
  if (items.length === 0) return '[]';
  if (items.length <= 3) return `[${items.map(q).join(', ')}]`;
  return `[\n${items.map((i) => `${indent(level + 1)}${q(i)},`).join('\n')}\n${indent(level)}]`;
}

// ---------------------------------------------------------------------------
// Geradores de conteúdo
// ---------------------------------------------------------------------------

function genTemplateTypes(d: AiBootstrapResponse): string {
  const stepIds = d.steps.map((s) => s.id);
  const blockIds = d.blocks.map((b) => b.id);
  const featureIds = d.features.map((f) => f.id);
  const presetIds = d.presets.map((p) => p.id);

  return `/**
 * TEMPLATE TYPES — ${d.templateId}
 *
 * Gerado por ai-bootstrap-meta. Revise e ajuste conforme necessário.
 */

export type StepId = ${union(stepIds)};
export type BlockId = ${union(blockIds)};
export type FeatureId = ${union(featureIds)};
export type PresetId = ${union(presetIds)};

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
}
`;
}

function genStepsConfig(d: AiBootstrapResponse): string {
  const entries = d.steps.map((s) => {
    const variantLine = s.variantOf ? `\n    variantOf: ${q(s.variantOf)},` : '';
    return `  {
    id: ${q(s.id)},
    label: ${q(s.label)},
    route: ${q(s.route)},
    componentClass: ${q(s.componentClass)},
    mode: ${q(s.mode)},
    blocks: ${toArray(s.blocks, 2)},
    features: ${toArray(s.features, 2)},
    optional: ${s.optional},${variantLine}
  }`;
  }).join(',\n');

  return `import { StepConfig } from './template.types';

/**
 * ETAPAS DO FLUXO — Gerado por ai-bootstrap-meta
 */
export const WORKFLOW_STEPS: StepConfig[] = [
${entries},
];
`;
}

function genRoutesConfig(d: AiBootstrapResponse): string {
  const entries = d.routes.map((r) => {
    const noteLine = r.hasNote ? `\n    hasNote: ${q(r.hasNote)},` : '';
    return `  {
    stepId: ${q(r.stepId)},
    path: ${q(r.path)},
    modulePath: ${q(r.modulePath)},
    moduleName: ${q(r.moduleName)},${noteLine}
    routeData: { stepId: ${q(r.routeData.stepId)}, mode: ${q(r.routeData.mode)} },
  }`;
  }).join(',\n');

  return `import { StepId, StepRouteConfig } from './template.types';

/**
 * CONFIGURAÇÃO DE ROTAS × STEPS — Gerado por ai-bootstrap-meta
 */
export const WORKFLOW_ROUTES: StepRouteConfig[] = [
${entries},
];

export const STEP_ROUTE_MAP: Record<StepId, string> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.stepId, r.path]),
) as Record<StepId, string>;

export const ROUTE_STEP_MAP: Record<string, StepId> = Object.fromEntries(
  WORKFLOW_ROUTES.map((r) => [r.path, r.stepId]),
) as Record<string, StepId>;
`;
}

function genPresetsConfig(d: AiBootstrapResponse): string {
  const entries = d.presets.map((p) => `  {
    id: ${q(p.id)},
    label: ${q(p.label)},
    description: ${q(p.description)},
    enabledSteps: ${toArray(p.enabledSteps, 2)},
    enabledFeatures: ${toArray(p.enabledFeatures, 2)},
    disabledBlocks: ${toArray(p.disabledBlocks, 2)},
    disabledBlockInstances: ${toArray(p.disabledBlockInstances, 2)},
  }`).join(',\n');

  return `import { WorkflowPreset } from './template.types';

/**
 * PRESETS (VARIANTES) — Gerado por ai-bootstrap-meta
 */
export const WORKFLOW_PRESETS: WorkflowPreset[] = [
${entries},
];
`;
}

function genBlocksConfig(d: AiBootstrapResponse): string {
  const entries = d.blocks.map((b) => `  {
    id: ${q(b.id)},
    label: ${q(b.label)},
    selector: ${q(b.selector)},
    optional: ${b.optional},
    readOnlyInSteps: ${toArray(b.readOnlyInSteps, 2)},
  }`).join(',\n');

  return `import { BlockConfig } from './template.types';

/**
 * BLOCOS DE UI — Gerado por ai-bootstrap-meta
 */
export const UI_BLOCKS: BlockConfig[] = [
${entries},
];
`;
}

function genBlockInstancesConfig(d: AiBootstrapResponse): string {
  const entries = d.blockInstances.map((bi) => `  {
    instanceId: ${q(bi.instanceId)},
    blockId: ${q(bi.blockId)},
    hostType: ${q(bi.hostType)},
    hostId: ${q(bi.hostId)},
    selector: ${q(bi.selector)},
    templateFile: ${q(bi.templateFile)},
    dataAttribute: ${q(bi.dataAttribute)},
    optional: ${bi.optional},
  }`).join(',\n');

  return `import { BlockInstanceConfig } from './template.types';

/**
 * INSTÂNCIAS DE BLOCOS — Gerado por ai-bootstrap-meta
 */
export const UI_BLOCK_INSTANCES: BlockInstanceConfig[] = [
${entries},
];
`;
}

function genFieldSchemasConfig(d: AiBootstrapResponse): string {
  const formatValidators = (vs: Array<{ name: string; value?: unknown }>, lvl: number): string => {
    if (vs.length === 0) return '[]';
    const items = vs.map((v) => {
      if (v.value !== undefined) {
        return `{ name: ${q(v.name)}, value: ${JSON.stringify(v.value)} }`;
      }
      return `{ name: ${q(v.name)} }`;
    });
    if (items.join(', ').length < 80) return `[${items.join(', ')}]`;
    return `[\n${items.map((i) => `${indent(lvl + 1)}${i},`).join('\n')}\n${indent(lvl)}]`;
  };

  const formatField = (f: AiBootstrapResponse['fieldSchemas'][0]['fields'][0], lvl: number): string => {
    const lines: string[] = [
      `${indent(lvl)}id: ${q(f.id)},`,
      `${indent(lvl)}label: ${q(f.label)},`,
      `${indent(lvl)}type: ${q(f.type)},`,
      `${indent(lvl)}validators: ${formatValidators(f.validators, lvl)},`,
      `${indent(lvl)}optional: ${f.optional},`,
      `${indent(lvl)}validationVariable: ${f.validationVariable},`,
    ];
    if (f.processVariableKey) lines.push(`${indent(lvl)}processVariableKey: ${q(f.processVariableKey)},`);
    if (f.featureDependency) lines.push(`${indent(lvl)}featureDependency: ${q(f.featureDependency)},`);
    lines.push(`${indent(lvl)}readOnlyInSteps: ${toArray(f.readOnlyInSteps, lvl / 2)},`);
    return lines.join('\n');
  };

  const entries = d.fieldSchemas.map((fs) => {
    const fields = fs.fields.map((f) => `      {\n${formatField(f, 4)}\n      }`).join(',\n');

    let subBlocksPart = '';
    if (fs.subBlocks && fs.subBlocks.length > 0) {
      const sbs = fs.subBlocks.map((sb) => {
        const sbFields = sb.fields.map((f) => `          {\n${formatField(f, 6)}\n          }`).join(',\n');
        return `        {
          blockId: ${q(sb.blockId)},
          selector: ${q(sb.selector)},
          fields: [
${sbFields},
          ],
          optional: ${sb.optional},
        }`;
      }).join(',\n');
      subBlocksPart = `\n    subBlocks: [\n${sbs},\n    ],`;
    }

    return `  {
    blockId: ${q(fs.blockId)},
    fields: [
${fields},
    ],${subBlocksPart}
  }`;
  }).join(',\n');

  return `import { BlockFieldSchema } from './template.types';

/**
 * FIELD SCHEMAS — Gerado por ai-bootstrap-meta
 */
export const FIELD_SCHEMAS: BlockFieldSchema[] = [
${entries},
];
`;
}

function genProcessVariablesConfig(d: AiBootstrapResponse): string {
  const entries = d.processVariables.map((pv) => {
    const lines = [
      `    key: ${q(pv.key)},`,
      `    label: ${q(pv.label)},`,
      `    type: ${q(pv.type)},`,
      `    writtenBy: ${toArray(pv.writtenBy, 2)},`,
      `    readBy: ${toArray(pv.readBy, 2)},`,
      `    notification: ${pv.notification},`,
      `    optional: ${pv.optional},`,
    ];
    if (pv.sourceComponent) lines.push(`    sourceComponent: ${q(pv.sourceComponent)},`);
    if (pv.sourceField) lines.push(`    sourceField: ${q(pv.sourceField)},`);
    if (pv.requiredFeature) lines.push(`    requiredFeature: ${q(pv.requiredFeature)},`);
    return `  {\n${lines.join('\n')}\n  }`;
  }).join(',\n');

  return `import { ProcessVariableConfig } from './template.types';

/**
 * VARIÁVEIS DE PROCESSO — Gerado por ai-bootstrap-meta
 */
export const PROCESS_VARIABLES: ProcessVariableConfig[] = [
${entries},
];
`;
}

function genDependenciesConfig(d: AiBootstrapResponse): string {
  const entries = d.dependencies.map((dep) =>
    `  {
    source: { type: ${q(dep.source.type)}, id: ${q(dep.source.id)} },
    target: { type: ${q(dep.target.type)}, id: ${q(dep.target.id)} },
    description: ${q(dep.description)},
  }`,
  ).join(',\n');

  return `import { DependencyRule } from './template.types';

/**
 * REGRAS DE DEPENDÊNCIA — Gerado por ai-bootstrap-meta
 */
export const DEPENDENCY_RULES: DependencyRule[] = [
${entries},
];
`;
}

function genManifest(d: AiBootstrapResponse): string {
  const featureEntries = d.features.map((f) => {
    const lines = [
      `    id: ${q(f.id)},`,
      `    label: ${q(f.label)},`,
      `    description: ${q(f.description)},`,
      `    optional: ${f.optional},`,
    ];
    if (f.enabledBy && f.enabledBy.length > 0) {
      lines.push(`    enabledBy: ${toArray(f.enabledBy, 2)},`);
    }
    return `  {\n${lines.join('\n')}\n  }`;
  }).join(',\n');

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
 * MANIFESTO DO TEMPLATE — ${d.templateId}
 *
 * Gerado por ai-bootstrap-meta. Revise e ajuste conforme necessário.
 */
export const WORKFLOW_TEMPLATE_MANIFEST: WorkflowTemplateManifest = {
  templateId: ${q(d.templateId)},
  name: ${q(d.name)},
  description: ${q(d.description)},
  version: ${q(d.version)},
  baseModel: ${q(d.baseModel)},

  steps: WORKFLOW_STEPS,
  blocks: UI_BLOCKS,
  blockInstances: UI_BLOCK_INSTANCES,
  fieldSchemas: FIELD_SCHEMAS,
  processVariables: PROCESS_VARIABLES,
  routes: WORKFLOW_ROUTES,
  presets: WORKFLOW_PRESETS,
  dependencies: DEPENDENCY_RULES,

  features: [
${featureEntries},
  ],
};
`;
}
