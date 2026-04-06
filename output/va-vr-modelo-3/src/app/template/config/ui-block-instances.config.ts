import { BlockInstanceConfig } from '@template/types/template.types';

/**
 * INSTÂNCIAS FÍSICAS DE BLOCOS
 *
 * Mapeia cada ocorrência concreta de um bloco de UI nos templates das etapas.
 *
 * Problema resolvido: o selector 'app-observacao' é usado em dois contextos semânticos
 * distintos (observacao-rh e observacao-solicitante). Sem este mapa, um gerador não
 * consegue saber qual instância remover ao desabilitar um bloco.
 *
 * Convenção de instanceId: '<blockId>-<hostId>'
 * Atributo HTML: data-template-block-instance="<instanceId>"
 */
export const UI_BLOCK_INSTANCES: BlockInstanceConfig[] = [
  // ── Etapa: solicitacao ────────────────────────────────────────────────────
  {
    instanceId: 'dados-solicitante-solicitacao',
    blockId: 'dados-solicitante',
    hostType: 'page',
    hostId: 'solicitacao',
    selector: 'app-dados-solicitante',
    templateFile: 'src/app/modules/solicitacao/solicitacao.component.html',
    dataAttribute: 'dados-solicitante-solicitacao',
    optional: false,
  },
  {
    instanceId: 'beneficio-atual-solicitacao',
    blockId: 'beneficio-atual',
    hostType: 'page',
    hostId: 'solicitacao',
    selector: 'app-beneficio-atual',
    templateFile: 'src/app/modules/solicitacao/solicitacao.component.html',
    dataAttribute: 'beneficio-atual-solicitacao',
    optional: false,
  },
  {
    instanceId: 'dados-solicitacao-solicitacao',
    blockId: 'dados-solicitacao',
    hostType: 'page',
    hostId: 'solicitacao',
    selector: 'app-dados-solicitacao',
    templateFile: 'src/app/modules/solicitacao/solicitacao.component.html',
    dataAttribute: 'dados-solicitacao-solicitacao',
    optional: false,
  },
  {
    // Presente na etapa solicitacao apenas quando isRevisao=true.
    // A instância existe no HTML mesmo na etapa solicitacao, mas é ocultada via [hidden].
    instanceId: 'observacao-rh-solicitacao',
    blockId: 'observacao-rh',
    hostType: 'page',
    hostId: 'solicitacao',
    selector: 'app-observacao',
    templateFile: 'src/app/modules/solicitacao/solicitacao.component.html',
    dataAttribute: 'observacao-rh-solicitacao',
    optional: true,
    inputs: {
      mostrarCard: true,
      label: 'Observação do RH',
      title: 'Análise do RH',
    },
  },

  // ── Etapa: analise-rh ────────────────────────────────────────────────────
  {
    instanceId: 'dados-solicitante-analise-rh',
    blockId: 'dados-solicitante',
    hostType: 'page',
    hostId: 'analise-rh',
    selector: 'app-dados-solicitante',
    templateFile: 'src/app/modules/analise-rh/analise-rh.component.html',
    dataAttribute: 'dados-solicitante-analise-rh',
    optional: false,
  },
  {
    instanceId: 'beneficio-atual-analise-rh',
    blockId: 'beneficio-atual',
    hostType: 'page',
    hostId: 'analise-rh',
    selector: 'app-beneficio-atual',
    templateFile: 'src/app/modules/analise-rh/analise-rh.component.html',
    dataAttribute: 'beneficio-atual-analise-rh',
    optional: false,
  },
  {
    instanceId: 'dados-solicitacao-analise-rh',
    blockId: 'dados-solicitacao',
    hostType: 'page',
    hostId: 'analise-rh',
    selector: 'app-dados-solicitacao',
    templateFile: 'src/app/modules/analise-rh/analise-rh.component.html',
    dataAttribute: 'dados-solicitacao-analise-rh',
    optional: false,
  },
  {
    instanceId: 'observacao-rh-analise-rh',
    blockId: 'observacao-rh',
    hostType: 'page',
    hostId: 'analise-rh',
    selector: 'app-observacao',
    templateFile: 'src/app/modules/analise-rh/analise-rh.component.html',
    dataAttribute: 'observacao-rh-analise-rh',
    optional: true,
    inputs: {
      mostrarCard: true,
      label: 'Observação do RH',
      title: 'Análise do RH',
    },
  },

  // ── Etapa: detalhes ──────────────────────────────────────────────────────
  {
    instanceId: 'dados-solicitante-detalhes',
    blockId: 'dados-solicitante',
    hostType: 'page',
    hostId: 'detalhes',
    selector: 'app-dados-solicitante',
    templateFile: 'src/app/modules/detalhes/detalhes.component.html',
    dataAttribute: 'dados-solicitante-detalhes',
    optional: false,
  },
  {
    instanceId: 'beneficio-atual-detalhes',
    blockId: 'beneficio-atual',
    hostType: 'page',
    hostId: 'detalhes',
    selector: 'app-beneficio-atual',
    templateFile: 'src/app/modules/detalhes/detalhes.component.html',
    dataAttribute: 'beneficio-atual-detalhes',
    optional: false,
  },
  {
    instanceId: 'dados-solicitacao-detalhes',
    blockId: 'dados-solicitacao',
    hostType: 'page',
    hostId: 'detalhes',
    selector: 'app-dados-solicitacao',
    templateFile: 'src/app/modules/detalhes/detalhes.component.html',
    dataAttribute: 'dados-solicitacao-detalhes',
    optional: false,
  },
  {
    instanceId: 'observacao-rh-detalhes',
    blockId: 'observacao-rh',
    hostType: 'page',
    hostId: 'detalhes',
    selector: 'app-observacao',
    templateFile: 'src/app/modules/detalhes/detalhes.component.html',
    dataAttribute: 'observacao-rh-detalhes',
    optional: true,
    inputs: {
      mostrarCard: true,
      label: 'Observação do RH',
      title: 'Análise do RH',
    },
  },

  // ── Sub-blocos dentro de dados-solicitacao ───────────────────────────────
  {
    // Sub-bloco: select de benefício dentro do bloco dados-solicitacao
    instanceId: 'dados-solicitacao-select-beneficio',
    blockId: 'dados-solicitacao',
    hostType: 'block',
    hostId: 'dados-solicitacao',
    selector: 'app-select',
    templateFile: 'src/app/shared/components/dados-solicitacao/dados-solicitacao.component.html',
    dataAttribute: 'dados-solicitacao-select-beneficio',
    optional: false,
  },
  {
    instanceId: 'termo-adesao-dados-solicitacao',
    blockId: 'termo-adesao',
    hostType: 'block',
    hostId: 'dados-solicitacao',
    selector: 'app-termo-adesao',
    templateFile: 'src/app/shared/components/dados-solicitacao/dados-solicitacao.component.html',
    dataAttribute: 'termo-adesao-dados-solicitacao',
    optional: true,
  },
  {
    // Instância de observacao DENTRO de dados-solicitacao: é do solicitante, não do RH.
    instanceId: 'observacao-solicitante-dados-solicitacao',
    blockId: 'observacao-solicitante',
    hostType: 'block',
    hostId: 'dados-solicitacao',
    selector: 'app-observacao',
    templateFile: 'src/app/shared/components/dados-solicitacao/dados-solicitacao.component.html',
    dataAttribute: 'observacao-solicitante-dados-solicitacao',
    optional: true,
    inputs: {
      mostrarCard: false,
      label: 'Observação do Solicitante',
    },
  },
];
