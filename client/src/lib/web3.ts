import { ethers } from 'ethers';

export const AMOY_CHAIN_ID_DEC = 80002;
export const AMOY_CHAIN_ID_HEX = '0x13882';

export async function ensureAmoyNetwork(provider: any) {
  if (!provider?.request) return;
  try {
    const chainIdHex = await provider.request({ method: 'eth_chainId' });
    const current = parseInt(chainIdHex, 16);
    if (current !== AMOY_CHAIN_ID_DEC) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AMOY_CHAIN_ID_HEX }],
        });
      } catch (switchErr: any) {
        // If chain not added, add it
        if (switchErr?.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: AMOY_CHAIN_ID_HEX,
                chainName: 'Polygon Amoy',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }
    }
  } catch (e) {
    console.warn('ensureAmoyNetwork warning:', e);
  }
}

export async function mintWithIssuer(params: {
  to: string;
  metadataUri: string;
  expires: number;
  course: string;
  contractAddress: string;
}): Promise<{ hash: string; blockNumber: number; tokenId?: number }>
{
  // Use window.ethereum provider
  // @ts-ignore
  const injected = (globalThis as any).ethereum;
  if (!injected) throw new Error('Wallet not found. Please connect a wallet.');

  await ensureAmoyNetwork(injected);

  const provider = new ethers.BrowserProvider(injected);
  const signer = await provider.getSigner();

  // Preflight: ensure issuer has some MATIC for gas on Amoy
  try {
    const bal = await provider.getBalance(await signer.getAddress());
    const min = ethers.parseEther('0.01');
    if (bal < min) {
      throw new Error('Insufficient MATIC on Polygon Amoy to pay gas. Please top up via an Amoy faucet.');
    }
  } catch {
    // ignore balance fetch errors; wallet may still proceed
  }

  const abi = [
    'function mintToUser(address to, string uri, uint64 expires, string skill) returns (uint256)',
    'event CredentialMinted(uint256 indexed tokenId, address indexed user, uint64 expiresAt, string skill, address indexed issuer)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
  ];

  const contract = new ethers.Contract(params.contractAddress, abi, signer) as any;
  let receipt: any;

  // Small helper to estimate gas (if available) and send
  const sendMint = async (expiresValue: number) => {
    let txOptions: any = {};
    try {
      if (contract?.estimateGas?.mintToUser) {
        const gas = await contract.estimateGas.mintToUser(
          params.to,
          params.metadataUri,
          expiresValue || 0,
          params.course
        );
        txOptions.gasLimit = (gas * BigInt(120)) / BigInt(100);
      }
    } catch {
      // if estimateGas not available or fails, proceed without gasLimit (wallet/node will estimate)
    }
    const tx = await contract.mintToUser(
      params.to,
      params.metadataUri,
      expiresValue || 0,
      params.course,
      txOptions
    );
    return await tx.wait();
  };

  try {
    // Try a static call first (if available) to detect clear reverts
    try {
      if (contract?.mintToUser?.staticCall) {
        await contract.mintToUser.staticCall(
          params.to,
          params.metadataUri,
          params.expires || 0,
          params.course
        );
      }
    } catch (staticErr: any) {
      const msg: string = staticErr?.reason || staticErr?.shortMessage || staticErr?.message || '';
      if (msg.includes('Not owner/approved')) {
        // Retry static with expires = 0 if method exists
        try {
          if (contract?.mintToUser?.staticCall) {
            await contract.mintToUser.staticCall(
              params.to,
              params.metadataUri,
              0,
              params.course
            );
          }
        } catch {}
        receipt = await sendMint(0);
        return finalize(receipt, abi);
      }
      // unknown staticCall failure; continue to try sending
    }

    // Normal path
    receipt = await sendMint(params.expires || 0);
  } catch (e: any) {
    const reason: string = e?.reason || e?.shortMessage || e?.message || '';
    if (reason.includes('Not owner/approved')) {
      receipt = await sendMint(0);
    } else if (e?.code === -32603 || reason.includes('Internal JSON-RPC error')) {
      throw new Error('RPC node error while sending transaction. Ensure Polygon Amoy (80002) is selected, the contract address is correct, and the issuer wallet has MATIC for gas. Then try again.');
    } else {
      throw e;
    }
  }

  // Try to parse tokenId from event logs
  let tokenId: number | undefined = undefined;
  try {
    const iface = new ethers.Interface(abi);
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === 'CredentialMinted') {
          const tid = parsed.args?.[0];
          if (tid) tokenId = Number(tid.toString());
        }
      } catch {}
    }
  } catch {}

  return { hash: receipt.hash, blockNumber: receipt.blockNumber ?? 0, tokenId };
}

function finalize(receipt: any, abi: string[]) {
  let tokenId: number | undefined = undefined;
  try {
    const iface = new ethers.Interface(abi);
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if ((parsed as any)?.name === 'CredentialMinted') {
          const tid = (parsed as any).args?.[0];
          if (tid) tokenId = Number(tid.toString());
        } else if ((parsed as any)?.name === 'Transfer') {
          const tid = (parsed as any).args?.[2];
          if (tid) tokenId = Number(tid.toString());
        }
      } catch {}
    }
  } catch {}
  return { hash: receipt.hash, blockNumber: receipt.blockNumber ?? 0, tokenId } as {
    hash: string; blockNumber: number; tokenId?: number
  };
}
