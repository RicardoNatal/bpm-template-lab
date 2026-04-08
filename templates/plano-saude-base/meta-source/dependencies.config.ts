import { DependencyRule } from './template.types';

/**
 * REGRAS DE DEPENDÊNCIA — Gerado por ai-bootstrap-meta
 */
export const DEPENDENCY_RULES: DependencyRule[] = [
  {
    source: { type: 'feature', id: 'gestor-validation' },
    target: { type: 'step', id: 'revisao' },
    description: 'Feature de validação de gestor habilita a etapa de revisão',
  },
  {
    source: { type: 'feature', id: 'dependentes-management' },
    target: { type: 'block', id: 'dados-dependentes' },
    description: 'Feature de gerenciamento de dependentes habilita o bloco de dados de dependentes',
  },
  {
    source: { type: 'feature', id: 'planos-integration' },
    target: { type: 'block', id: 'dados-solicitacao' },
    description: 'Feature de integração com planos habilita o bloco de dados da solicitação',
  },
  {
    source: { type: 'feature', id: 'observacao-rh' },
    target: { type: 'step', id: 'analise-rh' },
    description: 'Feature de observação RH habilita a etapa de análise RH',
  },
  {
    source: { type: 'feature', id: 'senior-xt-integration' },
    target: { type: 'processVariable', id: 'dados-persistencia' },
    description: 'Feature de integração Senior XT habilita variável de dados para persistência',
  },
  {
    source: { type: 'feature', id: 'readonly-fields' },
    target: { type: 'step', id: 'detalhes' },
    description: 'Feature de campos somente leitura habilita a etapa de detalhes',
  },
  {
    source: { type: 'step', id: 'solicitacao' },
    target: { type: 'block', id: 'dados-solicitante' },
    description: 'Etapa de solicitação utiliza o bloco de dados do solicitante',
  },
  {
    source: { type: 'step', id: 'solicitacao' },
    target: { type: 'block', id: 'dados-solicitacao' },
    description: 'Etapa de solicitação utiliza o bloco de dados da solicitação',
  },
  {
    source: { type: 'step', id: 'revisao' },
    target: { type: 'block', id: 'dados-gestor' },
    description: 'Etapa de revisão utiliza o bloco de dados do gestor',
  },
  {
    source: { type: 'step', id: 'revisao' },
    target: { type: 'block', id: 'observacao' },
    description: 'Etapa de revisão utiliza o bloco de observação',
  },
  {
    source: { type: 'step', id: 'analise-rh' },
    target: { type: 'block', id: 'observacao' },
    description: 'Etapa de análise RH utiliza o bloco de observação',
  },
];
