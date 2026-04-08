/**
 * Schema da resposta JSON esperada da OpenAI para ai-bootstrap-meta.
 *
 * Usado como JSON Schema no parâmetro response_format da API.
 * Define a estrutura que a IA deve retornar para gerar o meta-source inicial.
 */

export const AI_BOOTSTRAP_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    templateId: { type: 'string' as const, description: 'ID do template (slug kebab-case)' },
    name: { type: 'string' as const, description: 'Nome legível do template' },
    description: { type: 'string' as const, description: 'Descrição curta do fluxo BPM' },
    version: { type: 'string' as const, description: 'Versão semântica', default: '1.0.0' },
    baseModel: { type: 'string' as const, description: 'ID do preset que representa o modelo completo' },

    steps: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          route: { type: 'string' as const },
          componentClass: { type: 'string' as const },
          mode: { type: 'string' as const, enum: ['edit', 'readonly', 'review'] },
          blocks: { type: 'array' as const, items: { type: 'string' as const } },
          features: { type: 'array' as const, items: { type: 'string' as const } },
          optional: { type: 'boolean' as const },
          variantOf: { type: 'string' as const },
        },
        required: ['id', 'label', 'route', 'componentClass', 'mode', 'blocks', 'features', 'optional'],
        additionalProperties: false,
      },
    },

    routes: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          stepId: { type: 'string' as const },
          path: { type: 'string' as const },
          modulePath: { type: 'string' as const },
          moduleName: { type: 'string' as const },
          hasNote: { type: 'string' as const },
          routeData: {
            type: 'object' as const,
            properties: {
              stepId: { type: 'string' as const },
              mode: { type: 'string' as const, enum: ['edit', 'readonly', 'review'] },
            },
            required: ['stepId', 'mode'],
            additionalProperties: false,
          },
        },
        required: ['stepId', 'path', 'modulePath', 'moduleName', 'routeData'],
        additionalProperties: false,
      },
    },

    features: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          description: { type: 'string' as const },
          optional: { type: 'boolean' as const },
          enabledBy: { type: 'array' as const, items: { type: 'string' as const } },
        },
        required: ['id', 'label', 'description', 'optional'],
        additionalProperties: false,
      },
    },

    blocks: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          selector: { type: 'string' as const },
          optional: { type: 'boolean' as const },
          readOnlyInSteps: { type: 'array' as const, items: { type: 'string' as const } },
        },
        required: ['id', 'label', 'selector', 'optional', 'readOnlyInSteps'],
        additionalProperties: false,
      },
    },

    blockInstances: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          instanceId: { type: 'string' as const },
          blockId: { type: 'string' as const },
          hostType: { type: 'string' as const, enum: ['page', 'block'] },
          hostId: { type: 'string' as const },
          selector: { type: 'string' as const },
          templateFile: { type: 'string' as const },
          dataAttribute: { type: 'string' as const },
          optional: { type: 'boolean' as const },
        },
        required: ['instanceId', 'blockId', 'hostType', 'hostId', 'selector', 'templateFile', 'dataAttribute', 'optional'],
        additionalProperties: false,
      },
    },

    fieldSchemas: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          blockId: { type: 'string' as const },
          fields: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                id: { type: 'string' as const },
                label: { type: 'string' as const },
                type: { type: 'string' as const, enum: ['select', 'checkbox', 'textarea', 'text', 'number', 'date'] },
                validators: {
                  type: 'array' as const,
                  items: {
                    type: 'object' as const,
                    properties: {
                      name: { type: 'string' as const },
                      value: {},
                    },
                    required: ['name'],
                    additionalProperties: false,
                  },
                },
                optional: { type: 'boolean' as const },
                validationVariable: { type: 'boolean' as const },
                processVariableKey: { type: 'string' as const },
                featureDependency: { type: 'string' as const },
                readOnlyInSteps: { type: 'array' as const, items: { type: 'string' as const } },
              },
              required: ['id', 'label', 'type', 'validators', 'optional', 'validationVariable', 'readOnlyInSteps'],
              additionalProperties: false,
            },
          },
          subBlocks: {
            type: 'array' as const,
            items: {
              type: 'object' as const,
              properties: {
                blockId: { type: 'string' as const },
                selector: { type: 'string' as const },
                fields: {
                  type: 'array' as const,
                  items: {
                    type: 'object' as const,
                    properties: {
                      id: { type: 'string' as const },
                      label: { type: 'string' as const },
                      type: { type: 'string' as const },
                      validators: { type: 'array' as const, items: { type: 'object' as const, properties: { name: { type: 'string' as const }, value: {} }, required: ['name'], additionalProperties: false } },
                      optional: { type: 'boolean' as const },
                      validationVariable: { type: 'boolean' as const },
                      processVariableKey: { type: 'string' as const },
                      featureDependency: { type: 'string' as const },
                      readOnlyInSteps: { type: 'array' as const, items: { type: 'string' as const } },
                    },
                    required: ['id', 'label', 'type', 'validators', 'optional', 'validationVariable', 'readOnlyInSteps'],
                    additionalProperties: false,
                  },
                },
                optional: { type: 'boolean' as const },
              },
              required: ['blockId', 'selector', 'fields', 'optional'],
              additionalProperties: false,
            },
          },
        },
        required: ['blockId', 'fields'],
        additionalProperties: false,
      },
    },

    processVariables: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          key: { type: 'string' as const },
          label: { type: 'string' as const },
          type: { type: 'string' as const, enum: ['string', 'number', 'boolean', 'json'] },
          writtenBy: { type: 'array' as const, items: { type: 'string' as const } },
          readBy: { type: 'array' as const, items: { type: 'string' as const } },
          notification: { type: 'boolean' as const },
          optional: { type: 'boolean' as const },
          sourceComponent: { type: 'string' as const },
          sourceField: { type: 'string' as const },
          requiredFeature: { type: 'string' as const },
        },
        required: ['key', 'label', 'type', 'writtenBy', 'readBy', 'notification', 'optional'],
        additionalProperties: false,
      },
    },

    dependencies: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          source: {
            type: 'object' as const,
            properties: {
              type: { type: 'string' as const, enum: ['step', 'route', 'feature', 'block', 'blockInstance', 'field', 'processVariable'] },
              id: { type: 'string' as const },
            },
            required: ['type', 'id'],
            additionalProperties: false,
          },
          target: {
            type: 'object' as const,
            properties: {
              type: { type: 'string' as const, enum: ['step', 'route', 'feature', 'block', 'blockInstance', 'field', 'processVariable'] },
              id: { type: 'string' as const },
            },
            required: ['type', 'id'],
            additionalProperties: false,
          },
          description: { type: 'string' as const },
        },
        required: ['source', 'target', 'description'],
        additionalProperties: false,
      },
    },

    presets: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          label: { type: 'string' as const },
          description: { type: 'string' as const },
          enabledSteps: { type: 'array' as const, items: { type: 'string' as const } },
          enabledFeatures: { type: 'array' as const, items: { type: 'string' as const } },
          disabledBlocks: { type: 'array' as const, items: { type: 'string' as const } },
          disabledBlockInstances: { type: 'array' as const, items: { type: 'string' as const } },
        },
        required: ['id', 'label', 'description', 'enabledSteps', 'enabledFeatures', 'disabledBlocks', 'disabledBlockInstances'],
        additionalProperties: false,
      },
    },

    warnings: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'Lista de warnings sobre inferências incertas ou itens que precisam de revisão manual',
    },
  },
  required: [
    'templateId', 'name', 'description', 'version', 'baseModel',
    'steps', 'routes', 'features', 'blocks', 'blockInstances',
    'fieldSchemas', 'processVariables', 'dependencies', 'presets', 'warnings',
  ],
  additionalProperties: false,
};

/** Tipo TypeScript derivado do schema acima */
export interface AiBootstrapResponse {
  templateId: string;
  name: string;
  description: string;
  version: string;
  baseModel: string;
  steps: Array<{
    id: string;
    label: string;
    route: string;
    componentClass: string;
    mode: 'edit' | 'readonly' | 'review';
    blocks: string[];
    features: string[];
    optional: boolean;
    variantOf?: string;
  }>;
  routes: Array<{
    stepId: string;
    path: string;
    modulePath: string;
    moduleName: string;
    hasNote?: string;
    routeData: { stepId: string; mode: string };
  }>;
  features: Array<{
    id: string;
    label: string;
    description: string;
    optional: boolean;
    enabledBy?: string[];
  }>;
  blocks: Array<{
    id: string;
    label: string;
    selector: string;
    optional: boolean;
    readOnlyInSteps: string[];
  }>;
  blockInstances: Array<{
    instanceId: string;
    blockId: string;
    hostType: 'page' | 'block';
    hostId: string;
    selector: string;
    templateFile: string;
    dataAttribute: string;
    optional: boolean;
  }>;
  fieldSchemas: Array<{
    blockId: string;
    fields: Array<{
      id: string;
      label: string;
      type: string;
      validators: Array<{ name: string; value?: unknown }>;
      optional: boolean;
      validationVariable: boolean;
      processVariableKey?: string;
      featureDependency?: string;
      readOnlyInSteps: string[];
    }>;
    subBlocks?: Array<{
      blockId: string;
      selector: string;
      fields: Array<{
        id: string;
        label: string;
        type: string;
        validators: Array<{ name: string; value?: unknown }>;
        optional: boolean;
        validationVariable: boolean;
        processVariableKey?: string;
        featureDependency?: string;
        readOnlyInSteps: string[];
      }>;
      optional: boolean;
    }>;
  }>;
  processVariables: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    writtenBy: string[];
    readBy: string[];
    notification: boolean;
    optional: boolean;
    sourceComponent?: string;
    sourceField?: string;
    requiredFeature?: string;
  }>;
  dependencies: Array<{
    source: { type: string; id: string };
    target: { type: string; id: string };
    description: string;
  }>;
  presets: Array<{
    id: string;
    label: string;
    description: string;
    enabledSteps: string[];
    enabledFeatures: string[];
    disabledBlocks: string[];
    disabledBlockInstances: string[];
  }>;
  warnings: string[];
}
