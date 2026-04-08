// ---------------------------------------------------------------------------
// Tipos de Template — metadados genéricos reutilizáveis
// ---------------------------------------------------------------------------

export interface TemplateSummary {
  templateId: string;
  name: string;
  description: string;
  version: string;
  presets: PresetSummary[];
  stepsCount: number;
  featuresCount: number;
  blocksCount: number;
}

export interface PresetSummary {
  id: string;
  label: string;
  description: string;
  enabledSteps: string[];
  enabledFeatures: string[];
}

// ---------------------------------------------------------------------------
// Tipos de Geração — request e resultado
// ---------------------------------------------------------------------------

export interface GenerationRequestDTO {
  templateId: string;
  presetId: string;
  project: {
    name: string;
    slug: string;
  };
  customizations?: GenerationCustomizationDTO[];
}

export interface GenerationCustomizationDTO {
  operation: string;
  params: Record<string, unknown>;
}

export interface GenerationResultDTO {
  success: boolean;
  slug: string;
  outputDir: string;
  operationsExecuted: number;
  warnings: string[];
  duration: number;
}
