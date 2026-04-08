import { CampoModel } from "@senior-hcm-service-tower/hst-dados/model/campo.model";
import { DadosColaborador } from "src/app/shared/models/colaboradores.model";

export function montaCamposColaborador(colab: DadosColaborador): CampoModel[]{
  return [
    {
      label: "Matrícula",
      valor: String(colab.NNumCad),
      tamanho: "P"
    },
    {
      label: "Nome",
      valor: colab.ANomFun,
      tamanho: "P"
    },
    {
      label: "Empresa",
      valor: `${String(colab.NNumEmp)} - ${colab.ANomEmp}`,
      tamanho: "M"
    },
    {
      label: "Filial",
      valor: `${String(colab.NCodFil)} - ${colab.ANomFil}`,
      tamanho: "M"
    },
    {
      label: "Centro de custo",
      valor: colab.ANomCCU,
      tamanho: "M"
    }
  ]
}