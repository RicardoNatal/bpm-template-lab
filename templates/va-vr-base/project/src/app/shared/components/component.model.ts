/**
 * Capacidade de preencher campos externos e retornar seus valores.
 * Implementado por qualquer componente que participa do fluxo de dados do formulário.
 */
export interface ComponenteFormulario<TIn = any, TOut = any> {
  preencherFormulario(dados: TIn): void;
  retornaValores(): TOut;
}

/**
 * Capacidade de inicializar com dados vindos de uma fonte externa (ex: API).
 * Separado de preencherFormulario porque inicialização pode incluir lógica adicional
 * (ex: montar colunas, configurar opções).
 */
export interface ComponenteInicializavel<T = any> {
  inicializarComponente(dados: T): void;
}

/**
 * Capacidade de habilitar e desabilitar campos do componente.
 */
export interface ComponenteHabilitavel {
  desabilitarCampos(): void;
  habilitarCampos(): void;
}

/**
 * Capacidade de validar, limpar e restaurar validadores.
 * Implementado por componentes que possuem validação explícita no fluxo.
 */
export interface ComponenteValidavel {
  validarFormulario(): boolean;
  limparValidadores(): void;
  setarValidadores(): void;
}

/**
 * @deprecated Prefira compor as interfaces específicas:
 * ComponenteFormulario, ComponenteInicializavel, ComponenteHabilitavel, ComponenteValidavel.
 * Mantido como alias para compatibilidade com componentes que implementam o contrato completo.
 */
export type ComponentModel = ComponenteFormulario &
  ComponenteInicializavel &
  ComponenteHabilitavel &
  ComponenteValidavel;

