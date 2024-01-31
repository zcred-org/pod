import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { polygonMumbai, sepolia } from 'wagmi/chains';

const projectId = '210e2cdbd47e9ccfd099225022759a11';
const metadata = {
  name: 'zCred',
  description: 'zCred website',
  url: 'http://192.168.1.230:5173', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};
// const chains = [mainnet, arbitrum] as const;
const chains = [sepolia, polygonMumbai] as const;
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  projectId,
  wagmiConfig,
});
