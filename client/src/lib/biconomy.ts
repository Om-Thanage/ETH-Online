// Biconomy integration for gasless transactions
import { Biconomy } from '@biconomy/mexa';
// Biconomy requires ethers v5
import { ethers } from 'ethers-v5';

let biconomyInstance: any = null;

/**
 * Initialize Biconomy for gasless transactions
 * Get your API key from: https://dashboard.biconomy.io/
 */
export async function initBiconomy() {
  if (biconomyInstance) return biconomyInstance;

  try {
    console.log('[Biconomy] Initializing with API key:', process.env.BICONOMY_API_KEY?.substring(0, 10) + '...');
    const provider = new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC);

    const biconomy = new Biconomy(provider, {
      apiKey: process.env.BICONOMY_API_KEY || '',
      debug: process.env.NODE_ENV === 'development',
      contractAddresses: [process.env.SKILL_NFT_ADDRESS!],  // Changed from ISSUANCE_API_ADDRESS
    });

    biconomyInstance = biconomy;

    return new Promise((resolve, reject) => {
      // Shorter timeout - if Biconomy doesn't initialize in 5 seconds, skip it
      const timeout = setTimeout(() => {
        console.warn('[Biconomy] Initialization timeout - skipping gasless mode');
        reject(new Error('Biconomy initialization timeout'));
      }, 5000);

      biconomy.on('txHashGenerated', (data: any) => {
        console.log('[Biconomy] Transaction hash generated:', data);
      });

      biconomy.on('txMined', (data: any) => {
        console.log('[Biconomy] Transaction mined:', data);
      });

      biconomy.on('error', (error: any) => {
        clearTimeout(timeout);
        console.error('[Biconomy] Error event:', error);
        reject(error);
      });

      // Biconomy becomes ready when provider is available
      biconomy.on('biconomyInitialized', () => {
        clearTimeout(timeout);
        console.log('[Biconomy] ✅ Initialized and ready for gasless transactions');
        resolve(biconomy);
      });

      // Alternative: check if already initialized
      if ((biconomy as any).status === 'biconomy_ready') {
        clearTimeout(timeout);
        console.log('[Biconomy] ✅ Already initialized');
        resolve(biconomy);
      }
    });
  } catch (error) {
    console.error('[Biconomy] Initialization failed:', error);
    throw error;
  }
}

/**
 * Send a gasless transaction using Biconomy
 */
export async function sendGaslessTransaction(data: {
  to: string;
  course: string;
  expires: number;
  cid: string;
  isRental: boolean;
}) {
  try {
    // Check if Biconomy is configured
    if (!process.env.BICONOMY_API_KEY) {
      throw new Error('BICONOMY_API_KEY not configured');
    }

    const biconomy = await initBiconomy();
    const biconomyProvider = biconomy.getEthersProvider();
    const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY!, biconomyProvider);

    // Call SkillNFT.mintToUser directly
    const contractABI = [
      'function mintToUser(address to, string memory uri, uint64 expires, string memory skill) external returns (uint256)'
    ];

    const contract = new ethers.Contract(
      process.env.SKILL_NFT_ADDRESS!,  // Changed from ISSUANCE_API_ADDRESS
      contractABI,
      wallet
    );

    console.log('[Biconomy] Sending gasless transaction:', {
      to: data.to,
      cid: data.cid,
      course: data.course
    });

    // Send transaction through Biconomy
    const tx = await contract.mintToUser(data.to, data.cid, data.expires, data.course);
    console.log('[Biconomy] Transaction submitted:', tx.hash);

    const receipt = await tx.wait();
    console.log('[Biconomy] Transaction confirmed! Block:', receipt.blockNumber);

    return {
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    };
  } catch (error: any) {
    console.error('[Biconomy] Transaction failed:', error);
    throw error;
  }
}

/**
 * Check if Biconomy is available
 */
export function isBiconomyAvailable(): boolean {
  return !!(process.env.BICONOMY_API_KEY && process.env.BICONOMY_API_KEY.length > 0);
}
