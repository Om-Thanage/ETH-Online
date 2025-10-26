'use client';
import { useState, useEffect } from 'react';

interface Certificate {
  _id: string;
  userWallet: string;
  course: string;
  skills: string[];
  expiresAt: number | null;
  cid: string;
  isRental: boolean;
  tokenId?: number;
  createdAt: string;
  status?: 'active' | 'expired' | 'revoked';
}

interface ManageCertificatesProps {
  apiKey: string;
}

export default function ManageCertificates({ apiKey }: ManageCertificatesProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/credentials', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCertificates(data.credentials || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (tokenId: number, userWallet: string) => {
    const additionalDays = prompt('Enter number of days to extend:');
    if (!additionalDays || isNaN(Number(additionalDays))) return;

    setActionLoading(`renew-${tokenId}`);
    try {
      const res = await fetch('/api/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          tokenId,
          userWallet,
          additionalDays: Number(additionalDays),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Certificate renewed! New expiration: ${new Date(data.newExpires * 1000).toLocaleString()}`);
        fetchCertificates();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (tokenId: number) => {
    if (!confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      return;
    }

    setActionLoading(`revoke-${tokenId}`);
    try {
      const res = await fetch('/api/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ tokenId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Certificate revoked successfully');
        fetchCertificates();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getCertificateStatus = (cert: Certificate): 'active' | 'expired' | 'revoked' => {
    if (cert.status === 'revoked') return 'revoked';
    if (cert.expiresAt && cert.expiresAt * 1000 < Date.now()) return 'expired';
    return 'active';
  };

  const filteredCertificates = certificates.filter((cert) => {
    const status = getCertificateStatus(cert);
    const matchesFilter = filter === 'all' || status === filter;
    const matchesSearch =
      cert.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.userWallet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-white text-center">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Manage Certificates</h2>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded font-bold ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({certificates.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded font-bold ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded font-bold ${
                filter === 'expired'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Expired
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by course or wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Certificates List */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No certificates found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCertificates.map((cert) => {
            const status = getCertificateStatus(cert);
            const isExpired = status === 'expired';
            const isRevoked = status === 'revoked';

            return (
              <div
                key={cert._id}
                className={`bg-gray-700 p-4 rounded border ${
                  isRevoked
                    ? 'border-red-700'
                    : isExpired
                    ? 'border-yellow-700'
                    : 'border-gray-600'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{cert.course}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          isRevoked
                            ? 'bg-red-600 text-white'
                            : isExpired
                            ? 'bg-yellow-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {isRevoked ? 'REVOKED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                      </span>
                      {cert.isRental && (
                        <span className="px-2 py-1 bg-purple-600 rounded text-xs font-bold text-white">
                          RENTAL
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-400">Wallet:</span>{' '}
                        <span className="font-mono">
                          {cert.userWallet.slice(0, 10)}...{cert.userWallet.slice(-8)}
                        </span>
                      </p>

                      {cert.skills && cert.skills.length > 0 && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Skills:</span> {cert.skills.join(', ')}
                        </p>
                      )}

                      <p className="text-gray-300">
                        <span className="text-gray-400">Issued:</span>{' '}
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </p>

                      {cert.expiresAt && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Expires:</span>{' '}
                          {new Date(cert.expiresAt * 1000).toLocaleDateString()}
                          {isExpired && (
                            <span className="text-yellow-400 ml-2">(Expired)</span>
                          )}
                        </p>
                      )}

                      {cert.tokenId !== undefined && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Token ID:</span> #{cert.tokenId}
                        </p>
                      )}

                      <p className="text-gray-300">
                        <span className="text-gray-400">CID:</span>{' '}
                        <a
                          href={`https://gateway.lighthouse.storage/ipfs/${cert.cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline font-mono text-xs"
                        >
                          {cert.cid.slice(0, 20)}...
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isRevoked && cert.tokenId !== undefined && (
                    <div className="flex gap-2">
                      {cert.isRental && (
                        <button
                          onClick={() => handleRenew(cert.tokenId!, cert.userWallet)}
                          disabled={actionLoading === `renew-${cert.tokenId}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold text-sm"
                        >
                          {actionLoading === `renew-${cert.tokenId}` ? 'Renewing...' : 'Renew'}
                        </button>
                      )}
                      <button
                        onClick={() => handleRevoke(cert.tokenId!)}
                        disabled={actionLoading === `revoke-${cert.tokenId}`}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold text-sm"
                      >
                        {actionLoading === `revoke-${cert.tokenId}` ? 'Revoking...' : 'Revoke'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
