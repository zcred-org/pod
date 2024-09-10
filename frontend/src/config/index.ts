export const config = {
  domain: 'zcred.me',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  zkAppHubOrigin: new URL(import.meta.env['VITE_ZKAPP_HUB_ORIGIN']),
  zCredStoreOrigin: new URL(import.meta.env['VITE_ZCRED_STORE_ORIGIN']),
};
