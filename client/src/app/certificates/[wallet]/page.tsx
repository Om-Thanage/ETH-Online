'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';

interface Certificate {
  _id: string;
  course: string;
  skills: string[];
  expiresAt: number | null;
  cid: string;
  isRental: boolean;
  tokenId?: number;
  createdAt: string;
  issuerName?: string;
}

export default function UserCertificatesPage() {
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const walletAddress = params.wallet as string;

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);
  const [settleMessage, setSettleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchUserCertificates();
    }
  }, [walletAddress]);

  const fetchUserCertificates = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/credentials?wallet=${walletAddress}`);

      if (res.ok) {
        const data = await res.json();
        setCertificates(data.credentials || []);
      } else {
        setError('Failed to fetch certificates');
      }
    } catch (err) {
      setError('An error occurred while fetching certificates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCertificateStatus = (cert: Certificate): 'active' | 'expired' => {
    if (cert.expiresAt && cert.expiresAt * 1000 < Date.now()) return 'expired';
    return 'active';
  };

  const handleSettlePending = async () => {
    setSettling(true);
    setSettleMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userWallet: walletAddress }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.message === 'Nothing to settle') {
          setSettleMessage('✓ No pending certificates to settle');
        } else {
          setSettleMessage(`✓ Successfully settled ${data.txHashes?.length || 0} certificate(s)!`);
          // Refresh certificates after settling
          await fetchUserCertificates();
        }
      } else {
        setError(data.error || 'Failed to settle pending certificates');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while settling');
      console.error(err);
    } finally {
      setSettling(false);
    }
  };

  const isOwnWallet = connectedAddress?.toLowerCase() === walletAddress?.toLowerCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading certificates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 border border-red-700 max-w-md">
          <div className="text-red-400 text-center">
            <p className="text-xl font-bold mb-2">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {isOwnWallet ? 'My Certificates' : 'User Certificates'}
          </h1>
          
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Wallet Address:</p>
            <p className="font-mono text-white text-lg break-all">{walletAddress}</p>
          </div>

          {isOwnWallet && (
            <div className="mt-4 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded">
              <p className="text-blue-300 text-sm">
                💡 These are your verified on-chain credentials
              </p>
            </div>
          )}

          {/* Settle Pending Button */}
          {isOwnWallet && (
            <div className="mt-4">
              <button
                onClick={handleSettlePending}
                disabled={settling}
                className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
              >
                {settling ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Settling Pending Certificates...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Settle Pending Certificates
                  </>
                )}
              </button>
              {settleMessage && (
                <div className="mt-3 p-3 bg-green-900 bg-opacity-50 border border-green-700 rounded">
                  <p className="text-green-300 text-sm">{settleMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certificates Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Certificates</p>
            <p className="text-3xl font-bold text-white">{certificates.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {certificates.filter((c) => getCertificateStatus(c) === 'active').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Expired</p>
            <p className="text-3xl font-bold text-yellow-400">
              {certificates.filter((c) => getCertificateStatus(c) === 'expired').length}
            </p>
          </div>
        </div>

        {/* Certificates List */}
        {certificates.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Certificates Found</h3>
            <p className="text-gray-400">
              {isOwnWallet
                ? "You don't have any certificates yet"
                : 'This wallet has no certificates'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => {
              const status = getCertificateStatus(cert);
              const isExpired = status === 'expired';

              return (
                <div
                  key={cert._id}
                  className={`bg-gray-800 rounded-lg p-6 border ${
                    isExpired ? 'border-yellow-700' : 'border-gray-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{cert.course}</h3>
                          {cert.issuerName && (
                            <p className="text-gray-400 text-sm">Issued by {cert.issuerName}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {/* Status Badge */}
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-3 py-1 rounded font-bold text-sm ${
                              isExpired
                                ? 'bg-yellow-600 text-white'
                                : 'bg-green-600 text-white'
                            }`}
                          >
                            {isExpired ? '⏰ EXPIRED' : '✓ ACTIVE'}
                          </span>
                          {cert.isRental && (
                            <span className="px-3 py-1 bg-purple-600 rounded font-bold text-sm text-white">
                              🔄 RENTAL
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        {cert.skills && cert.skills.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-sm font-bold mb-1">Skills Covered:</p>
                            <div className="flex flex-wrap gap-2">
                              {cert.skills.map((skill, idx) => (
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

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-gray-700">
                          <div>
                            <p className="text-gray-500 text-xs">Issued Date</p>
                            <p className="text-white font-bold">
                              {new Date(cert.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>

                          {cert.expiresAt && (
                            <div>
                              <p className="text-gray-500 text-xs">
                                {isExpired ? 'Expired On' : 'Expires On'}
                              </p>
                              <p className={`font-bold ${isExpired ? 'text-yellow-400' : 'text-white'}`}>
                                {new Date(cert.expiresAt * 1000).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          )}

                          {cert.tokenId !== undefined && (
                            <div>
                              <p className="text-gray-500 text-xs">Token ID</p>
                              <p className="text-white font-bold font-mono">#{cert.tokenId}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-gray-500 text-xs">Certificate Data</p>
                            <a
                              href={`https://gateway.lighthouse.storage/ipfs/${cert.cid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline font-mono text-xs"
                            >
                              View on IPFS →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
