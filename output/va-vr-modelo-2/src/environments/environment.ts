export const environment = {
  server: 'http://189.16.40.50:8180/',
  client_id: '',
  fluxo: 'treinamento',
  valida_versao: false,
  versao: '1.0.1',
  ambiente: '',
  mock: false,
  tenant: '',
  invoke_plugin_id:'f2200c3b-c7df-4040-9613-34f697b75889',
  email_plugin_id: '3ae5088b-3ce4-4651-9b39-f172d1442fcd',
  urls:{
    invoke: 'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/conector/actions/invoke',
    timeout_1_min: 'https://timeout.xplatform.com.br',
    extended_timeout: 'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/bpm_timeout/queries/invoke',
    extented_timeout_async: 'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/bpm_timeout/signals/invokeAsync',
    response_timeout: 'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/bpm_timeout/queries/getTicketResponse'
  },
  webServices: {
    baseUrl: 'URL DA XT',
    module: 'rubi',
    encryption: '0',
    user: '',
    password: ''
  },
};
