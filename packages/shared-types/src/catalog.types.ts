// ---------------------------------------------------------------------------
// Tipos do Catálogo / Registry — compartilhados entre apps e packages
// ---------------------------------------------------------------------------

export interface RegistryCatalog {
  version: '1.0';
  updatedAt: string;
  bpmCategories: BpmCategory[];
}

export interface BpmCategory {
  id: string;
  name: string;
  description: string;
  models: PublishedModel[];
}

export interface PublishedModel {
  slug: string;
  name: string;
  presetId: string;
  presetLabel: string;
  presetDescription: string;
  templateId: string;
  version: string;
  publishedAt: string;
  aiGenerated: boolean;
  steps: EnabledEntity[];
  features: EnabledEntity[];
  blocks: EnabledEntity[];
  operationsCount: number;
  operations: OperationEntry[];
  workflow: WorkflowDiagram | null;
  metaPath: string;
  outputPath: string;
}

export interface EnabledEntity {
  id: string;
  label: string;
  enabled: boolean;
}

export interface OperationEntry {
  type: string;
  target: string;
}

// ---------------------------------------------------------------------------
// Workflow / BPMN Diagram
// ---------------------------------------------------------------------------

export interface WorkflowDiagram {
  viewBox: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'gateway';
  label?: string;
  cx?: number;
  cy?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  stepId?: string;
}

export interface WorkflowEdge {
  points: [number, number][];
  label?: string;
  labelPos?: [number, number];
}
