// lib/yellow.ts
import WebSocket from 'ws';
import { ethers } from 'ethers';
import { createAuthRequestMessage, createAuthVerifyMessage, createEIP712AuthMessageSigner, RPCMethod, parseAnyRPCResponse } from '@erc7824/nitrolite';

const CLEAR_NODE_WS = 'wss://clearnet.yellow.com/ws';
let ws: WebSocket | null = null;
let authenticated = false;
let connectionPromise: Promise<void> | null = null;
let authRequestData: any = null; // Store auth request data for EIP-712 signing

export async function connectClearNode() {
  // Return existing connection if already authenticated
  if (ws && authenticated) return;
  
  // Return existing connection attempt if in progress
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise<void>(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!authenticated) {
        reject(new Error('WebSocket connection timeout - please check CLEAR_NODE_WS URL and credentials'));
      }
    }, 15000); // 15 second timeout

    // Validate environment variables before attempting connection
    if (!process.env.MUMBAI_RPC) {
      clearTimeout(timeout);
      connectionPromise = null;
      reject(new Error('MUMBAI_RPC environment variable is not set'));
      return;
    }
    
    if (!process.env.BACKEND_PRIVATE_KEY) {
      clearTimeout(timeout);
      connectionPromise = null;
      reject(new Error('BACKEND_PRIVATE_KEY environment variable is not set'));
      return;
    }

    ws = new WebSocket(CLEAR_NODE_WS);
    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);

    ws.on('open', async () => {
      try {
        // Prepare auth request parameters
        const authParams = {
          address: wallet.address as '0x${string}',
          session_key: wallet.address as `0x${string}`,
          app_name: 'SkillCert',
          expire: (Math.floor(Date.now() / 1000) + 3600).toString(),
          scope: 'console',
          application: wallet.address as `0x${string}`,
          allowances: [],
        };
        
        // Store for later EIP-712 signing
        authRequestData = authParams;
        
        const authMsg = await createAuthRequestMessage(authParams);
        ws!.send(authMsg);
      } catch (error) {
        clearTimeout(timeout);
        connectionPromise = null;
        reject(error);
      }
    });

    ws.on('message', async (data) => {
      try {
        const msg = parseAnyRPCResponse(data.toString());

        if (msg.method === RPCMethod.AuthChallenge) {
          // Create EIP-712 signer using the wallet client
          const walletClient = {
            account: { address: wallet.address as `0x${string}` },
            signTypedData: async (params: any) => {
              // Use ethers v6 for EIP-712 signing
              const domain = params.domain;
              const types = params.types;
              const message = params.message;
              
              // Remove EIP712Domain from types as ethers handles it automatically
              const { EIP712Domain, ...typesWithoutDomain } = types;
              
              const signature = await wallet.signTypedData(domain, typesWithoutDomain, message);
              return signature as `0x${string}`;
            }
          };

          const eip712MessageSigner = createEIP712AuthMessageSigner(
            walletClient as any,
            {
              scope: authRequestData.scope,
              application: authRequestData.application,
              participant: authRequestData.session_key,
              expire: authRequestData.expire,
              allowances: authRequestData.allowances,
            },
            {
              name: authRequestData.app_name,
            }
          );
          
          const verifyMsg = await createAuthVerifyMessage(eip712MessageSigner, msg);
          ws!.send(verifyMsg);
        }

        if (msg.method === RPCMethod.AuthVerify && msg.params.success) {
          authenticated = true;
          clearTimeout(timeout);
          resolve();
        }
        
        // Handle error responses from Yellow.com
        if (msg.method === 'error' || (msg as any).error) {
          const errorMsg = (msg as any).params?.error || (msg as any).error || 'Unknown error';
          
          // Only log authentication errors during auth flow, not general errors
          if (!authenticated) {
            console.warn('[Yellow.com] Authentication error:', errorMsg);
          } else {
            console.warn('[Yellow.com] Error:', errorMsg);
          }
          // Don't reject - just log the warning and let it timeout
        }
      } catch (error) {
        console.warn('[Yellow.com] Message parse error:', error);
        // Don't reject on parse errors, continue listening
      }
    });

    ws.on('error', (error) => {
      console.warn('[Yellow.com] WebSocket error:', error.message);
      clearTimeout(timeout);
      connectionPromise = null;
      reject(error);
    });

    ws.on('close', () => {
      authenticated = false;
      ws = null;
      connectionPromise = null;
    });
  });

  return connectionPromise;
}

export async function sendOffchainMint(data: {
  to: string;
  course: string;
  expires: number;
  cid: string;
  isRental: boolean;
}) {
  try {
    // Validate required environment variables
    if (!process.env.BACKEND_PRIVATE_KEY) {
      throw new Error('BACKEND_PRIVATE_KEY environment variable is not set');
    }
    if (!process.env.MUMBAI_RPC) {
      throw new Error('MUMBAI_RPC environment variable is not set');
    }
    if (!process.env.ISSUANCE_API_ADDRESS) {
      throw new Error('ISSUANCE_API_ADDRESS environment variable is not set');
    }

    await connectClearNode();

    const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      process.env.ISSUANCE_API_ADDRESS,
      ['function issueCredential(address,string,uint64,string) returns (uint256)'],
      wallet
    );

    const calldata = contract.interface.encodeFunctionData('issueCredential', [
      data.to,
      data.cid, // URI (IPFS CID)
      data.expires,
      data.course, // skill name
    ]);

    const requestId = Date.now();
    const timestamp = Date.now();
    
    // Create the request payload following Yellow.com format
    const requestData = [
      requestId,
      'eth_sendTransaction',
      [{ 
        from: wallet.address, 
        to: process.env.ISSUANCE_API_ADDRESS, 
        data: calldata 
      }],
      timestamp
    ];

    // Sign the entire request array (not the wrapper object)
    const msgToSign = JSON.stringify(requestData);
    const digest = ethers.id(msgToSign);
    const messageBytes = ethers.getBytes(digest);
    
    // Sign without EIP-191 prefix by using the low-level signing
    const signature = wallet.signingKey.sign(messageBytes);
    const sig = ethers.Signature.from(signature).serialized;

    const tx = {
      req: requestData,
      sig: [sig]
    };

    // Send the transaction but don't wait for response
    // The WebSocket will handle async responses
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(tx));
      console.log('[Yellow.com] Transaction sent:', { to: data.to, course: data.course });
    } else {
      throw new Error('WebSocket not connected');
    }
  } catch (error) {
    console.error('sendOffchainMint error:', error);
    throw error;
  }
}