# meta/ — Metadados JSON para o Gerador Node

Esta pasta contém a versão **serializada e resolvida** dos metadados do template.
Todos os arquivos são JSON puro, sem dependências de TypeScript, Angular ou compilação.

## Entrypoint

O gerador Node deve começar lendo:

```
manifest.json
```

O manifest contém os metadados de nível superior (templateId, name, version, features, allowedOperations) e um mapa `files` que referencia os demais JSONs por nome.

## Arquivos

| Arquivo                | Conteúdo                                              |
|------------------------|-------------------------------------------------------|
| `manifest.json`        | Entrypoint principal — metadados + referências        |
| `steps.json`           | Etapas do fluxo BPM                                  |
| `routes.json`          | Rotas Angular + mapas stepId↔path                     |
| `presets.json`         | Presets de variantes (modelo-1, modelo-2, modelo-3)   |
| `blocks.json`          | Blocos de UI (definição semântica)                    |
| `block-instances.json` | Instâncias físicas de blocos nos templates HTML       |
| `field-schemas.json`   | Schemas de campos por bloco                           |
| `process-variables.json` | Variáveis do processo com origem e dependências     |
| `dependencies.json`    | Regras de cascata entre entidades                     |

## Como consumir (gerador Node)

```js
const fs = require('fs');
const path = require('path');

const metaDir = path.resolve(__dirname, 'meta');
const manifest = JSON.parse(fs.readFileSync(path.join(metaDir, 'manifest.json'), 'utf-8'));

// Carregar qualquer sub-arquivo referenciado
const steps = JSON.parse(fs.readFileSync(path.join(metaDir, manifest.files.steps), 'utf-8'));
const presets = JSON.parse(fs.readFileSync(path.join(metaDir, manifest.files.presets), 'utf-8'));
// ...
```

## Origem

Estes JSONs são derivados dos arquivos TypeScript em `../meta-source/`.
A pasta `meta-source/` é a fonte de autoria humana; esta pasta (`meta/`) é a saída para consumo do gerador.

**Não edite estes arquivos manualmente** — altere os `.ts` em `meta-source/` e re-gere os JSONs.
