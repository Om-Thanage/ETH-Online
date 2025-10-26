// lib/yellow.ts
import WebSocket from 'ws';
import { ethers } from 'ethers';
import { createAuthRequestMessage, createAuthVerifyMessage, RPCMethod, parseAnyRPCResponse } from '@erc7824/nitrolite';

const CLEAR_NODE_WS = 'wss://clearnet.yellow.com/ws';
let ws: WebSocket | null = null;
let authenticated = false;

export async function connectClearNode() {
  if (ws && authenticated) return;

  return new Promise<void>(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!authenticated) {
        reject(new Error('WebSocket connection timeout'));
      }
    }, 15000); // 15 second timeout

    ws = new WebSocket(CLEAR_NODE_WS);
    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY!, provider);

    ws.on('open', async () => {
      try {
        const authMsg = await createAuthRequestMessage({
          address: wallet.address as '0x${string}',
          session_key: wallet.address as `0x${string}`,
          app_name: 'SkillCert',
          expire: (Math.floor(Date.now() / 1000) + 3600).toString(),
          scope: 'console',
          application: wallet.address as `0x${string}`,
          allowances: [],
        });
        ws!.send(authMsg);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });

    ws.on('message', async (data) => {
      try {
        const msg = parseAnyRPCResponse(data.toString());

        if (msg.method === RPCMethod.AuthChallenge) {
          const sign = async (payload: any) => {
            const msgStr = JSON.stringify(payload);
            const digest = ethers.id(msgStr);
            return await wallet.signMessage(ethers.getBytes(digest)) as `0x${string}`;
          };
          const verifyMsg = await createAuthVerifyMessage(sign, msg);
          ws!.send(verifyMsg);
        }

        if (msg.method === RPCMethod.AuthVerify && msg.params.success) {
          authenticated = true;
          clearTimeout(timeout);
          resolve();
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    ws.on('close', () => {
      authenticated = false;
      ws = null;
    });
  });
}

export async function sendOffchainMint(data: {
  to: string;
  course: string;
  expires: number;
  cid: string;
  isRental: boolean;
}) {
  try {
    await connectClearNode();

    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY!, provider);
    const contract = new ethers.Contract(
      process.env.ISSUANCE_API_ADDRESS!,
      ['function issueCredential(address,string,uint64,string) returns (uint256)'],
      wallet
    );

    const calldata = contract.interface.encodeFunctionData('issueCredential', [
      data.to,
      data.cid, // URI (IPFS CID)
      data.expires,
      data.course, // skill name
    ]);

    const tx: { req: any[]; sig?: string[] } = {
      req: [
        Date.now(),
        'eth_sendTransaction',
        [{ from: wallet.address, to: process.env.ISSUANCE_API_ADDRESS, data: calldata }],
      ],
    };

    const msg = JSON.stringify(tx);
    const sig = await wallet.signMessage(ethers.getBytes(ethers.id(msg)));
    tx.sig = [sig];

    // Send the transaction but don't wait for response
    // The WebSocket will handle async responses
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(tx));
    } else {
      throw new Error('WebSocket not connected');
    }
  } catch (error) {
    console.error('sendOffchainMint error:', error);
    throw error;
  }
}