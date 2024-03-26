import { getConnectorClient as _getConnectorClient } from '@wagmi/core';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { arbitrum, mainnet, polygonMumbai, sepolia } from 'wagmi/chains';

const projectId = '210e2cdbd47e9ccfd099225022759a11';
const metadata = {
  name: 'zCred',
  description: 'zCred website',
  url: 'http://localhost:5173', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};
// const chains = [mainnet, arbitrum] as const;
const chains = [mainnet, arbitrum, sepolia, polygonMumbai] as const;
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

export const web3modal = createWeb3Modal({
  projectId,
  wagmiConfig,
  themeVariables: { '--w3m-border-radius-master': '2px' },
});

export const getConnectorClient = _getConnectorClient.bind(undefined, wagmiConfig);
