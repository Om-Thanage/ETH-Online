"use client";
import { useEffect, useState } from "react";
import { MetaMaskSDK, type SDKProvider } from "@metamask/sdk";

const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Eth-Online",
    url: "https://ethglobal.com/events/ethonline2025",
    iconUrl: "https://docs.metamask.io/img/metamask-logo.svg",
  },
  infuraAPIKey: process.env.VITE_INFURA_API_KEY,
});

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<SDKProvider | undefined>();
  const [account, setAccount] = useState<string | undefined>();
  const [balance, setBalance] = useState<number | undefined>();

  useEffect(() => {
    setProvider(MMSDK.getProvider());
  }, []);

  const connect = async () => {
    const accounts = await MMSDK.connect();
    setAccount(accounts[0]);
    if (accounts.length > 0) {
      setIsConnected(true);
    }
  };

  const terminate = async () => {
    await MMSDK.terminate();
    setIsConnected(false);
    setBalance(undefined);
    setAccount(undefined);
  };

  const getBalance = async () => {
    if (!account || !provider) {
      return;
    }
    const result = await provider?.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });
    const decimal = BigInt(result as string);
    const balance = (await Number(decimal)) / 10 ** 18;
    console.log(balance.toFixed(4));
    setBalance(balance);
  };

  // const batchRequest = async () => {
  //   if (!account || !provider) {
  //     return;
  //   }
  //   const batchResults = await provider.request({
  //     method: "metamask_batch",
  //     params: [
  //       { method: "eth_accounts" },
  //       { method: "eth_getBalance", params: [account, "latest"] },
  //       { method: "eth_chainId" },
  //     ],
  //   });
  //   console.log(batchResults);
  // };

  return (
    <>
    <div>
        {isConnected ? (
        <>
            <p className="text-lg font-bold text-[#00ff90] break-all">
                Connected to {account}
            </p>
            {balance && (
                <p className="text-base font-semibold text-[#ffde59]">
                    Balance: {balance?.toFixed(4)} Sepolia ETH
                </p>
            )}
            <button
            onClick={getBalance}
            className="px-6 py-2 bg-white text-black border-4 border-black font-bold rounded-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
            >
                Get Balance
            </button>
            <button
            onClick={terminate}
            className="px-6 py-2 bg-[#ff3b3b] text-white border-4 border-white font-bold rounded-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
            >
                Disconnect
            </button>
        </>
        ) : (
        <>
            <button
            onClick={connect}
            className="px-8 py-3 bg-white text-black border-4 border-black font-bold rounded-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
            >
                Connect
            </button>
        </>
        )}
    </div>
    </>
  );
}

export default App;