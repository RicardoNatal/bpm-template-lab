import type { ValidationReport } from '../types/meta-source.types.js';

export function printValidationReport(report: ValidationReport): void {
  console.log('\n' + '═'.repeat(60));
  console.log(report.valid ? '✅ TEMPLATE VÁLIDO' : '❌ TEMPLATE INVÁLIDO');
  console.log('═'.repeat(60));

  console.log(`\n  Template:      ${report.templateId}`);
  console.log(`  Completude:    ~${report.completeness}%`);

  console.log(`\n  Resumo:`);
  console.log(`    Steps:             ${report.summary.stepsCount}`);
  console.log(`    Routes:            ${report.summary.routesCount}`);
  console.log(`    Presets:           ${report.summary.presetsCount}`);
  console.log(`    Blocks:            ${report.summary.blocksCount}`);
  console.log(`    Block Instances:   ${report.summary.blockInstancesCount}`);
  console.log(`    Field Schemas:     ${report.summary.fieldSchemasCount}`);
  console.log(`    Process Variables: ${report.summary.processVariablesCount}`);
  console.log(`    Dependencies:      ${report.summary.dependenciesCount}`);
  console.log(`    Features:          ${report.summary.featuresCount}`);

  if (report.errors.length > 0) {
    console.log(`\n  ❌ Erros: ${report.errors.length}`);
    for (const e of report.errors) {
      console.log(`    - ${e}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings: ${report.warnings.length}`);
    for (const w of report.warnings) {
      console.log(`    - ${w}`);
    }
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

export function serializeValidationReport(report: ValidationReport): string {
  return JSON.stringify(report, null, 2);
}
