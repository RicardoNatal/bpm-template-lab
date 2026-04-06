@ **************************************************************************** @
@ Desenvolvido por: Vinicius Nunes                                             @
@ Data: 19/03/2026                                                               @
@ Revisão: 1                                                                   @
@ **************************************************************************** @

Definir interno.com.senior.automacao.wf.va.vr.retornaValesPorEmpresa this;

@ ================================ Variáveis ================================= @
Definir Numero nNumEmp;
Definir Numero nCodVal;
Definir Numero mTabEve;
Definir Numero nCodUsu;

Definir Alfa aDesVal;
Definir Alfa aRetorno;

Definir Alfa aSqlBuscaSolicitante;
Definir Alfa aSqlBuscaVales;

Definir Alfa cBuscaSolicitante;
Definir Alfa cBuscaVales;

Definir Funcao fDefiniSqls();
Definir Funcao fBuscaSolicitante();
Definir Funcao fBuscaVales();
Definir Funcao fRetornaValores();
Definir Funcao fRetornaErro();

nNumEmp = 0;
nCodVal = 0;
mTabEve = 0;
nCodUsu = CodUsu;
aDesVal = "";
aRetorno = "NOK";
aSqlBuscaSolicitante = "";
aSqlBuscaVales = "";

fDefiniSqls();
fBuscaSolicitante();
fRetornaErro();

Funcao fDefiniSqls();
{
    aSqlBuscaSolicitante = "SELECT                                                                                              \
                              R034FUN.NUMEMP                                                        \
                        FROM                                                                        \
                              R034USU                                                               \
                              INNER JOIN R034FUN                                                    \
                                   ON R034FUN.NUMEMP = R034USU.NUMEMP                               \
                                  AND R034FUN.TIPCOL = R034USU.TIPCOL                               \
                                  AND R034FUN.NUMCAD = R034USU.NUMCAD                               \
                        WHERE R034USU.CODUSU = :nCodUsu";

    aSqlBuscaVales = "SELECT                                                                                                                                                  \
                        USU_TPARVAL.USU_CODVAL,                                                                                                         \
                        USU_TPARVAL.USU_TABEVE,                                                                                                         \
                        USU_TPARVAL.USU_NUMEMP,                                                                                                         \
                        R044TVL.DESVAL                                                                                                                  \
                      FROM                                                                                                                              \
                        USU_TPARVAL                                                                                                                     \
                      INNER JOIN R044TVL ON R044TVL.CODVAL = USU_TPARVAL.USU_CODVAL                                                                     \
                      AND R044TVL.TABEVE = USU_TPARVAL.USU_TABEVE                                                                                       \
                      WHERE USU_TPARVAL.USU_NUMEMP = :nNumEmp";
}

Funcao fBuscaSolicitante();
{
    aRetorno = "[ERRO] Não foi encontrado um usuário G5 vinculado ao solicitante";
    SQL_Criar(cBuscaSolicitante);
    SQL_UsarSqlSenior2(cBuscaSolicitante, 0);
    SQL_UsarAbrangencia(cBuscaSolicitante, 0);
    SQL_DefinirComando(cBuscaSolicitante, aSqlBuscaSolicitante);
    SQL_DefinirInteiro(cBuscaSolicitante, "nCodUsu", nCodUsu);
    SQL_AbrirCursor(cBuscaSolicitante);
    Se(SQL_EOF(cBuscaSolicitante) = 0)
    {
        SQL_RetornarInteiro(cBuscaSolicitante, "NumEmp", nNumEmp);
        aRetorno = "OK";
    }
    SQL_FecharCursor(cBuscaSolicitante);
    SQL_Destruir(cBuscaSolicitante);
    Se(aRetorno = "OK")
    {
        fBuscaVales();
    }
}

Funcao fBuscaVales();
{
    aRetorno = "NOK";
    SQL_Criar(cBuscaVales);
    SQL_UsarSqlSenior2(cBuscaVales, 0);
    SQL_UsarAbrangencia(cBuscaVales, 0);
    SQL_DefinirComando(cBuscaVales, aSqlBuscaVales);
    SQL_DefinirInteiro(cBuscaVales, "nNumEmp", nNumEmp);
    SQL_AbrirCursor(cBuscaVales);
    Enquanto(SQL_EOF(cBuscaVales) = 0)
    {
        SQL_RetornarInteiro(cBuscaVales, "USU_CODVAL", nCodVal);
        SQL_RetornarInteiro(cBuscaVales, "USU_TABEVE", nTabEve);
        SQL_RetornarAlfa(cBuscaVales, "DesVal", aDesVal);
        aRetorno = "OK";
        fRetornaValores();
        SQL_Proximo(cBuscaVales);
    }
    SQL_FecharCursor(cBuscaVales);
    SQL_Destruir(cBuscaVales);
}

Funcao fRetornaValores();
{
    this.lTabVal.criarLinha();
    this.lTabVal.nCodVal = nCodVal;
    this.lTabVal.aDesVal = aDesVal;
    this.lTabVal.nTabEve = nTabEve;
}

Funcao fRetornaErro();
{
    this.aRetorno = aRetorno;
}
