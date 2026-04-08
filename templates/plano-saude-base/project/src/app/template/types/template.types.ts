// Tipos literais derivados do projeto plano-saude-base
export type StepId = 'solicitacao' | 'revisao' | 'analise-rh' | 'detalhes';

export type StepMode = 'edit' | 'review' | 'readonly';

export type BlockId = 
  | 'dados-solicitante'
  | 'dados-gestor'
  | 'dados-solicitacao'
  | 'observacao';

export type FeatureId = string; // Para futuras features

export type PresetId = string; // Para futuros presets

// Interfaces base
export interface StepConfig {
  id: StepId;
  label: string;
  mode?: StepMode;
  variantOf?: StepId;
}

export interface BlockConfig {
  id: BlockId;
  label: string;
  component: string;
}

export interface RouteConfig {
  stepId: StepId;
  path: string;
  routeData: {
    stepId: StepId;
    mode?: StepMode;
  };
}