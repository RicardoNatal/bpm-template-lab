const fs = require('fs');

const environment = process.argv[2] || 'dev';
const environmentFilePath = `./src/environments/environment.${environment}.ts`;

const fileContent = fs.readFileSync(environmentFilePath, 'utf8');
const versionMatch = fileContent.match(/versao:\s*['"](.*)['"]/);

if (versionMatch) {
  const version = versionMatch[1];
  console.log(`Projeto está definido na versão ${version}`);

  // Cria o arquivo .version.env com a versão
  fs.writeFileSync('.version.env', `VERSION=${version}\n`);
} else {
  console.error(`Versão não definida em ${environmentFilePath}`);
  process.exit(1);
}
