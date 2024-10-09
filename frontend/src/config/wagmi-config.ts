import { getConnectorClient as _getConnectorClient } from '@wagmi/core';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import * as chains from 'wagmi/chains';
import { config } from '@/config/index.ts';


const metadata = {
  name: 'zCred',
  description: 'zCred website',
  url: location.origin, // origin must match your domain & subdomain
  icons: [new URL('logo.svg', location.origin).href],
};

const allChains = Object.values(chains).filter((chain: unknown): chain is chains.Chain => {
  const isChain = typeof chain === 'object' && !!chain
    && 'id' in chain && 'name' in chain && 'nativeCurrency' in chain;
  if (!isChain) return false;
  const isTestnet = 'testnet' in chain && chain.testnet;
  return config.isDev || !isTestnet;
}) as unknown as [chains.Chain, ...chains.Chain[]];

export const wagmiConfig = defaultWagmiConfig({
  metadata, projectId: config.walletConnectProjectId,
  chains: allChains,
  auth: {
    socials: [],
    email: false,
    walletFeatures: false,
  },
});

export const web3modal = createWeb3Modal({
  metadata, projectId: config.walletConnectProjectId,
  wagmiConfig,
  themeVariables: { '--w3m-border-radius-master': '2px' },
  allowUnsupportedChain: true,
});

export const getConnectorClient = _getConnectorClient.bind(undefined, wagmiConfig);
