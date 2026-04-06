import { CampoModel } from "@senior-hcm-service-tower/hst-dados/model/campo.model";
import { DadosColaborador } from "src/app/shared/models/colaboradores.model";

export function montaCamposColaborador(colab: DadosColaborador): CampoModel[]{
  return [
    {
      label: "Matrícula/Nome",
      valor: `${String(colab.NNumCad)} - ${colab.ANomFun}`,
      tamanho: "P"
    },
    {
      label: "Empresa",
      valor: `${String(colab.NNumEmp)} - ${colab.ANomEmp}`,
      tamanho: "P"
    },
    {
      label: "Filial",
      valor: `${String(colab.NCodFil)} - ${colab.ANomFil}`,
      tamanho: "P"
    },
    {
      label: "Centro de custo",
      valor: colab.ANomCcu,
      tamanho: "P"
    }
  ]
}
