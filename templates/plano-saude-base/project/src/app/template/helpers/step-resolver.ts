import { ActivatedRoute } from '@angular/router';
import { StepId, StepMode } from '../types/template.types';

export interface StepRouteData {
  stepId: StepId;
  mode: StepMode;
}

export function resolveStepRouteData(route: ActivatedRoute): StepRouteData {
  const data = route.parent?.snapshot?.data || route.snapshot.data;
  return {
    stepId: data['stepId'] as StepId,
    mode: (data['mode'] as StepMode) || 'edit',
  };
}