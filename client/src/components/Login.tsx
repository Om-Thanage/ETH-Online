"use client";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import WalletUIButton from "./WalletUi";

function Login() {
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  // function uiConsole(...args: any[]): void {
  //   const el = document.querySelector("#console>p");
  //   if (el) {
  //     el.innerHTML = JSON.stringify(args || {}, null, 2);
  //     console.log(...args);
  //   }
  // }

  const handleCopy = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error("Failed to copy address: ", err);
      }
    }
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  }

  const loggedInView = (
    <div className="flex justify-end items-center gap-6">
      {/* <h2>Connected to {connector?.name}</h2> */}
      <div className="flex items-center gap-3">
        <a
          href={`/certificates/${address}`}
          className="bg-blue-600 text-white px-4 py-2 font-bold hover:bg-blue-500 active:shadow-none transition-all rounded"
        >
          My Certificates
        </a>
      </div>
      <div className="flex items-center gap-3 text-white bg-gray-800 px-4 py-2 border-2 border-white rounded">
        {!userInfo?.name ? (
          <>
            <span>Wallet: {formatAddress(address)}</span>
            <button
              onClick={handleCopy}
              className="hover:text-blue-400 transition-all"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Copy size={18} className="text-white" />
              )}
            </button>
          </>
        ) : (
          <WalletUIButton />
        )}
      </div>
      <div>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 text-white px-5 py-2 font-bold hover:bg-red-500 active:shadow-none transition-all"
        >
          Log Out
        </button>
        {disconnectLoading && <div className="text-yellow-400 mt-1">Disconnecting...</div>}
        {disconnectError && <div className="text-red-400 mt-1">{disconnectError.message}</div>}
      </div>
    </div>
  );

  const unloggedInView = (
    <div className="flex flex-col justify-end">
      <button
        onClick={() => connect()}
        className="bg-green-600 text-white px-5 py-2 font-bold hover:bg-green-500 active:shadow-none transition-all"
      >
        Login
      </button>
      {connectLoading && <div className="text-yellow-400 mt-1">Connecting...</div>}
      {connectError && <div className="text-red-400 mt-1">{connectError.message}</div>}
    </div>
  );

  return (
    <div>
      {isConnected ? loggedInView : unloggedInView}
      {/* <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div> */}
    </div>
  );
}

export default Login;
