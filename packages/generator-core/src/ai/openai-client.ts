import OpenAI from 'openai';

let clientInstance: OpenAI | null = null;

/**
 * Retorna uma instância do client OpenAI.
 *
 * A API key é lida SOMENTE de process.env.OPENAI_API_KEY.
 * Falha com erro claro se a variável não estiver definida.
 */
export function getOpenAIClient(): OpenAI {
  if (clientInstance) return clientInstance;

  const apiKey = process.env['OPENAI_API_KEY'];

  if (!apiKey || apiKey === '<PREENCHER_LOCALMENTE>') {
    throw new Error(
      'OPENAI_API_KEY não configurada.\n' +
      'Copie .env.example para .env e preencha com sua chave:\n' +
      '  cp .env.example .env\n' +
      '  # Edite .env com sua API key real\n' +
      '\n⚠️  Nunca commite o .env com a chave real.',
    );
  }

  clientInstance = new OpenAI({
    apiKey,
    baseURL: process.env['OPENAI_BASE_URL'] || undefined,
  });
  return clientInstance;
}

/**
 * Retorna o modelo configurado via OPENAI_MODEL ou o padrão.
 */
export function getModel(): string {
  return process.env['OPENAI_MODEL'] || 'gpt-4o';
}
