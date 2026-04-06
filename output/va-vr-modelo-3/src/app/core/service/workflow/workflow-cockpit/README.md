[![npm][npm-image]][npm-url] [![npm downloads][npm-downloads-image]][npm-url] [![build status][build-image]][build-url]

[build-image]: http://git.senior.com.br/arquitetura/workflow-cockpit/badges/develop/build.svg
[build-url]: http://git.senior.com.br/arquitetura/workflow-cockpit/commits/develop
[npm-image]: https://img.shields.io/npm/v/seniorsistemas/workflow-cockpit.svg
[npm-downloads-image]: https://img.shields.io/npm/dt/seniorsistemas/workflow-cockpit.svg
[npm-url]: https://www.npmjs.com/package/seniorsistemas/workflow-cockpit

# Workflow Cockpit

O cockpit do Workflow é capaz de apresentar dentro de um iframe formulários ECM e interfaces customizadas hospedadas em outros domínios. A comunicação entre as duas partes é realizada por [Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) e abstraída por este componente.

O script já inclui o [iframe-resizer][iframe-resizer-url] como dependência (componente que auxilia o cockpit a exibir o _iframe_ no tamanho correto), não é necessário inclui-lo separadamente.


## Passos para integração

Os scripts do workflow-cockpit podem ser inclusos de duas formas, pela versão "indepenente" ou como um pacote de dependência em sua aplicação front-end.

### Integração via NPM

Inclua o pacote como dependência no seu projeto:

`npm install @seniorsistemas/workflow-cockpit --save`

Em seus componentes, importe o módulo:

```js
const workflowCockpit = require('@seniorsistemas/workflow-cockpit');
```
Ou:
```js
import { workflowCockpit } from '@seniorsistemas/workflow-cockpit';
```

### Integração em páginas web

Incluir o script do workflow em sua página Web.

- Pelo pacote NPM:

  `<script type="text/javascript" src="./node_modules/@seniorsistemas/workflow-cockpit/dist/workflow-cockpit-2.0.0.min.js"></script>`

- Ou pelos servidores Senior:

  `<script type="text/javascript" src="https://cdn.senior.com.br/platform/2.0.0/js/workflow-cockpit-2.0.0.min.js"></script>`

**Obs.:** Recomendamos a utilização de algum componente *polyfill*, ex.: [babel-polyfill](https://www.npmjs.com/package/@babel/polyfill), [Angular polyfill](https://angular.io/guide/browser-support#polyfills).


## Pontos de integração

Para efetuar a integração, execute a função `workflowCockpit` na inicialização da página. Esta função recebe um objeto contendo funções *handlers* para eventos disparados pelo cockpit do Workflow:

```js
const workflow = workflowCockpit({
  init: function(process, workflow) {},
  onSubmit: function(proccessStep, workflow) {},
  onError: function(processError, workflow) {}
});
```

* Caso seja utilizado o modo _Abrir Formulário na Plataforma G7_, poderá ser difinido o handler `init`, que será acionado quando a função é executada e irá prover informações como a instância do processo.
* Caso seja utilizado o modo de exibição _Abrir Formulário no Cockpit do Workflow_, é preciso definir as funções que tratarão cada evento originado pelo cockpit, `onSubmit` e `onError`.


### Handlers de eventos

#### *init(process: WfProcess, workflow: WorkflowCockpit)*

Esta função é executada quando ocorre a criação do *WorkflowCockpit*, ou seja, não é executada por mensagem. Quando for uma nova requisição, o `processInstanceId` será `undefined` pelo simples fato do fluxo ainda não ter sido criado.

```ts
interface WfProcess {
  /** O ID do processo no Workflow, caso já estiver iniciado. */
  processInstanceId: number;
}
```

Exemplo:
```js
function _init(process, workflow) {
   workflow.getPlatformData().then(function(platformData) {
       this.tokenG7 = platformData.token;
       this.serviceUrl = platformData.serviceUrl;
       this.odataUrl = platformData.odataUrl;

       if (workflow.isRequestNew()) {
           this.fields = this.loadData(data.processInstanceId);
       }
   });
}
```


#### *onSubmit(proccessStep: WfProcessStep, workflow: WorkflowCockpit)*

Esta função é executada no momento que o usuário finaliza sua interação com a tela e tenta prosseguir ou iniciar um processo pelo Cockpit. Neste momento, a tela pode realizar a persistência dos dados do formulário e retornar os valores que deseja adicionar às variáveis do fluxo. Pode ser retornada uma Promise ou o próprio objeto contendo os dados.
Toda exceção lançada por essa função não permitirá a continuação do processo por parte do Workflow. Exemplo:

```ts
interface WfProcessStep extends WfProcess {
  nextAction: WfProcessAction;
  nextResponsible: WfProcessResponsible;
}

interface WfProcessResponsible {
  userCode: number;
  name: string;
  subjectKind: string;
}

interface WfProcessAction {
  name: string;
  finish: boolean;
  connectsWithAutomaticGateway: boolean;
}
```

Exemplo:
```js
function _onSubmit(proccessStep, workflow) {
  if (!isValid()) {
      throw Error('Os dados informados são inválidos.');
  }
  return persistData(proccessStep.processInstanceId, workflow.isRequestNew()).then(function(result) {
    return {
        formData: this.proccessStep // objeto contendo os dados dos campos
    };
  });
}
```

**Obs.:** Caso esteja utilizando AngularJS, é importante lembrar que, como a execução dessa função não está associada a um contexto de renderização do AngularJS, é preciso invocar `$scope.$apply()` caso a função `isValid()` modifique alguma variável que afeta a apresentação.


#### *onError(processError: WfProcessError, workflow: WorkflowCockpit)*

Esta função é chamada quando o ocorre algum erro ao iniciar ou responder o fluxo. Após a execução do `save`, se ocorrer algum erro quando o Workflow tentar prosseguir com o processo, este é o momento onde pode ser realizado algum tipo de consistência com o erro ocorrido, por exemplo:

```ts
interface WfProcessError extends WfProcess {
  error: object;
}
```

Exemplo:
```js
function _onError(processError, workflow) {
  console.log(processError.error);
  if (workflow.isRequestNew()) {
     return removeData(processError.processInstanceId);
  }
  return rollbackData(processError.processInstanceId);
}
```

## Funções da instância WorkflowCockpit

O objeto retornado pela função `workflowCockpit` é capaz de obter o identificador da instância do processo que está sendo executada, verificar se o usuário está criando ou respondendo a uma solicitação e obter informações sobre o usuário logado e sobre a plataforma.

* **isRequestNew**: Indica se a tela foi aberta porque o usuário está criando uma solicitação. Se for _false_, indica que o usuário está respondendo a uma solicitação.

* **getUserData**: Obtém um objeto contendo informações sobre o usuário logado no Workflow. É retornada uma promise.
  ```js
  workflow.getUserData().then(function(userData: WfUserData) { /* ... */ });
  ```

  ```ts
  interface WfUserData {
    id: string;
    username: string;
    subject: string;
    email: string;
    fullname: string;
    locale: string;
    tenantName: string;
    tenantLocale: string;
  }
  ```
* **getTaskData**: Obtém um objeto contendo dados da tarefa que está sendo executada na plataforma G7. É retornada uma promise.
  ```js
  workflow.getTaskData().then(function(taskData: WfTaskData) { /* ... */ });
  ```

  ```ts
  interface WfTaskData {
    taskName: string;
    processName: string;
  }
  ```

* **getPlatformData**: Obtém um objeto contendo dados para acessar recursos da plataforma G7. É retornada uma promise.
  ```js
  workflow.getPlatformData().then(function(platformData: WfPlatformData) { /* ... */ });
  ```

  ```ts
  interface WfPlatformData {
    odataUrl: string;
    serviceUrl: string;
    token: WfPlatformDataToken;
  }

  interface WfPlatformDataToken {
    token_type: string;
    access_token: string;
  }
  ```

* **getPlatformProccessVariables**: Obtém uma array contendo as variáveis do processo na plataforma G7. É retornada uma promise.
  ```js
  workflow.getInfoFromProcessVariables().then(function(platformVariables: WfVariable[]) { /* ... */ });
  ```

  ```ts
  interface WfVariable {
    /** String, Integer, Double, Float... */
    type: string;

    /** O nome da variável no fluxo. */
    key: string;

    /** O valor atual da variável no fluxo. */
    value: string;
  }
  ```

# Guia de contribuição

O [guia de contribuição](CONTRIBUTING.md) é responsável por documentar os procedimentos de manutenção e publicação deste componente.

# Documentação de uso

As documentações de uso estão descritas na [Wiki](http://git.senior.com.br/arquitetura/workflow-cockpit/wikis/home).

[iframe-resizer-url]: https://www.npmjs.com/package/iframe-resizer/v/3.5.14
