import type { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';

export type CredentialMarked = ZCredStore['CredentialDecoded'] & { isProvable: boolean, isUpdatable: boolean };
