import { Injectable } from '@angular/core';
import { WorkflowService } from '../service/workflow/workflow.service';

@Injectable({
  providedIn: 'root',
  deps: [WorkflowService],
})
export class AppInitializerService {
  constructor(private workflowService: WorkflowService) {}

  async getCredentials(): Promise<void> {
    try {
      const plataFormData = await this.workflowService.requestPlatformData();
      sessionStorage.setItem('senior-token', plataFormData.token.access_token);
      const userData = await this.workflowService.requestUserData();
      sessionStorage.setItem('userData', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

export function AppInitializerFactory(init: AppInitializerService) {
  return async (): Promise<void> => {
    return await init.getCredentials();
  };
}
