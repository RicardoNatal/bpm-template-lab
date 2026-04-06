// ---------------------------------------------------------------------------
// Tipos auxiliares para meta-source e operações de bootstrap/sync
// ---------------------------------------------------------------------------

export interface InitTemplateOptions {
  templateId: string;
  fromPath: string;
  templatesDir: string;
}

export interface SyncMetaOptions {
  templateId: string;
  templatesDir: string;
}

export interface ValidateTemplateOptions {
  templateId: string;
  templatesDir: string;
}

// ---------------------------------------------------------------------------
// Relatórios
// ---------------------------------------------------------------------------

export interface InitTemplateReport {
  templateId: string;
  templateDir: string;
  inferred: InferredInfo;
  created: string[];
  placeholders: string[];
  manualReviewNeeded: string[];
}

export interface InferredInfo {
  routes: InferredRoute[];
  components: InferredComponent[];
  modules: string[];
  htmlFiles: string[];
}

export interface InferredRoute {
  path: string;
  modulePath?: string;
  moduleName?: string;
  componentName?: string;
}

export interface InferredComponent {
  name: string;
  selector?: string;
  templateFile?: string;
  htmlPath: string;
}

export interface ValidationReport {
  valid: boolean;
  templateId: string;
  errors: string[];
  warnings: string[];
  summary: {
    stepsCount: number;
    routesCount: number;
    presetsCount: number;
    blocksCount: number;
    blockInstancesCount: number;
    fieldSchemasCount: number;
    processVariablesCount: number;
    dependenciesCount: number;
    featuresCount: number;
  };
  completeness: number;
}

// ---------------------------------------------------------------------------
// Dados intermediários do meta-source carregado
// ---------------------------------------------------------------------------

export interface LoadedMetaSource {
  manifest: Record<string, unknown>;
  steps: unknown[];
  routes: unknown[];
  presets: unknown[];
  blocks: unknown[];
  blockInstances: unknown[];
  fieldSchemas: unknown[];
  processVariables: unknown[];
  dependencies: unknown[];
  features: unknown[];
}
