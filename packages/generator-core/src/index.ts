export { generateProject } from './core/generate-project.js';
export { runInitTemplate } from './commands/init-template.js';
export { runSyncMeta } from './commands/sync-meta.js';
export { runValidateTemplate } from './commands/validate-template-command.js';
export type {
  GenerationRequest,
  GenerationReport,
  GenerationPlan,
  LoadedTemplate,
} from './types/generator.types.js';
export type {
  InitTemplateOptions,
  SyncMetaOptions,
  ValidateTemplateOptions,
  InitTemplateReport,
  ValidationReport,
} from './types/meta-source.types.js';
