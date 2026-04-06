@ **************************************************************************** @
@ Desenvolvido por:                                                             @
@ Data: 19/03/2026                                                             @
@ Revisão: 1                                                                   @
@ **************************************************************************** @

Definir interno.com.senior.automacao.wf.va.vr.gravaBeneficioNovo this;
Definir bs.com.senior.g5.rh.bs.vales.assinalamentos wsAssinalamentos;

@ ================================ Variáveis ================================= @
Definir Numero nNumEmp;
Definir Numero nTipCol;
Definir Numero nNumCad;

@ Vale atual (a ser excluído) @
Definir Numero nCodValAtual;

@ Novo vale (a ser incluído) @
Definir Numero nCodValNovo;
Definir Numero nQtdValNovo;
Definir Numero nVlrValNovo;

Definir Alfa aErroExecucao;
Definir Alfa aSqlBuscaVale;
Definir Alfa aTipOpe;

Definir Alfa cBuscaVale;

Definir Funcao fDefiniSqls();
Definir Funcao fBuscaDadosNovoVale();
Definir Funcao fExcluiValeAtual();
Definir Funcao fIncluiNovoVale();

nNumEmp = 0;
nTipCol = 0;
nNumCad = 0;
nCodValAtual = 0;
nCodValNovo = 0;
nQtdValNovo = 0;
nVlrValNovo = 0;
aErroExecucao = "";
aSqlBuscaVale = "";
aTipOpe = "";
@ ================================ Execução ================================== @

nNumEmp = this.nNumEmp;
nTipCol = this.nTipCol;
nNumCad = this.nNumCad;
nCodValAtual = this.nCodValAtual;
nCodValNovo = this.nCodValNovo;

fDefiniSqls();
fBuscaDadosNovoVale();

@ ================================ Finalizando =============================== @
final:
Se(aErroExecucao <> "")
{
    this.aRetorno = aErroExecucao;
}

@ ================================ Funções ================================== @
Funcao fDefiniSqls();
{
    aSqlBuscaVale = "SELECT                                                                                                  \
                        R044TVL.NROMAX,                                                                 \
                        R044TVL.VLRVAL                                                                  \
                      FROM                                                                              \
                        R044TVL                                                                         \
                        INNER JOIN USU_TPARVAL                                                          \
                          ON USU_TPARVAL.USU_CODVAL = R044TVL.CODVAL                                    \
                          AND USU_TPARVAL.USU_TABEVE= R044TVL.TABEVE                                    \
                      WHERE                                                                             \
                        R044TVL.TABEVE = 1                                                              \
                        AND R044TVL.CODVAL = :nCodValNovo                                               \
                        AND USU_TPARVAL.USU_NUMEMP = :nNumEmp";
}

Funcao fBuscaDadosNovoVale();
{
    aErroExecucao = "[ERRO] Novo vale não encontrado na tabela R044TVL.";

    SQL_Criar(cBuscaVale);
    SQL_UsarSqlSenior2(cBuscaVale, 0);
    SQL_UsarAbrangencia(cBuscaVale, 0);
    SQL_DefinirComando(cBuscaVale, aSqlBuscaVale);
    SQL_DefinirInteiro(cBuscaVale, "nNumEmp", nNumEmp);
    SQL_DefinirInteiro(cBuscaVale, "nCodValNovo", nCodValNovo);
    SQL_AbrirCursor(cBuscaVale);

    Se(SQL_EOF(cBuscaVale) = 0)
    {
        SQL_RetornarInteiro(cBuscaVale, "NROMAX", nQtdValNovo);
        SQL_RetornarInteiro(cBuscaVale, "VLRVAL", nVlrValNovo);
        aErroExecucao = "";
    }

    SQL_FecharCursor(cBuscaVale);
    SQL_Destruir(cBuscaVale);

    Se(aErroExecucao = "")
    {
        fExcluiValeAtual();
    }
    Senao
    {
        VaPara  final;
    }
}

Funcao fExcluiValeAtual();
{
    aTipOpe = "E";
    wsAssinalamentos.tipOpe = aTipOpe;
    wsAssinalamentos.numEmp = nNumEmp;
    wsAssinalamentos.tipCol = nTipCol;
    wsAssinalamentos.numCad = nNumCad;
    wsAssinalamentos.codVal = nCodValAtual;
    wsAssinalamentos.modoExecucao = 2;
    wsAssinalamentos.Executar();
    aErroExecucao = wsAssinalamentos.ErroExecucao;

    Se(aErroExecucao = "")
    {
        fIncluiNovoVale();
    }
    Senao
    {
        aErroExecucao = "[ERRO] Falha ao excluir vale atual: " + aErroExecucao;
        VaPara  final;
    }
}

Funcao fIncluiNovoVale();
{
    aTipOpe = "I";
    wsAssinalamentos.tipOpe = aTipOpe;
    wsAssinalamentos.numEmp = nNumEmp;
    wsAssinalamentos.tipCol = nTipCol;
    wsAssinalamentos.numCad = nNumCad;
    wsAssinalamentos.codVal = nCodValNovo;
    wsAssinalamentos.qtdVal = nQtdValNovo;
    wsAssinalamentos.vlrVal = nVlrValNovo;
    wsAssinalamentos.perSub = 100;
    wsAssinalamentos.modoExecucao = 2;
    wsAssinalamentos.Executar();
    aErroExecucao = wsAssinalamentos.ErroExecucao;

    Se(aErroExecucao <> "")
    {
        aErroExecucao = "[ERRO] Falha ao incluir novo vale: " + aErroExecucao;
        VaPara  final;
    }

    this.aRetorno = "OK";
}
