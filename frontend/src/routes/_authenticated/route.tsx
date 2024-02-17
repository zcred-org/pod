import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RequireWalletAndDidHoc } from '../../HOC/RequireWalletAndDidHoc.tsx';

export const Route = createFileRoute('/_authenticated')({
  component: () => <RequireWalletAndDidHoc><Outlet/></RequireWalletAndDidHoc>,
});
