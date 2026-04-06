/**
 * TEMPLATE TYPES
 *
 * Contratos da arquitetura template-driven.
 * Estes tipos descrevem o fluxo BPM de forma declarativa,
 * permitindo que geradores ou IA entendam quais partes podem ser variadas.
 */

export type StepId = 'detalhes' | 'solicitacao' | 'revisao' | 'analise-rh';

export type BlockId =
  | 'dados-solicitante'
  | 'beneficio-atual'
  | 'dados-solicitacao'
  | 'observacao-rh'
  | 'observacao-solicitante'
  | 'termo-adesao';

export type FeatureId =
  | 'buscar-dados-solicitante'
  | 'buscar-beneficio-atual'
  | 'buscar-vales-empresa'
  | 'gravar-beneficio'
  | 'revisao-pelo-solicitante'
  | 'analise-rh-com-aprovacao'
  | 'observacao-rh';

export type PresetId = 'modelo-1' | 'modelo-2' | 'modelo-3';

export type StepMode = 'edit' | 'readonly' | 'review';

export type ProcessVariableType = 'string' | 'number' | 'boolean' | 'json';

/** Operações que um gerador pode aplicar para criar variantes a partir do modelo base */
export type OperationType =
  | 'disable_step'
  | 'disable_route'
  | 'disable_feature'
  | 'remove_block'
  | 'remove_block_instance'
  | 'remove_field'
  | 'add_field'
  | 'change_validation'
  | 'rename_label'
  | 'filter_process_variables_by_feature'
  | 'derive_variant_from_preset';

/** Configuração declarativa de uma etapa do fluxo */
export interface StepConfig {
  /** Identificador único, deve corresponder ao segmento de rota Angular */
  id: StepId;
  /** Rótulo exibível */
  label: string;
  /** Rota Angular (sem barra inicial) */
  route: string;
  /** Nome da classe do componente Angular que renderiza a etapa */
  componentClass: string;
  /** Comportamento da etapa perante os dados do processo */
  mode: StepMode;
  /** Blocos de UI exibidos nesta etapa */
  blocks: BlockId[];
  /** Features ativas nesta etapa */
  features: FeatureId[];
  /** Se pode ser omitida em um preset menor sem quebrar o fluxo */
  optional: boolean;
  /**
   * Se esta etapa é uma variante de outra.
   * Exemplo: 'revisao' é uma variante de 'solicitacao' que reutiliza o mesmo componente
   * em modo 'review'. O componente detecta o modo via route data (stepId), não por URL.
   */
  variantOf?: StepId;
}

/** Configuração declarativa de um bloco de UI */
export interface BlockConfig {
  id: BlockId;
  label: string;
  /** Seletor Angular do componente */
  selector: string;
  /** Se pode ser removido em presets menores */
  optional: boolean;
  /** Etapas em que este bloco é somente-leitura */
  readOnlyInSteps: StepId[];
}

/** Configuração declarativa de uma feature */
export interface FeatureConfig {
  id: FeatureId;
  label: string;
  description: string;
  /** Se pode ser desabilitada em presets menores */
  optional: boolean;
  /** IDs de outras features que precisam estar ativas para esta funcionar */
  enabledBy?: FeatureId[];
}

/** Mapeamento declarativo de uma variável do processo */
export interface ProcessVariableConfig {
  /** Chave exata usada em VariaveisProcessoG7DTO */
  key: string;
  label: string;
  type: ProcessVariableType;
  /** Etapas que escrevem esta variável */
  writtenBy: StepId[];
  /** Etapas que lêem esta variável */
  readBy: StepId[];
  /** Se é variável usada apenas para notificações/relatórios (não altera estado do processo) */
  notification: boolean;
  /** Se pode ser omitida em presets menores */
  optional: boolean;
  /**
   * Componente Angular que produz o valor desta variável.
   * Permite que um gerador saiba qual componente remover ou ajustar ao desativar a variável.
   */
  sourceComponent?: string;
  /**
   * Campo ou propriedade dentro do componente-fonte que origina o valor.
   * Corresponde a um formControlName, formArrayName ou getter do componente.
   */
  sourceField?: string;
  /**
   * Feature que deve estar ativa para que esta variável seja preenchida.
   * Se a feature for desabilitada, esta variável ficará indefinida neste preset.
   */
  requiredFeature?: FeatureId;
}

/** Preset de configuração: define o recorte funcional de uma variante do template */
export interface WorkflowPreset {
  id: PresetId;
  label: string;
  description: string;
  enabledSteps: StepId[];
  enabledFeatures: FeatureId[];
  disabledBlocks: BlockId[];
  /** Instâncias de bloco explicitamente removidas neste preset (mais preciso que disabledBlocks) */
  disabledBlockInstances: BlockInstanceId[];
}

// ---------------------------------------------------------------------------
// Instâncias físicas de blocos
// ---------------------------------------------------------------------------

/**
 * ID único de uma instância física de bloco.
 * Formato: <blockId>-<stepId>  ou  <blockId>-<parent-blockId> para sub-blocos.
 * Exemplos: 'observacao-rh-analise-rh', 'observacao-solicitante-dados-solicitacao'.
 */
export type BlockInstanceId = string;

/**
 * Instância física de um bloco de UI dentro de um host específico.
 *
 * Distingue casos como 'app-observacao' para observacao-rh e observacao-solicitante,
 * que são semanticamente diferentes mas usam o mesmo selector Angular.
 * Isso permite que um gerador identifique e remova instâncias corretas sem heurística.
 */
export interface BlockInstanceConfig {
  /** ID único desta instância */
  instanceId: BlockInstanceId;
  /** Bloco semântico a que pertence */
  blockId: BlockId;
  /**
   * Componente Angular que hospeda esta instância.
   * 'page' = page component de uma step; 'block' = sub-bloco dentro de outro bloco.
   */
  hostType: 'page' | 'block';
  /**
   * ID do host:
   * - se hostType='page': StepId da etapa dona do template
   * - se hostType='block': BlockId do componente-pai
   */
  hostId: StepId | BlockId;
  /** Seletor Angular desta instância no template */
  selector: string;
  /**
   * Caminho do arquivo de template onde esta instância aparece,
   * relativo à raiz do projeto.
   */
  templateFile: string;
  /**
   * Atributo usado para identificar esta instância no HTML gerado.
   * Valor do atributo data-template-block-instance nos templates.
   */
  dataAttribute: BlockInstanceId;
  /** Se esta instância pode ser removida em presets menores */
  optional: boolean;
  /**
   * Inputs Angular relevantes aplicados nessa instância.
   * Útil para um gerador entender a configuração sem ler o HTML.
   */
  inputs?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Schema de campos
// ---------------------------------------------------------------------------

/** Nome dos validators suportados para declaração de schema */
export type ValidatorName = 'required' | 'maxLength' | 'minLength' | 'requiredTrue' | 'pattern';

/** Declaração de um validator com seu nome e valor quando aplicável */
export interface ValidatorConstraint {
  name: ValidatorName;
  value?: any;
}

/**
 * Schema declarativo de um campo de formulário.
 * Permite operações de geração: add_field, remove_field, change_validation, rename_label.
 */
export interface FieldSchema {
  /** Identificador do campo (formControlName ou nome semântico para campos sem form) */
  id: string;
  /** Rótulo exibível atual */
  label: string;
  /** Tipo de input do campo */
  type: 'select' | 'checkbox' | 'textarea' | 'text' | 'number' | 'date';
  /** Validators ativos por padrão */
  validators: ValidatorConstraint[];
  /** Se o campo pode ser removido em presets menores */
  optional: boolean;
  /** Se pode ter seus validators alterados entre presets */
  validationVariable: boolean;
  /**
   * Chave na variável de processo relacionada (ver ProcessVariableConfig.key).
   * Permite rastrear origem e destino do valor deste campo no processo.
   */
  processVariableKey?: string;
  /** Feature que deve estar ativa para que este campo apareça */
  featureDependency?: FeatureId;
  /** Steps em que este campo é somente-leitura */
  readOnlyInSteps: StepId[];
}

/** Schema de um bloco de UI com seus campos e eventuais sub-blocos */
export interface BlockFieldSchema {
  blockId: BlockId;
  /** Campos diretos deste bloco */
  fields: FieldSchema[];
  /**
   * Sub-blocos compostos dentro deste bloco (ex: termo-adesao e observacao dentro de dados-solicitacao).
   * Cada sub-block tem seu próprio schema.
   */
  subBlocks?: SubBlockSchema[];
}

/** Sub-bloco físico dentro de um bloco pai: tem selector próprio e campos próprios */
export interface SubBlockSchema {
  /** Block semântico do sub-bloco */
  blockId: BlockId;
  /** Seletor Angular do sub-bloco dentro do template pai */
  selector: string;
  /** Campos do sub-bloco */
  fields: FieldSchema[];
  /** Se este sub-bloco pode ser removido em presets menores */
  optional: boolean;
}

// ---------------------------------------------------------------------------
// Configuração de rotas vinculadas a steps
// ---------------------------------------------------------------------------

/** Configuração de rota vinculada explicitamente a um step */
export interface StepRouteConfig {
  stepId: StepId;
  /** Segmento de rota (sem barra inicial) */
  path: string;
  /** Caminho relativo do NgModule para loadChildren */
  modulePath: string;
  /** Nome do NgModule Angular usado no loadChildren */
  moduleName: string;
  /**
   * Se true, esta rota tem comportamento especial documentado.
   * Ex: /revisao usa o mesmo módulo de /solicitacao intencionalmente.
   */
  hasNote?: string;
  /**
   * Metadata passada para Angular route `data`.
   * Permite que o componente resolva o step e mode sem ler a URL.
   */
  routeData: StepRouteData;
}

// ---------------------------------------------------------------------------
// Route data para Angular
// ---------------------------------------------------------------------------

/** Dados injetados na rota Angular via `data` — acessíveis via ActivatedRoute */
export interface StepRouteData {
  /** Identificador do step servido por esta rota */
  stepId: StepId;
  /** Modo de operação do step nesta rota */
  mode: StepMode;
}

// ---------------------------------------------------------------------------
// Regras de dependência entre entidades
// ---------------------------------------------------------------------------

/** Tipo de entidade envolvida em uma regra de dependência */
export type DependencyEntityType = 'step' | 'route' | 'feature' | 'block' | 'blockInstance' | 'field' | 'processVariable';

/**
 * Regra explícita de dependência/cascata.
 *
 * Declarara que ao desabilitar/remover `source`, o `target` também deve ser
 * desabilitado/removido. Um gerador percorre estas regras transitivamente
 * para calcular o impacto total de uma remoção.
 */
export interface DependencyRule {
  /** Entidade cuja remoção dispara a cascata */
  source: { type: DependencyEntityType; id: string };
  /** Entidade que deve ser removida em consequência */
  target: { type: DependencyEntityType; id: string };
  /** Descrição legível da razão */
  description: string;
}

// ---------------------------------------------------------------------------
// Manifesto principal (estendido)
// ---------------------------------------------------------------------------

/** Manifesto principal do template — ponto de entrada para geradores e IA */
export interface WorkflowTemplateManifest {
  templateId: string;
  name: string;
  description: string;
  /** Versão semântica do template base */
  version: string;
  /** Qual preset representa o modelo mais completo (base) */
  baseModel: PresetId;
  steps: StepConfig[];
  features: FeatureConfig[];
  blocks: BlockConfig[];
  /** Instâncias físicas de blocos — resolve ambiguidade de mesmos selectors */
  blockInstances: BlockInstanceConfig[];
  /** Schemas de campos por bloco — suporta add_field, remove_field, change_validation */
  fieldSchemas: BlockFieldSchema[];
  /** Variáveis do processo com origem e dependências */
  processVariables: ProcessVariableConfig[];
  /** Mapeamento de rotas — vincula steps a suas rotas Angular */
  routes: StepRouteConfig[];
  presets: WorkflowPreset[];
  /** Regras de dependência entre entidades — cascatas obrigatórias ao remover/desabilitar */
  dependencies: DependencyRule[];
  /** Operações que um gerador pode aplicar para derivar variantes */
  allowedOperations: OperationType[];
}
