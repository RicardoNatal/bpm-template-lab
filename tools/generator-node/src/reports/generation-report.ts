import type { GenerationReport } from '../types/generator.types.js';

/**
 * Imprime o relatório de geração no console de forma legível.
 */
export function printReport(report: GenerationReport): void {
  console.log('\n' + '═'.repeat(60));
  console.log(report.success ? '✅ GERAÇÃO CONCLUÍDA COM SUCESSO' : '❌ GERAÇÃO CONCLUÍDA COM ERROS');
  console.log('═'.repeat(60));

  console.log(`\n  Template:   ${report.templateId}`);
  console.log(`  Preset:     ${report.presetId}`);
  console.log(`  Projeto:    ${report.projectName}`);
  console.log(`  Output:     ${report.outputDir}`);
  console.log(`  Duração:    ${report.duration}ms`);

  console.log(`\n  Operações: ${report.operationsExecuted.length}`);
  for (const op of report.operationsExecuted) {
    const icon = op.success ? '✓' : '✗';
    const detail = op.detail ? ` (${op.detail})` : '';
    console.log(`    ${icon} ${op.type} → ${op.target}${detail}`);
  }

  if (report.warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings: ${report.warnings.length}`);
    for (const w of report.warnings) {
      console.log(`    - ${w}`);
    }
  }

  if (report.filesModified.length > 0) {
    console.log(`\n  📄 Arquivos modificados: ${report.filesModified.length}`);
    for (const f of report.filesModified) {
      console.log(`    - ${f}`);
    }
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

/**
 * Serializa o relatório para JSON (para gravar em arquivo).
 */
export function serializeReport(report: GenerationReport): string {
  return JSON.stringify(report, null, 2);
}
