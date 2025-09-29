import React, { useState } from 'react';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

// Import dApp Kit CSS
import '@mysten/dapp-kit/dist/index.css';

// Configure networks
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

// Create a new query client
const queryClient = new QueryClient();

function App() {
  const [defaultNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
        <WalletProvider>
          {/* Use the same workaround as before for RouterProvider */}
          {React.createElement(RouterProvider as any, { router })}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
