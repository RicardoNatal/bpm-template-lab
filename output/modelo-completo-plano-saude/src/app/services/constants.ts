export type Module =
  | 'rubi'
  | 'ronda'
  | 'bs'
  | 'cs'
  | 'jr'
  | 'plr'
  | 'ql'
  | 'rs'
  | 'sm'
  | 'tr';

export const rubi = {
  name: 'rubi' as Module,
  beneficios: {
    service: "br.com.senior.beneficios",
    ports:{
      planos: "buscarPlanos",
      dependentes: "retornarPlanoAtual",
      gravar: "persistirPlanoSaude",
    }
  },
  geral: {
    service: "br.com.senior.geral",
    ports:{
      solicitante: "dadosSolicitante",
      colaboradores: "buscarColaboradores",
    }
  }
}
