import { BlockFieldSchema } from '@template/types/template.types';

/**
 * SCHEMAS DE CAMPOS
 *
 * Define declarativamente os campos, sub-blocos e validators de cada bloco de UI.
 * Permite que um gerador execute as operações: add_field, remove_field,
 * change_validation e rename_label sem precisar parsear HTML.
 *
 * Cobre TODOS os blocos do fluxo com campos relevantes para geração.
 */
export const FIELD_SCHEMAS: BlockFieldSchema[] = [
  // ── dados-solicitante ────────────────────────────────────────────────────
  {
    blockId: 'dados-solicitante',
    fields: [
      {
        id: 'NNumCad',
        label: 'Matrícula',
        type: 'number',
        validators: [],
        optional: false,
        validationVariable: false,
        processVariableKey: 'matriculaSolicitante',
        featureDependency: 'buscar-dados-solicitante',
        readOnlyInSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
      },
      {
        id: 'ANomFun',
        label: 'Nome',
        type: 'text',
        validators: [],
        optional: false,
        validationVariable: false,
        processVariableKey: 'nomeSolicitante',
        featureDependency: 'buscar-dados-solicitante',
        readOnlyInSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
      },
      {
        id: 'NNumEmp',
        label: 'Empresa',
        type: 'text',
        validators: [],
        optional: false,
        validationVariable: false,
        featureDependency: 'buscar-dados-solicitante',
        readOnlyInSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
      },
      {
        id: 'NCodFil',
        label: 'Filial',
        type: 'text',
        validators: [],
        optional: false,
        validationVariable: false,
        featureDependency: 'buscar-dados-solicitante',
        readOnlyInSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
      },
      {
        id: 'ANomCcu',
        label: 'Centro de custo',
        type: 'text',
        validators: [],
        optional: false,
        validationVariable: false,
        featureDependency: 'buscar-dados-solicitante',
        readOnlyInSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
      },
    ],
  },

  // ── beneficio-atual ──────────────────────────────────────────────────────
  {
    blockId: 'beneficio-atual',
    fields: [
      {
        id: 'NCodVal',
        label: 'Código Vale',
        type: 'text',
        validators: [],
        optional: false,
        validationVariable: false,
        processVariableKey: 'codValeAtual',
        featureDependency: 'buscar-beneficio-atual',
        readOnlyInSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
      },
      {
        id: 'ADesVal',
        label: 'Descrição',
        type: 'text',
        validators: [],
        optional: false,
        validationVariable: false,
        processVariableKey: 'nomValeAtual',
        featureDependency: 'buscar-beneficio-atual',
        readOnlyInSteps: ['solicitacao', 'revisao', 'analise-rh', 'detalhes'],
      },
    ],
  },

  // ── dados-solicitacao (com sub-blocos) ───────────────────────────────────
  {
    blockId: 'dados-solicitacao',
    fields: [],
    subBlocks: [
      {
        blockId: 'dados-solicitacao',
        selector: 'app-select',
        optional: false,
        fields: [
          {
            id: 'beneficioSelecionado',
            label: 'Alterar benefício VA/VR para',
            type: 'select',
            validators: [{ name: 'required' }],
            optional: false,
            validationVariable: false,
            processVariableKey: 'codNovoVale',
            featureDependency: 'buscar-vales-empresa',
            readOnlyInSteps: ['analise-rh', 'detalhes', 'revisao'],
          },
        ],
      },
      {
        blockId: 'termo-adesao',
        selector: 'app-termo-adesao',
        optional: true,
        fields: [
          {
            id: 'termo',
            label: 'Aceito os termos de adesão',
            type: 'checkbox',
            validators: [{ name: 'requiredTrue' }],
            optional: true,
            validationVariable: false,
            processVariableKey: 'dadosSolicitacao',
            readOnlyInSteps: ['analise-rh', 'detalhes', 'revisao'],
          },
        ],
      },
      {
        blockId: 'observacao-solicitante',
        selector: 'app-observacao',
        optional: true,
        fields: [
          {
            id: 'observacaoSolicitante',
            label: 'Observação do Solicitante',
            type: 'textarea',
            validators: [{ name: 'maxLength', value: 500 }],
            optional: true,
            validationVariable: true,
            processVariableKey: 'observacaoSolicitante',
            readOnlyInSteps: ['analise-rh', 'detalhes', 'revisao'],
          },
        ],
      },
    ],
  },

  // ── observacao-rh ────────────────────────────────────────────────────────
  {
    blockId: 'observacao-rh',
    fields: [
      {
        id: 'observacaoRh',
        label: 'Observação do RH',
        type: 'textarea',
        // Obrigatoriedade é dinâmica: setarValidadores() ativado apenas quando ação = 'Revisar'.
        validators: [{ name: 'maxLength', value: 500 }],
        optional: true,
        validationVariable: true,
        processVariableKey: 'observacaoRh',
        featureDependency: 'observacao-rh',
        readOnlyInSteps: ['revisao', 'detalhes'],
      },
    ],
  },
];
