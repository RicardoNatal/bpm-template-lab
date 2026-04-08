import type { InferredInfo, InitTemplateReport } from '../types/meta-source.types.js';

/**
 * Constrói o relatório do init-template com informações sobre
 * o que foi inferido, criado e o que precisa de revisão.
 */
export function buildInitReport(
  templateId: string,
  templateDir: string,
  inferred: InferredInfo,
  createdFiles: string[],
): InitTemplateReport {
  const placeholders: string[] = [];
  const manualReviewNeeded: string[] = [];

  // Sempre precisa de revisão
  manualReviewNeeded.push('meta-source/template.types.ts — ajustar StepId, BlockId, FeatureId, PresetId');
  manualReviewNeeded.push('meta-source/workflow-steps.config.ts — mapear blocks e features de cada step');
  manualReviewNeeded.push('meta-source/workflow-presets.config.ts — definir presets reais');
  manualReviewNeeded.push('meta-source/ui-blocks.config.ts — mapear blocos de UI reais');
  manualReviewNeeded.push('meta-source/ui-block-instances.config.ts — mapear instâncias reais com templateFile e dataAttribute');
  manualReviewNeeded.push('meta-source/field-schemas.config.ts — mapear campos de formulário reais');
  manualReviewNeeded.push('meta-source/process-variables.config.ts — mapear variáveis de processo reais');
  manualReviewNeeded.push('meta-source/dependencies.config.ts — mapear dependências entre entidades');
  manualReviewNeeded.push('meta-source/workflow-template.manifest.ts — ajustar name, description, features');

  // Dados que são placeholder
  placeholders.push('Presets são esqueleto inicial — definir enabledSteps/enabledFeatures');
  placeholders.push('Blocos são placeholders genéricos — substituir por blocos reais');
  placeholders.push('Block instances estão vazias — mapear uso real no HTML');
  placeholders.push('Field schemas estão vazios — mapear campos reais');
  placeholders.push('Process variables estão vazias — mapear variáveis reais');
  placeholders.push('Dependencies estão vazias — mapear cascatas reais');

  // Informar qualidade da inferência
  if (inferred.routes.length === 0) {
    manualReviewNeeded.push('⚠️  Nenhuma rota foi inferida — steps precisam ser definidos manualmente');
  }

  if (inferred.components.length === 0) {
    manualReviewNeeded.push('⚠️  Nenhum componente inferido — revisar projeto Angular');
  }

  // Adicionar HTML templates para revisão
  manualReviewNeeded.push(
    `Adicionar data-template-block-instance="..." nos HTMLs relevantes (${inferred.htmlFiles.length} HTMLs encontrados)`,
  );

  return {
    templateId,
    templateDir,
    inferred,
    created: createdFiles,
    placeholders,
    manualReviewNeeded,
  };
}
