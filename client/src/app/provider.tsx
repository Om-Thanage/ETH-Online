"use client";
import { Web3AuthProvider, type Web3AuthContextConfig } from "@web3auth/modal/react";
import { IWeb3AuthState, WEB3AUTH_NETWORK, BUTTON_POSITION, CONFIRMATION_STRATEGY, type Web3AuthOptions} from "@web3auth/modal";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const clientId = "BBU0ujHwgkqA3a2ET5Jtzb2PlIN_og1XRE0Tg9r2XLFRNrtX5vJWqkuw1I6Jn_UjtW0-klb6LnyZopjfy-xLQJk"; // get from https://dashboard.web3auth.io
const queryClient = new QueryClient();

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  walletServicesConfig: {
    confirmationStrategy: CONFIRMATION_STRATEGY.MODAL,
    modalZIndex: 99999,
    enableKeyExport: false,
    whiteLabel: {
      showWidgetButton: true,
      buttonPosition: BUTTON_POSITION.BOTTOM_RIGHT,
      hideNftDisplay: false,
      hideTokenDisplay: false,
      hideTransfers: false,
      hideTopup: false,
      hideReceive: false,
      hideSwap: false,
      hideShowAllTokens: false,
      hideWalletConnect: false,
      defaultPortfolio: 'token',
    },
  },
}
 
const web3AuthContextConfig: Web3AuthContextConfig = {
    web3AuthOptions,
  };

export default function Provider({ children, web3authInitialState }: 
  { children: React.ReactNode, web3authInitialState: IWeb3AuthState | undefined }) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig} initialState={web3authInitialState}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>
        {children}
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
