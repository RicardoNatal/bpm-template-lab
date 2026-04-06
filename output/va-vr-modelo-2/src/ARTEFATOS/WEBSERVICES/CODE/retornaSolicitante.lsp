@ **************************************************************************** @
@ Desenvolvido por: Vinicius Nunes                                             @
@ Data: 21/11/2025                                                             @
@ Revisão: 1                                                                   @
@ **************************************************************************** @

Definir interno.com.senior.automacao.wf.va.vr.retornaSolicitante this;

@ ================================ Variáveis ================================= @
Definir Numero nNumCad;
Definir Numero nNumEmp;
Definir Numero nTipCol;
Definir Numero nCodFil;

Definir Alfa aNomEmp;
Definir Alfa aNomFil;
Definir Alfa aCodCcu;
Definir Alfa aNomCcu;
Definir Alfa aNomFun;

Definir Numero nCodUsu;
Definir Alfa aRetorno;

Definir Alfa aSqlBuscaSolicitante;
Definir Alfa cBuscaSolicitante;

Definir Funcao fDefiniSql();
Definir Funcao fBuscaSolicitante();
Definir Funcao fRetornaValores();
Definir Funcao fRetornaErro();

nNumCad = 0;
nNumEmp = 0;
nTipCol = 0;
nCodFil = 0;
aNomEmp = "";
aNomFil = "";
aCodCcu = "";
aNomCcu = "";
aNomFun = "";
nCodUsu = CodUsu;
aRetorno = "NOK";

fDefiniSql();
fBuscaSolicitante();
fRetornaValores();

Funcao fBuscaSolicitante();
{
    SQL_Criar(cBuscaSolicitante);
    SQL_UsarSqlSenior2(cBuscaSolicitante, 0);
    SQL_UsarAbrangencia(cBuscaSolicitante, 0);
    SQL_DefinirComando(cBuscaSolicitante, aSqlBuscaSolicitante);
    SQL_DefinirInteiro(cBuscaSolicitante, "nCodUsu", nCodUsu);
    SQL_AbrirCursor(cBuscaSolicitante);
    Se(SQL_EOF(cBuscaSolicitante) = 0)
    {
        SQL_RetornarInteiro(cBuscaSolicitante, "NumEmp", nNumEmp);
        SQL_RetornarInteiro(cBuscaSolicitante, "NumCad", nNumCad);
        SQL_RetornarInteiro(cBuscaSolicitante, "TipCol", nTipCol);
        SQL_RetornarInteiro(cBuscaSolicitante, "CodFil", nCodFil);
        SQL_RetornarAlfa(cBuscaSolicitante, "NomEmp", aNomEmp);
        SQL_RetornarAlfa(cBuscaSolicitante, "NomFil", aNomFil);
        SQL_RetornarAlfa(cBuscaSolicitante, "CodCcu", aCodCcu);
        SQL_RetornarAlfa(cBuscaSolicitante, "NomCcu", aNomCcu);
        SQL_RetornarAlfa(cBuscaSolicitante, "NomFun", aNomFun);
        aRetorno = "OK";
    }
    SQL_FecharCursor(cBuscaSolicitante);
    SQL_Destruir(cBuscaSolicitante);
}

Funcao fDefiniSql();
{
    aSqlBuscaSolicitante = "SELECT                                                                                              \
                              R034FUN.NUMCAD,                                                       \
                              R034FUN.NOMFUN,                                                       \
                              R034FUN.NUMEMP,                                                       \
                              R030EMP.NOMEMP,                                                       \
                              R034FUN.TIPCOL,                                                       \
                              R034FUN.CODFIL,                                                       \
                              R030FIL.NOMFIL,                                                       \
                              R034FUN.CODCCU,                                                       \
                              R018CCU.NOMCCU                                                        \
                        FROM                                                                        \
                              R034USU                                                               \
                              INNER JOIN R034FUN                                                    \
                                   ON R034FUN.NUMEMP = R034USU.NUMEMP                               \
                                  AND R034FUN.TIPCOL = R034USU.TIPCOL                               \
                                  AND R034FUN.NUMCAD = R034USU.NUMCAD                               \
                              INNER JOIN R030EMP                                                    \
                                   ON R030EMP.NUMEMP = R034FUN.NUMEMP                               \
                              INNER JOIN R030FIL                                                    \
                                   ON R030FIL.NUMEMP = R034FUN.NUMEMP                               \
                                  AND R030FIL.CODFIL = R034FUN.CODFIL                               \
                              INNER JOIN R018CCU                                                    \
                                   ON R018CCU.CODCCU = R034FUN.CODCCU                               \
                                  AND R018CCU.NUMEMP = R034FUN.NUMEMP                               \
                        WHERE R034USU.CODUSU = :nCodUsu";
}

Funcao fRetornaValores();
{
    this.nNumEmp = nNumEmp;
    this.nNumCad = nNumCad;
    this.nTipCol = nTipCol;
    this.nCodFil = nCodFil;
    this.aNomEmp = aNomEmp;
    this.aNomFil = aNomFil;
    this.aCodCcu = aCodCcu;
    this.aNomCcu = aNomCcu;
    this.aNomFun = aNomFun;
    this.aRetorno = aRetorno;
}
