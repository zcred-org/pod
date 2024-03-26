const zkAppHubOrigin = new URL(import.meta.env['VITE_ZKAPP_HUB_ORIGIN']);
const zCredStoreOrigin = new URL(import.meta.env['VITE_ZCRED_STORE_ORIGIN']);

export const config = {
  zkAppHubOrigin,
  zCredStoreOrigin,
};
