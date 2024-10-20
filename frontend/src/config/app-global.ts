import type { router } from '@/main.tsx';
import type { VerificationErrorActions } from '@/stores/verification-store/verification-error-actions.tsx';

type AppGlobal = {
  router: typeof router;
  VerificationErrorActions: typeof VerificationErrorActions;
};

/**
 * Variable to replace globalThis,
 * and to replace exports due to cyclic dependencies,
 * which at the moment it is not yet clear how to refactor.
 *
 * Dependencies must be inserted in it at the creation place.
 */
export const AppGlobal: AppGlobal = {} as AppGlobal;
