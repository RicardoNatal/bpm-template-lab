import { ActivatedRoute } from '@angular/router';
import { WORKFLOW_STEPS } from '../config/workflow-steps.config';
import { ROUTE_STEP_MAP } from '../config/workflow-routes.config';
import { StepConfig, StepId, StepMode, StepRouteData } from '../types/template.types';

/**
 * STEP RESOLVER — Utilitários para resolução de step a partir de contexto Angular.
 *
 * Elimina a necessidade de router.url.startsWith() ou strings hardcoded nos components.
 * Toda resolução passa pela config (WORKFLOW_STEPS, ROUTE_STEP_MAP).
 */

/** Resolve StepConfig a partir do StepId */
export function resolveStepById(stepId: StepId): StepConfig | undefined {
  return WORKFLOW_STEPS.find((s) => s.id === stepId);
}

/** Resolve StepConfig a partir do path de rota */
export function resolveStepFromPath(path: string): StepConfig | undefined {
  const stepId = ROUTE_STEP_MAP[path];
  return stepId ? resolveStepById(stepId) : undefined;
}

/**
 * Resolve StepRouteData a partir do ActivatedRoute.
 *
 * Acessa route.parent?.snapshot.data porque em módulos lazy-loaded o
 * componente recebe a rota-filha (''), e os dados injetados estão na rota-pai.
 *
 * Uso:
 * ```ts
 * const routeData = resolveStepRouteData(this.route);
 * this.isRevisao = routeData.stepId === 'revisao';
 * ```
 */
export function resolveStepRouteData(route: ActivatedRoute): StepRouteData {
  const data = route.parent?.snapshot?.data ?? route.snapshot?.data ?? {};
  return {
    stepId: data['stepId'] as StepId ?? 'detalhes',
    mode: data['mode'] as StepMode ?? 'readonly',
  };
}

/**
 * Resolve StepConfig completa a partir do ActivatedRoute.
 * Combina resolveStepRouteData + resolveStepById.
 */
export function resolveCurrentStep(route: ActivatedRoute): StepConfig | undefined {
  const { stepId } = resolveStepRouteData(route);
  return resolveStepById(stepId);
}
