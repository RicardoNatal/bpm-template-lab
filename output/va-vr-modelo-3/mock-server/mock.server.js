const http = require('http');
const fs = require('fs');
const path = require('path');
const HEADER_RESPONSE = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, client_id',
};

const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://localhost:4200'
];

// Criar o servidor HTTP
http.createServer((req, res) => {

  console.log('--- NOVA REQUISIÇÃO ---');
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);

  const origin = req.headers.origin;

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, client_id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }


  if (req.url === '/t/senior.com.br/bridge/1.0/rest/platform/conector/actions/invoke' && req.method === 'POST') {
    let body = '';

    // Coletar os dados do corpo da requisição
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // Processar os dados quando a transmissão estiver completa
    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body);
        console.log("----BODY RECEBIDO----")
        console.log(parsedBody)
        const { server, module, service, port, user, password, encryption } = parsedBody.inputData || {};
        sendResponse(server, module, service, port, user, password, encryption, res, req);
      } catch (err) {
        res.writeHead(400, HEADER_RESPONSE);
        res.end(JSON.stringify({ error: err }));
      }
    });
  } else {
    res.writeHead(404, HEADER_RESPONSE);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}).listen(8080, () => {
  console.log('Servidor HTTP rodando na porta 8080');
});


// Função para enviar a resposta com base nos parâmetros recebidos
function sendResponse(server, module, service, port, user, password, encryption, res, req) {
  if (!server || !module || !service || !port) {
    sendRequiredInputsError(res);
    return;
  }


  const hasAuthHeader = req.headers['authorization'];
  if (!hasAuthHeader) {
    sendAuthorizationHeaderMissingError(res)
    return;
  }

  const userAndPassIsPlaintext = !encryption || encryption == '0';
  const userAndPassIsSeniorDefault = (user == 'senior') && (password == 'senior');

  if (userAndPassIsPlaintext && !userAndPassIsSeniorDefault) {
    sendUnauthorizedError(res);
    return;
  }

  const filePathMockOut = path.join(__dirname, 'mock.out.json');
  const filePathMockOutConfig = path.join(__dirname, 'mock.out.config.json');
  let hasErrorConfigured = false;

  fs.readFile(filePathMockOutConfig, 'utf8', (err, dataConfig) => {
    if (err) {
      sendReadFileError(res, filePathMockOutConfig);
      return;
    }

    const jsonData = JSON.parse(dataConfig || '{}');
    const shouldHasError = jsonData && jsonData.error;
    if (shouldHasError) {
      hasErrorConfigured = errorResponse(jsonData, port, res);
    }

    if (!hasErrorConfigured) {
      fs.readFile(filePathMockOut, 'utf8', (err, dataOut) => {
        if (err) {
          sendReadFileError(res, filePathMockOut);
          return;
        }

        successResponse(dataOut, module, service, port, res);
      });
    }
  });
}

// Função para manipular respostas de sucesso
function successResponse(data, module, service, port, res) {
  try {
    const jsonData = JSON.parse(data || '{}');
    res.writeHead(200, HEADER_RESPONSE);
    if (jsonData[module] && jsonData[module][service] && jsonData[module][service][port]) {

      const mockedData = jsonData[module][service][port] || {};

      const response = {
        outputData: {
          responseCode: 200,
          // variáveis de saída
          ...mockedData
        }
      }

      res.end(JSON.stringify(response));
    } else {
      res.end('[]');
    }
  } catch (parseErr) {
    console.error('Erro ao analisar o JSON:', parseErr);
  }
}

// Função para manipular respostas de erro quando configuradas
function errorResponse(jsonData, port, res) {
  const shouldBeTimeoutError = jsonData.timeout && Array.isArray(jsonData.timeout) && jsonData.timeout.includes(port);
  const shouldBeRuntimeError = jsonData.erroExecucao && Array.isArray(jsonData.erroExecucao) && jsonData.erroExecucao.includes(port);
  console.log("ERROR RESPONSE: ", port)
  console.log("ShouldBeTimeoutError: ",shouldBeTimeoutError)
  console.log("ShouldBeRuntimeError: ",shouldBeRuntimeError)

  if (shouldBeTimeoutError) {
    errorPayload = {
      message: 'Destination did not respond in required time form primitve: invoke',
      errorCode: 'bridge.destination_timeout',
      reason: 'REQUEST_TIMEOUT',
      domain: 'platform',
      service: 'conector',
    };
    res.writeHead(504, HEADER_RESPONSE);
    res.end(JSON.stringify(errorPayload));
    return true;
  }

  if (shouldBeRuntimeError) {
    errorPayload = {
      outputData: {
        message: 'Ocorreu um erro ao executar o serviço "Modelo para servidor mock": TESTE VALIDAÇÃO.',
        info: 'O plugin funcionou! O erro está no XT, favor verificar o log do webservice!',
        responseCode: 400
      }
    };
    res.writeHead(200, HEADER_RESPONSE);
    res.end(JSON.stringify(errorPayload));
    return true;
  }

  return false;

}

function sendUnauthorizedError(res) {
  errorPayload = { outputData: {
      message: 'Ocorreu um erro ao executar o serviço "Modelo para servidor mock": Credenciais inválidas/desabilitadas/expiradas.',
      info: 'O plugin funcionou! O erro está no XT, favor verificar o log do webservice!',
      responseCode: 401
    }
  };
  res.writeHead(200, HEADER_RESPONSE);
  res.end(JSON.stringify(errorPayload));
}

function sendRequiredInputsError(res) {
  errorPayload = { error: 'Module, server, service e port são obrigatórios' };
  res.writeHead(400, HEADER_RESPONSE);
  res.end(JSON.stringify(errorPayload));
}

function sendAuthorizationHeaderMissingError(res) {
  errorPayload = { message: 'Unauthorized' };
  res.writeHead(401, HEADER_RESPONSE);
  res.end(JSON.stringify(errorPayload));
}

function sendReadFileError(res, filePath) {
  console.error('Erro ao ler o arquivo:', err);
  res.writeHead(500, HEADER_RESPONSE);
  res.end(JSON.stringify({ error: 'Erro ao tentar ler o arquivo ' + filePath }));
}
