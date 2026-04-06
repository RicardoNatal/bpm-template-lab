import { Module } from "@services/constants"
import { environment } from "src/environments/environment"

export interface BodyInterface{
  id: string,
  inputData: Record<string, any> & {
    server: string,
    module: string,
    port: string,
    service: string,
    user: string,
    password: string,
    encryption: string
  }
  ticketRequest?: string;
}

export function buildBody(service: string, porta: string, dados: Record<string, any> = {}, module: Module = "rubi", ticketRequest?: string): BodyInterface {
  
  var body: BodyInterface = {
    id: environment.invoke_plugin_id,
    inputData: {
      server: environment.webServices.baseUrl,
      module: module,
      port: porta,
      service: service,
      user: environment.webServices.user,
      password: environment.webServices.password,
      encryption: environment.webServices.encryption,
      ...dados
    }
  }

  if(ticketRequest){
    body['ticketRequest'] = ticketRequest
  }

  console.log(body)

  return body
}