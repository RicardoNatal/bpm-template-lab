// Type definitions for Senior Workflow Cockpit 2.x
// Project: http://git.senior.com.br/arquitetura/workflow-cockpit
// Definitions by: luiz.nazari <http://git.senior.com.br/Luiz.Nazari>
// Definitions: http://git.senior.com.br/arquitetura/workflow-cockpit/@types
// TypeScript Version: 3.1.6

// TODO completar documentação.

export interface WfVariable {

    /**
     * Values: String, Integer, Double, Float, ?.
     */
    type: string;

    /**
     * O nome da variável no fluxo.
     */
    key: string;

    /**
     * O valor atual da variável no fluxo.
     */
    value: string;

}

export interface WfUserData {

    id: string;
    username: string;
    subject: string;
    email: string;
    fullname: string;
    locale: string;
    tenantName: string;
    tenantLocale: string;

}

export interface WfPlatformDataToken {

    token_type: string;
    access_token: string;

}

export interface WfTaskData {

    taskName: string;
    processName: string;

}

export interface WfPlatformData {

    odataUrl: string;
    serviceUrl: string;
    token: WfPlatformDataToken;

}

export interface WorkflowCockpit {

    isRequestNew: () => boolean;

    getUserData: () => Promise<WfUserData>;

    getTaskData: () => Promise<WfTaskData>;

    getPlatformData: () => Promise<WfPlatformData>;

    getInfoFromProcessVariables: () => Promise<WfVariable[]>;

}

export interface WfProcessResponsible {

    userCode: number;
    name: string;
    subjectKind: string;

}

export interface WfProcessAction {

    name: string;
    finish: boolean;
    connectsWithAutomaticGateway: boolean;

}

export interface WfProcess {

    processInstanceId: number;

}

export interface WfProcessStep extends WfProcess {

    nextAction: WfProcessAction;
    nextResponsible: WfProcessResponsible;

}

export interface WfProcessError extends WfProcess {

    error: object;

}

export interface WfFormData {

    formData?: object;

}

export interface WorkflowCockpitConnector {

    init?: (process: WfProcess, workflow: WorkflowCockpit) => void;

    onSubmit?: (proccessStep: WfProcessStep, workflow: WorkflowCockpit) => Promise<WfFormData | undefined> | WfFormData | undefined;

    onError?: (processError: WfProcessError, workflow: WorkflowCockpit) => void;

}

export function workflowCockpit(connector: WorkflowCockpitConnector): WorkflowCockpit;
