import type { InitTemplateReport } from '../types/meta-source.types.js';

export function printInitReport(report: InitTemplateReport): void {
  console.log('\n' + '═'.repeat(60));
  console.log('📦 BOOTSTRAP DE TEMPLATE CONCLUÍDO');
  console.log('═'.repeat(60));

  console.log(`\n  Template ID:  ${report.templateId}`);
  console.log(`  Diretório:    ${report.templateDir}`);

  // Inferred
  console.log(`\n  🔍 Dados inferidos do projeto Angular:`);
  if (report.inferred.routes.length > 0) {
    console.log(`    Rotas encontradas: ${report.inferred.routes.length}`);
    for (const r of report.inferred.routes) {
      const mod = r.moduleName ? ` → ${r.moduleName}` : '';
      console.log(`      - /${r.path}${mod}`);
    }
  } else {
    console.log(`    Nenhuma rota inferida (revisão manual necessária)`);
  }

  if (report.inferred.components.length > 0) {
    console.log(`    Componentes encontrados: ${report.inferred.components.length}`);
    for (const c of report.inferred.components) {
      console.log(`      - ${c.name} (${c.htmlPath})`);
    }
  }

  if (report.inferred.modules.length > 0) {
    console.log(`    Módulos: ${report.inferred.modules.join(', ')}`);
  }

  console.log(`    Arquivos HTML: ${report.inferred.htmlFiles.length}`);

  // Created
  console.log(`\n  📄 Arquivos criados: ${report.created.length}`);
  for (const f of report.created) {
    console.log(`    - ${f}`);
  }

  // Placeholders
  if (report.placeholders.length > 0) {
    console.log(`\n  📝 Placeholders (dados genéricos, precisam de edição):`);
    for (const p of report.placeholders) {
      console.log(`    - ${p}`);
    }
  }

  // Manual review
  console.log(`\n  ⚠️  Revisão manual necessária:`);
  for (const m of report.manualReviewNeeded) {
    console.log(`    - ${m}`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📋 Próximos passos:');
  console.log('  1. Revisar e editar os arquivos em meta-source/');
  console.log('  2. Executar: npm run sync-meta -- --template-id ' + report.templateId);
  console.log('  3. Executar: npm run validate-template -- --template-id ' + report.templateId);
  console.log('  4. Iterar até validação passar sem erros');
  console.log('═'.repeat(60) + '\n');
}

export function serializeInitReport(report: InitTemplateReport): string {
  return JSON.stringify(report, null, 2);
}
