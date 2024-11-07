import type { router } from '@/app.tsx';
import type { VerificationErrorActions } from '@/stores/verification-store/verification-error-actions.tsx';


type AppGlobal = {
  router: router;
  VerificationErrorActions: typeof VerificationErrorActions;
};

/**
 * Variable to replace globalThis,
 * and to replace exports due to cyclic dependencies,
 * which at the moment it is not yet clear how to refactor.
 *
 * Dependencies should be placed at App entry point.
 */
export const AppGlobal: AppGlobal = {} as AppGlobal;
