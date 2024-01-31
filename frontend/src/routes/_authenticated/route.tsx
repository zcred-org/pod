import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location, context }) => {
    if (!context.auth.isAuthorized) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      });
    }
  },
});
