import { getConnectorClient as _getConnectorClient } from '@wagmi/core';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import * as chains from 'wagmi/chains';
import { config } from '@/config/index.ts';


const projectId = '210e2cdbd47e9ccfd099225022759a11';
const metadata = {
  name: 'zCred',
  description: 'zCred website',
  url: location.origin, // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const allChains = Object.values(chains).filter((chain: unknown): chain is chains.Chain => {
  const isChain = typeof chain === 'object' && !!chain
    && 'id' in chain && 'name' in chain && 'nativeCurrency' in chain;
  if (!isChain) return false;
  const isTestnet = 'testnet' in chain && chain.testnet;
  return config.isDev || !isTestnet;
}) as unknown as [chains.Chain, ...chains.Chain[]];

export const wagmiConfig = defaultWagmiConfig({
  projectId, metadata,
  chains: allChains,
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
  allowUnsupportedChain: true,
});

export const getConnectorClient = _getConnectorClient.bind(undefined, wagmiConfig);
