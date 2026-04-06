import * as path from 'node:path';
import * as fs from 'node:fs';
import { loadMetaSource } from '../sync/load-meta-source.js';
import { serializeMeta } from '../sync/serialize-meta.js';
import type { SyncMetaOptions } from '../types/meta-source.types.js';

/**
 * Comando sync-meta: converte meta-source/ (TypeScript) em meta/ (JSON).
 *
 * Ponte entre autoria humana e consumo pelo gerador.
 * O gerador de variantes continua lendo SOMENTE meta/*.json.
 */
export function runSyncMeta(options: SyncMetaOptions): void {
  const { templateId, templatesDir } = options;

  console.log(`\n🔄 sync-meta: Sincronizando "${templateId}"...`);

  const templateDir = path.join(templatesDir, templateId);
  const metaSourceDir = path.join(templateDir, 'meta-source');
  const metaDir = path.join(templateDir, 'meta');

  // Validar que meta-source existe
  if (!fs.existsSync(metaSourceDir)) {
    throw new Error(`Diretório meta-source/ não encontrado: ${metaSourceDir}`);
  }

  const manifestTs = path.join(metaSourceDir, 'workflow-template.manifest.ts');
  if (!fs.existsSync(manifestTs)) {
    throw new Error(`workflow-template.manifest.ts não encontrado em: ${metaSourceDir}`);
  }

  // 1. Carregar meta-source via tsx
  console.log(`📖 Carregando meta-source TypeScript...`);
  const metaSource = loadMetaSource(metaSourceDir);

  // 2. Validar dados mínimos
  if (!metaSource.manifest['templateId']) {
    throw new Error('meta-source inválido: templateId ausente no manifest');
  }

  // 3. Serializar para JSON
  console.log(`📄 Gerando meta/*.json...`);
  const written = serializeMeta(metaDir, metaSource);

  console.log(`\n✅ sync-meta concluído. ${written.length} arquivo(s) gerado(s):`);
  for (const f of written) {
    console.log(`   - meta/${f}`);
  }

  // Summary
  console.log(`\n📊 Resumo dos dados:`);
  console.log(`   Steps:             ${metaSource.steps.length}`);
  console.log(`   Routes:            ${metaSource.routes.length}`);
  console.log(`   Presets:           ${metaSource.presets.length}`);
  console.log(`   Blocks:            ${metaSource.blocks.length}`);
  console.log(`   Block Instances:   ${metaSource.blockInstances.length}`);
  console.log(`   Field Schemas:     ${metaSource.fieldSchemas.length}`);
  console.log(`   Process Variables: ${metaSource.processVariables.length}`);
  console.log(`   Dependencies:      ${metaSource.dependencies.length}`);
  console.log(`   Features:          ${metaSource.features.length}`);

  console.log(`\n📋 Próximo passo: npm run validate-template -- --template-id ${templateId}`);
}
