import * as fs from 'node:fs';
import * as path from 'node:path';
import type { LoadedTemplate } from '../types/generator.types.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida a consistência mínima de um template carregado.
 * Falha cedo com erros claros se algo estiver inconsistente.
 */
export function validateTemplate(template: LoadedTemplate): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const stepIds = new Set(template.steps.map((s) => s.id));
  const featureIds = new Set(template.manifest.features.map((f) => f.id));
  const blockIds = new Set(template.blocks.map((b) => b.id));

  // 1. stepId referenciado em routes existe em steps
  for (const route of template.routes.routes) {
    if (!stepIds.has(route.stepId)) {
      errors.push(`Route aponta para stepId inexistente: "${route.stepId}"`);
    }
  }

  // 2. stepId referenciado em presets existe em steps
  for (const preset of template.presets) {
    for (const stepId of preset.enabledSteps) {
      if (!stepIds.has(stepId)) {
        errors.push(`Preset "${preset.id}" referencia stepId inexistente: "${stepId}"`);
      }
    }

    // 3. featureId referenciado em presets existe nas features do manifest
    for (const featureId of preset.enabledFeatures) {
      if (!featureIds.has(featureId)) {
        errors.push(`Preset "${preset.id}" referencia featureId inexistente: "${featureId}"`);
      }
    }
  }

  // 4. blockId referenciado em block-instances existe em blocks
  for (const instance of template.blockInstances) {
    if (!blockIds.has(instance.blockId)) {
      errors.push(`BlockInstance "${instance.instanceId}" referencia blockId inexistente: "${instance.blockId}"`);
    }
  }

  // 5. templateFile referenciado em block-instances existe em project/
  for (const instance of template.blockInstances) {
    const templateFilePath = path.join(template.projectDir, instance.templateFile);
    if (!fs.existsSync(templateFilePath)) {
      errors.push(
        `BlockInstance "${instance.instanceId}" referencia templateFile inexistente: "${instance.templateFile}"`,
      );
    }
  }

  // 6. dataAttribute referenciado em block-instances aparece no HTML correspondente
  for (const instance of template.blockInstances) {
    const templateFilePath = path.join(template.projectDir, instance.templateFile);
    if (fs.existsSync(templateFilePath)) {
      const html = fs.readFileSync(templateFilePath, 'utf-8');
      const marker = `data-template-block-instance="${instance.dataAttribute}"`;
      if (!html.includes(marker)) {
        errors.push(
          `BlockInstance "${instance.instanceId}": dataAttribute "${instance.dataAttribute}" não encontrado em "${instance.templateFile}"`,
        );
      }
    }
  }

  // 7. Dependências não apontam para ids obviamente inexistentes
  const allKnownIds = new Set<string>([
    ...stepIds,
    ...featureIds,
    ...blockIds,
    ...template.blockInstances.map((bi) => bi.instanceId),
    ...template.processVariables.map((pv) => pv.key),
    ...template.routes.routes.map((r) => r.stepId),
  ]);

  for (const dep of template.dependencies) {
    if (!allKnownIds.has(dep.source.id)) {
      warnings.push(
        `Dependência source "${dep.source.type}:${dep.source.id}" não encontrada nos metadados conhecidos`,
      );
    }
    if (!allKnownIds.has(dep.target.id)) {
      warnings.push(
        `Dependência target "${dep.target.type}:${dep.target.id}" não encontrada nos metadados conhecidos`,
      );
    }
  }

  // 8. Steps referenciados em blocks de cada step existem em blocks
  for (const step of template.steps) {
    for (const blockId of step.blocks) {
      if (!blockIds.has(blockId)) {
        errors.push(`Step "${step.id}" referencia blockId inexistente: "${blockId}"`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
