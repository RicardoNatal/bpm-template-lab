import { DependencyRule } from '@template/types/template.types';

/**
 * REGRAS DE DEPENDÊNCIA / CASCATA
 *
 * Declaram explicitamente o que deve ser removido quando uma entidade é desabilitada.
 * Um gerador percorre estas regras transitivamente para calcular o impacto total.
 *
 * Convenção:
 * - source = entidade cuja remoção dispara a cascata
 * - target = entidade que deve ser removida em consequência
 *
 * Estas regras complementam (não substituem) as relações já implícitas nos outros configs:
 * - step.features → quais features um step usa
 * - processVariable.requiredFeature → qual feature habilita a variável
 * - feature.enabledBy → dependência entre features
 * - blockInstance.blockId → qual bloco semântico a instância representa
 *
 * As regras abaixo cobrem APENAS as cascatas que NÃO são trivialmente deriváveis
 * dos outros configs, ou que beneficiam de serem declaradas explicitamente para segurança.
 */
export const DEPENDENCY_RULES: DependencyRule[] = [
  // ── Feature → Step ──────────────────────────────────────────────────────
  {
    source: { type: 'feature', id: 'revisao-pelo-solicitante' },
    target: { type: 'step', id: 'revisao' },
    description: 'Sem esta feature, o step de revisão não existe no fluxo.',
  },
  {
    source: { type: 'feature', id: 'analise-rh-com-aprovacao' },
    target: { type: 'step', id: 'analise-rh' },
    description: 'Sem esta feature, o step de análise RH não existe no fluxo.',
  },

  // ── Feature → Feature cascatas ──────────────────────────────────────────
  {
    source: { type: 'feature', id: 'analise-rh-com-aprovacao' },
    target: { type: 'feature', id: 'gravar-beneficio' },
    description: 'Gravação do benefício só ocorre na aprovação do RH.',
  },
  {
    source: { type: 'feature', id: 'analise-rh-com-aprovacao' },
    target: { type: 'feature', id: 'observacao-rh' },
    description: 'Observação do RH só tem sentido com etapa de análise RH.',
  },

  // ── Feature → Block ─────────────────────────────────────────────────────
  {
    source: { type: 'feature', id: 'observacao-rh' },
    target: { type: 'block', id: 'observacao-rh' },
    description: 'Sem a feature, o bloco de observação do RH deve ser removido.',
  },

  // ── Step → Route (toda remoção de step implica remoção da sua rota) ────
  {
    source: { type: 'step', id: 'revisao' },
    target: { type: 'route', id: 'revisao' },
    description: 'Remoção do step revisao implica remoção da rota /revisao.',
  },
  {
    source: { type: 'step', id: 'analise-rh' },
    target: { type: 'route', id: 'analise-rh' },
    description: 'Remoção do step analise-rh implica remoção da rota /analise-rh.',
  },
  {
    source: { type: 'step', id: 'detalhes' },
    target: { type: 'route', id: 'detalhes' },
    description: 'Remoção do step detalhes implica remoção da rota /detalhes.',
  },
  {
    source: { type: 'step', id: 'solicitacao' },
    target: { type: 'route', id: 'solicitacao' },
    description: 'Remoção do step solicitacao implica remoção da rota /solicitacao.',
  },

  // ── Block → BlockInstances (remoção de bloco implica remoção de todas as suas instâncias) ─
  {
    source: { type: 'block', id: 'observacao-rh' },
    target: { type: 'blockInstance', id: 'observacao-rh-solicitacao' },
    description: 'Instância de observação RH na solicitação/revisão.',
  },
  {
    source: { type: 'block', id: 'observacao-rh' },
    target: { type: 'blockInstance', id: 'observacao-rh-analise-rh' },
    description: 'Instância de observação RH na análise RH.',
  },
  {
    source: { type: 'block', id: 'observacao-rh' },
    target: { type: 'blockInstance', id: 'observacao-rh-detalhes' },
    description: 'Instância de observação RH nos detalhes.',
  },

  // ── Block → ProcessVariable ─────────────────────────────────────────────
  {
    source: { type: 'block', id: 'observacao-rh' },
    target: { type: 'processVariable', id: 'observacaoRh' },
    description: 'Variável de processo vinculada ao bloco observação RH.',
  },
];
