/**
 * Schema da resposta JSON esperada da OpenAI para adapt-project.
 *
 * Usado como JSON Schema no parâmetro response_format da API.
 * A IA retorna uma lista de operações de arquivo (criar, modificar, renomear).
 */

export interface AdaptFileOperation {
  /** Tipo de operação */
  action: 'create' | 'modify' | 'rename';
  /** Caminho relativo ao project/ (ex: src/app/template/types/template.types.ts) */
  filePath: string;
  /** Conteúdo completo do arquivo (para create e modify) */
  content?: string;
  /** Novo caminho (apenas para rename) */
  newPath?: string;
  /** Explicação breve da alteração */
  reason: string;
}

export interface AdaptProjectResponse {
  /** Resumo das adaptações realizadas */
  summary: string;
  /** Lista de operações de arquivo a aplicar */
  operations: AdaptFileOperation[];
  /** Padrões que já estavam corretos no projeto */
  alreadyCompliant: string[];
  /** Alertas de situações que precisam revisão manual */
  warnings: string[];
}

export const ADAPT_PROJECT_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    summary: {
      type: 'string' as const,
      description: 'Resumo das adaptações realizadas pela IA',
    },
    operations: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          action: {
            type: 'string' as const,
            enum: ['create', 'modify', 'rename'],
            description: 'Tipo da operação de arquivo',
          },
          filePath: {
            type: 'string' as const,
            description: 'Caminho relativo ao diretório project/ do template',
          },
          content: {
            type: 'string' as const,
            description: 'Conteúdo completo do arquivo (para create e modify)',
          },
          newPath: {
            type: 'string' as const,
            description: 'Novo caminho para a operação rename',
          },
          reason: {
            type: 'string' as const,
            description: 'Explicação breve da alteração',
          },
        },
        required: ['action', 'filePath', 'reason'],
        additionalProperties: false,
      },
    },
    alreadyCompliant: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'Padrões que já estavam OK no projeto',
    },
    warnings: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: 'Alertas que precisam revisão manual',
    },
  },
  required: ['summary', 'operations', 'alreadyCompliant', 'warnings'],
  additionalProperties: false,
};
