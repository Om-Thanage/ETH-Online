'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import IssueCertificateForm from '@/components/IssueCertificateForm';
import ManageCertificates from '@/components/ManageCertificates';

type Tab = 'issue' | 'manage';

export default function CertificatesPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('issue');
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [issuerName, setIssuerName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push('/issuer');
      return;
    }

    checkIssuerStatus();
  }, [isConnected, address]);

  const checkIssuerStatus = async () => {
    try {
      const res = await fetch(`/api/admin/issuers/status?wallet=${address}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const issuer = data.issuer;

        if (issuer.status !== 'approved') {
          setError('Your issuer account is not approved yet');
          setTimeout(() => router.push('/issuer'), 2000);
          return;
        }

        setApiKey(issuer.apiKey);
        setIssuerName(issuer.name);
      } else {
        setError('Issuer not found');
        setTimeout(() => router.push('/issuer'), 2000);
      }
    } catch (error) {
      console.error('Error checking issuer status:', error);
      setError('Failed to verify issuer status');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSuccess = () => {
    // Switch to manage tab after successful issue
    setActiveTab('manage');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 border border-red-700 max-w-md">
          <div className="text-red-400 text-center">
            <p className="text-xl font-bold mb-2">⚠️ {error}</p>
            <p className="text-gray-400">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No API key found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Certificate Management</h1>
              <p className="text-gray-400">
                Issue, manage, renew, and revoke certificates for {issuerName}
              </p>
            </div>
            <button
              onClick={() => router.push('/issuer')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Wallet Info */}
          <div className="flex items-center gap-2 bg-gray-800 p-3 rounded border border-gray-700">
            <span className="text-gray-400">Connected as:</span>
            <span className="font-mono text-sm text-blue-400">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'issue'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 Issue Certificate
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'manage'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 Manage Certificates
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'issue' && (
            <IssueCertificateForm apiKey={apiKey} onSuccess={handleIssueSuccess} />
          )}
          {activeTab === 'manage' && <ManageCertificates apiKey={apiKey} />}
        </div>

        {/* API Documentation Link */}
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded">
          <p className="text-gray-400 text-sm">
            💡 Need to integrate programmatically?{' '}
            <a href="/api/docs" className="text-blue-400 hover:underline font-bold">
              View API Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
