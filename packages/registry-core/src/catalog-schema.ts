/**
 * JSON Schema para o catalog.json — usado para validação.
 *
 * Versão simplificada para hackathon. Pode ser expandido para JSON Schema Draft-07
 * completo no futuro.
 */
export const CATALOG_SCHEMA = {
  requiredTopLevel: ['version', 'updatedAt', 'bpmCategories'] as const,
  requiredCategory: ['id', 'name', 'models'] as const,
  requiredModel: [
    'slug',
    'name',
    'presetId',
    'templateId',
    'version',
    'publishedAt',
    'steps',
    'features',
    'blocks',
    'operationsCount',
    'operations',
  ] as const,
};
