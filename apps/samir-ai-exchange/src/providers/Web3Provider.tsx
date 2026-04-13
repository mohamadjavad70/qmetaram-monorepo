import { ReactNode } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const queryClient = new QueryClient();

// Only create wagmi config if projectId is available
const config = projectId
  ? getDefaultConfig({
      appName: 'Samir AI Exchange',
      projectId,
      chains: [bsc],
      ssr: false,
    })
  : null;

export function Web3Provider({ children }: { children: ReactNode }) {
  // If no WalletConnect projectId, render children without Web3 providers
  if (!config) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#f59e0b', borderRadius: 'medium' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
