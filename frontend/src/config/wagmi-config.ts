import { getConnectorClient as _getConnectorClient } from '@wagmi/core';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet } from 'wagmi/chains';

const projectId = '210e2cdbd47e9ccfd099225022759a11';
const metadata = {
  name: 'zCred',
  description: 'zCred website',
  url: location.origin, // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const wagmiConfig = defaultWagmiConfig({
  projectId, metadata,
  chains: [mainnet],
  auth: {
    socials: [],
    email: false,
    walletFeatures: false,
  },
});

export const web3modal = createWeb3Modal({
  projectId, metadata,
  wagmiConfig,
  themeVariables: { '--w3m-border-radius-master': '2px' },
});

export const getConnectorClient = _getConnectorClient.bind(undefined, wagmiConfig);
