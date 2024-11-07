export const config = {
  appName: 'ZCred App',
  domain: 'zcred.me',
  frameTime: 1_000 / 60,

  isDev: /*import.meta.env.DEV ||*/ localStorage.getItem('isDev') === 'true'
    || new URLSearchParams(window.location.search).has('dev'),
  zkAppHubOrigin: new URL(import.meta.env.VITE_ZKAPP_HUB_ORIGIN),
  zCredStoreOrigin: new URL(import.meta.env.VITE_ZCRED_STORE_ORIGIN),
  walletConnectProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string,
};
