/**
 * TEMPLATE TYPES — plano-saude-base
 *
 * Gerado por ai-bootstrap-meta. Revise e ajuste conforme necessário.
 */

export type StepId = 'solicitacao' | 'revisao' | 'analise-rh' | 'detalhes';
export type BlockId = 'dados-solicitante' | 'dados-gestor' | 'dados-solicitacao' | 'observacao' | 'dados-dependentes';
export type FeatureId = 'gestor-validation' | 'dependentes-management' | 'planos-integration' | 'readonly-fields' | 'observacao-rh' | 'senior-xt-integration';
export type PresetId = 'completo' | 'simplificado' | 'sem-dependentes';

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
