'use client';
import { useState } from 'react';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    course: string;
    skills: string[];
    issuedAt: string;
    expiresAt?: number;
    issuerName?: string;
    userWallet: string;
    tokenId?: number;
    cid: string;
    status: 'active' | 'expired' | 'revoked';
    isRental: boolean;
    imageUrl?: string;
    type?: string;
  };
  error?: string;
}

export default function CertificateVerification() {
  const [verifyMethod, setVerifyMethod] = useState<'tokenId' | 'cid' | 'wallet'>('tokenId');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!inputValue.trim()) {
      setResult({
        valid: false,
        error: 'Please enter a value to verify',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let endpoint = '';
      
      if (verifyMethod === 'tokenId') {
        endpoint = `/api/verify?tokenId=${inputValue}`;
      } else if (verifyMethod === 'cid') {
        endpoint = `/api/verify?cid=${inputValue}`;
      } else if (verifyMethod === 'wallet') {
        endpoint = `/api/verify?wallet=${inputValue}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setResult({
          valid: false,
          error: data.error || 'Verification failed',
        });
      }
    } catch (error: any) {
      setResult({
        valid: false,
        error: error.message || 'An error occurred during verification',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputValue('');
    setResult(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Verify Certificate</h2>
        <p className="text-gray-400">
          Verify the authenticity of any certificate using Token ID, IPFS CID, or Wallet Address
        </p>
      </div>

      {/* Verification Method Selector */}
      <div className="mb-6">
        <label className="block text-white font-bold mb-3">Verification Method</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => {
              setVerifyMethod('tokenId');
              setInputValue('');
              setResult(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              verifyMethod === 'tokenId'
                ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-white font-bold">Token ID</span>
              <span className="text-gray-400 text-xs text-center">NFT Token Number</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setVerifyMethod('cid');
              setInputValue('');
              setResult(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              verifyMethod === 'cid'
                ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white font-bold">IPFS CID</span>
              <span className="text-gray-400 text-xs text-center">Content Identifier</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setVerifyMethod('wallet');
              setInputValue('');
              setResult(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              verifyMethod === 'wallet'
                ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white font-bold">Wallet</span>
              <span className="text-gray-400 text-xs text-center">User Address</span>
            </div>
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div className="mb-6">
        <label className="block text-white font-bold mb-2">
          {verifyMethod === 'tokenId' && 'Enter Token ID'}
          {verifyMethod === 'cid' && 'Enter IPFS CID'}
          {verifyMethod === 'wallet' && 'Enter Wallet Address'}
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            placeholder={
              verifyMethod === 'tokenId'
                ? 'e.g., 123'
                : verifyMethod === 'cid'
                ? 'e.g., QmXxxx...'
                : '0x...'
            }
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-mono"
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          {verifyMethod === 'wallet'
            ? 'Returns all certificates for the wallet address'
            : 'Verifies the certificate authenticity on the blockchain'}
        </p>
      </div>

      {/* Verification Result */}
      {result && (
        <div className="mt-6">
          {result.valid ? (
            <div className="bg-green-900 bg-opacity-30 border-2 border-green-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-400 mb-4">✓ Certificate Verified</h3>
                  
                  {result.certificate && (
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded font-bold text-sm ${
                            result.certificate.status === 'revoked'
                              ? 'bg-red-600 text-white'
                              : result.certificate.status === 'expired'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-green-600 text-white'
                          }`}
                        >
                          {result.certificate.status.toUpperCase()}
                        </span>
                        {result.certificate.isRental && (
                          <span className="px-3 py-1 bg-purple-600 rounded font-bold text-sm text-white">
                            RENTAL
                          </span>
                        )}
                        {result.certificate.type && (
                          <span className="px-3 py-1 bg-blue-600 rounded font-bold text-sm text-white">
                            {result.certificate.type}
                          </span>
                        )}
                      </div>

                      {/* Certificate Image (if available) */}
                      {result.certificate.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={result.certificate.imageUrl}
                            alt="Certificate"
                            className="max-w-full rounded-lg border-2 border-gray-600"
                          />
                        </div>
                      )}

                      {/* Certificate Details */}
                      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Course/Certificate</p>
                            <p className="text-white font-bold text-lg">{result.certificate.course}</p>
                          </div>

                          {result.certificate.issuerName && (
                            <div>
                              <p className="text-gray-400 text-sm">Issued By</p>
                              <p className="text-white font-bold">{result.certificate.issuerName}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-gray-400 text-sm">Recipient Wallet</p>
                            <p className="text-white font-mono text-sm break-all">
                              {result.certificate.userWallet}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-sm">Issue Date</p>
                            <p className="text-white font-bold">
                              {new Date(result.certificate.issuedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>

                          {result.certificate.expiresAt && (
                            <div>
                              <p className="text-gray-400 text-sm">
                                {result.certificate.status === 'expired' ? 'Expired On' : 'Expires On'}
                              </p>
                              <p className={`font-bold ${
                                result.certificate.status === 'expired' ? 'text-yellow-400' : 'text-white'
                              }`}>
                                {new Date(result.certificate.expiresAt * 1000).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          )}

                          {result.certificate.tokenId !== undefined && (
                            <div>
                              <p className="text-gray-400 text-sm">Token ID</p>
                              <p className="text-white font-bold font-mono">#{result.certificate.tokenId}</p>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {result.certificate.skills && result.certificate.skills.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-sm mb-2">Skills Covered</p>
                            <div className="flex flex-wrap gap-2">
                              {result.certificate.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* IPFS Link */}
                        <div>
                          <p className="text-gray-400 text-sm">IPFS Storage</p>
                          <a
                            href={`https://gateway.lighthouse.storage/ipfs/${result.certificate.cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline font-mono text-sm break-all"
                          >
                            {result.certificate.cid}
                          </a>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold"
                        >
                          Verify Another
                        </button>
                        <a
                          href={`/certificates/${result.certificate.userWallet}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
                        >
                          View All Certificates
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-900 bg-opacity-30 border-2 border-red-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-red-400 mb-2">✗ Verification Failed</h3>
                  <p className="text-red-300 mb-4">
                    {result.error || 'Certificate not found or invalid'}
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded">
        <p className="text-blue-300 text-sm">
          <strong>💡 How Verification Works:</strong> All certificates are stored on the blockchain and IPFS.
          Verification checks the on-chain data to confirm authenticity, ownership, and current status.
        </p>
      </div>
    </div>
  );
}
