// ---------------------------------------------------------------------------
// Metadados do Template (consumidos de meta/*.json)
// ---------------------------------------------------------------------------

export interface TemplateManifest {
  templateId: string;
  name: string;
  description: string;
  version: string;
  baseModel: string;
  files: TemplateMetaFiles;
  features: FeatureMeta[];
  allowedOperations: string[];
  generatorNotes?: { checklist?: string[] };
}

export interface TemplateMetaFiles {
  steps: string;
  routes: string;
  presets: string;
  blocks: string;
  blockInstances: string;
  fieldSchemas: string;
  processVariables: string;
  dependencies: string;
}

export interface StepMeta {
  id: string;
  label: string;
  route: string;
  componentClass: string;
  mode: string;
  blocks: string[];
  features: string[];
  optional: boolean;
  variantOf?: string;
}

export interface RouteMeta {
  stepId: string;
  path: string;
  modulePath: string;
  moduleName: string;
  hasNote?: string;
  routeData: { stepId: string; mode: string };
}

export interface RoutesMeta {
  routes: RouteMeta[];
  stepRouteMap: Record<string, string>;
  routeStepMap: Record<string, string>;
}

export interface PresetMeta {
  id: string;
  label: string;
  description: string;
  enabledSteps: string[];
  enabledFeatures: string[];
  disabledBlocks: string[];
  disabledBlockInstances: string[];
}

export interface BlockMeta {
  id: string;
  label: string;
  selector: string;
  optional: boolean;
  readOnlyInSteps: string[];
}

export interface BlockInstanceMeta {
  instanceId: string;
  blockId: string;
  hostType: 'page' | 'block';
  hostId: string;
  selector: string;
  templateFile: string;
  dataAttribute: string;
  optional: boolean;
  inputs?: Record<string, unknown>;
}

export interface FieldSchemaMeta {
  blockId: string;
  fields: FieldMeta[];
  subBlocks?: SubBlockSchemaMeta[];
}

export interface FieldMeta {
  id: string;
  label: string;
  type: string;
  validators: { name: string; value?: unknown }[];
  optional: boolean;
  validationVariable: boolean;
  processVariableKey?: string;
  featureDependency?: string;
  readOnlyInSteps: string[];
  validationNote?: string;
}

export interface SubBlockSchemaMeta {
  blockId: string;
  selector: string;
  optional: boolean;
  fields: FieldMeta[];
}

export interface ProcessVariableMeta {
  key: string;
  label: string;
  type: string;
  writtenBy: string[];
  readBy: string[];
  notification: boolean;
  optional: boolean;
  sourceComponent?: string;
  sourceField?: string;
  requiredFeature?: string;
}

export interface DependencyMeta {
  source: { type: string; id: string };
  target: { type: string; id: string };
  description: string;
}

export interface FeatureMeta {
  id: string;
  label: string;
  description: string;
  optional: boolean;
  enabledBy?: string[];
}

// ---------------------------------------------------------------------------
// Template carregado (todos os metadados resolvidos)
// ---------------------------------------------------------------------------

export interface LoadedTemplate {
  manifest: TemplateManifest;
  steps: StepMeta[];
  routes: RoutesMeta;
  presets: PresetMeta[];
  blocks: BlockMeta[];
  blockInstances: BlockInstanceMeta[];
  fieldSchemas: FieldSchemaMeta[];
  processVariables: ProcessVariableMeta[];
  dependencies: DependencyMeta[];
  /** Caminho absoluto do diretório meta/ */
  metaDir: string;
  /** Caminho absoluto do diretório project/ */
  projectDir: string;
}

// ---------------------------------------------------------------------------
// Request de geração
// ---------------------------------------------------------------------------

export interface GenerationRequest {
  templateId: string;
  presetId: string;
  project: {
    name: string;
    slug: string;
  };
  customizations?: GenerationCustomization[];
}

export interface GenerationCustomization {
  operation: OperationType;
  params: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Plano de geração
// ---------------------------------------------------------------------------

export type OperationType =
  | 'disable_step'
  | 'disable_route'
  | 'disable_feature'
  | 'remove_block_instance'
  | 'filter_process_variables_by_feature'
  | 'rename_label';

export interface GenerationOperation {
  type: OperationType;
  target: string;
  reason: string;
  params?: Record<string, unknown>;
}

export interface GenerationPlan {
  templateId: string;
  presetId: string;
  projectName: string;
  outputDir: string;
  operations: GenerationOperation[];
}

// ---------------------------------------------------------------------------
// Relatório de geração
// ---------------------------------------------------------------------------

export interface GenerationReport {
  success: boolean;
  templateId: string;
  presetId: string;
  projectName: string;
  outputDir: string;
  operationsExecuted: OperationResult[];
  warnings: string[];
  filesModified: string[];
  duration: number;
}

export interface OperationResult {
  type: OperationType;
  target: string;
  success: boolean;
  detail?: string;
}
