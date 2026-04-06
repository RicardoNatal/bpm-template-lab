import type {
  LoadedTemplate,
  PresetMeta,
  GenerationOperation,
} from '../types/generator.types.js';

/**
 * Resolve um preset em uma lista de operações concretas de geração.
 *
 * Compara o preset alvo com o modelo base (modelo completo) para determinar
 * o que deve ser desabilitado/removido.
 */
export function resolvePreset(
  template: LoadedTemplate,
  presetId: string,
): GenerationOperation[] {
  const preset = template.presets.find((p) => p.id === presetId);
  if (!preset) {
    throw new Error(
      `Preset "${presetId}" não encontrado. Disponíveis: ${template.presets.map((p) => p.id).join(', ')}`,
    );
  }

  // Se é o modelo base completo, nenhuma operação subtrativa necessária
  if (presetId === template.manifest.baseModel) {
    return [];
  }

  const operations: GenerationOperation[] = [];

  const enabledStepSet = new Set(preset.enabledSteps);
  const enabledFeatureSet = new Set(preset.enabledFeatures);

  // 1. disable_feature — features do base que não estão no preset
  for (const feature of template.manifest.features) {
    if (!enabledFeatureSet.has(feature.id)) {
      operations.push({
        type: 'disable_feature',
        target: feature.id,
        reason: `Feature "${feature.id}" não está habilitada no preset "${presetId}"`,
      });
    }
  }

  // 2. disable_step — steps do base que não estão no preset
  for (const step of template.steps) {
    if (!enabledStepSet.has(step.id)) {
      operations.push({
        type: 'disable_step',
        target: step.id,
        reason: `Step "${step.id}" não está habilitado no preset "${presetId}"`,
      });
    }
  }

  // 3. disable_route — rotas dos steps desabilitados
  for (const route of template.routes.routes) {
    if (!enabledStepSet.has(route.stepId)) {
      operations.push({
        type: 'disable_route',
        target: route.stepId,
        reason: `Rota do step "${route.stepId}" deve ser removida (step desabilitado)`,
      });
    }
  }

  // 4. remove_block_instance — instâncias explicitamente desabilitadas no preset
  for (const instanceId of preset.disabledBlockInstances) {
    operations.push({
      type: 'remove_block_instance',
      target: instanceId,
      reason: `BlockInstance "${instanceId}" explicitamente desabilitada no preset "${presetId}"`,
    });
  }

  // 4b. remove_block_instance — instâncias de blocos desabilitados no preset
  if (preset.disabledBlocks.length > 0) {
    const disabledBlockSet = new Set(preset.disabledBlocks);
    for (const instance of template.blockInstances) {
      if (disabledBlockSet.has(instance.blockId)) {
        // Evita duplicar se já foi adicionada explicitamente
        const alreadyAdded = operations.some(
          (op) => op.type === 'remove_block_instance' && op.target === instance.instanceId,
        );
        if (!alreadyAdded) {
          operations.push({
            type: 'remove_block_instance',
            target: instance.instanceId,
            reason: `BlockInstance "${instance.instanceId}" removida porque bloco "${instance.blockId}" está desabilitado no preset "${presetId}"`,
          });
        }
      }
    }
  }

  // 4c. remove_block_instance — instâncias que pertencem a steps desabilitados
  for (const instance of template.blockInstances) {
    if (instance.hostType === 'page' && !enabledStepSet.has(instance.hostId)) {
      const alreadyAdded = operations.some(
        (op) => op.type === 'remove_block_instance' && op.target === instance.instanceId,
      );
      if (!alreadyAdded) {
        operations.push({
          type: 'remove_block_instance',
          target: instance.instanceId,
          reason: `BlockInstance "${instance.instanceId}" removida porque step host "${instance.hostId}" está desabilitado`,
        });
      }
    }
  }

  // 5. filter_process_variables_by_feature — uma operação global
  const disabledFeatures = template.manifest.features
    .filter((f) => !enabledFeatureSet.has(f.id))
    .map((f) => f.id);

  if (disabledFeatures.length > 0) {
    operations.push({
      type: 'filter_process_variables_by_feature',
      target: '_all',
      reason: `Filtrar variáveis de processo vinculadas a features desabilitadas: ${disabledFeatures.join(', ')}`,
      params: { disabledFeatures },
    });
  }

  return operations;
}
