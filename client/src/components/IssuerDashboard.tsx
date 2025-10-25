'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

interface IssuerProfile {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  organizationType: string;
  website?: string;
  wallet: string;
  status: 'pending' | 'approved' | 'rejected';
  apiKey?: string;
  createdAt: Date;
}

type OnboardingStep = 'connect' | 'form' | 'pending' | 'approved' | 'rejected';

export default function IssuerDashboard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const [step, setStep] = useState<OnboardingStep>('connect');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organizationType: '',
    website: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [issuerProfile, setIssuerProfile] = useState<IssuerProfile | null>(null);

  const organizationTypes = [
    'Educational Institution',
    'Corporate/Enterprise',
    'Government Agency',
    'Non-Profit Organization',
    'Healthcare Provider',
    'Professional Association',
    'Training Center',
    'Other',
  ];

  useEffect(() => {
    if (isConnected && address) {
      checkIssuerStatus();
    } else {
      setLoading(false);
      setStep('connect');
    }
  }, [isConnected, address]);

  const checkIssuerStatus = async () => {
    try {
      const res = await fetch(`/api/admin/issuers/status?wallet=${address}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setIssuerProfile(data.issuer);
        
        switch (data.issuer.status) {
          case 'pending':
            setStep('pending');
            break;
          case 'approved':
            setStep('approved');
            break;
          case 'rejected':
            setStep('rejected');
            break;
          default:
            setStep('form');
        }
      } else if (res.status === 404) {
        setStep('form');
      }
    } catch (error) {
      console.error('Error checking issuer status:', error);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.organizationType) {
      newErrors.organizationType = 'Organization type is required';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/issuers/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          wallet: address,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIssuerProfile(data.issuer);
        setStep('pending');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Step 1: Connect Wallet
  if (step === 'connect') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Issuer</h1>
            <p className="text-gray-400">Connect your wallet to start the onboarding process</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            You'll need to connect your Ethereum wallet to register as a credential issuer
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Onboarding Form
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gray-900 p-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Issuer Onboarding</h1>
              <p className="text-gray-400">
                Complete the form below to register as a credential issuer
              </p>
              <div className="mt-4 flex items-center gap-2 bg-gray-700 p-3 rounded">
                <span className="text-gray-400">Connected Wallet:</span>
                <span className="font-mono text-sm text-blue-400">
                  {address?.slice(0, 10)}...{address?.slice(-8)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Name */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC University"
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded border ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@organization.com"
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded border ${
                    errors.phone ? 'border-red-500' : 'border-gray-600'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Organization Type */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Type of Organization <span className="text-red-500">*</span>
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded border ${
                    errors.organizationType ? 'border-red-500' : 'border-gray-600'
                  } focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Select organization type</option>
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.organizationType && (
                  <p className="text-red-500 text-sm mt-1">{errors.organizationType}</p>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Website URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.organization.com"
                  className={`w-full px-4 py-3 bg-gray-700 text-white rounded border ${
                    errors.website ? 'border-red-500' : 'border-gray-600'
                  } focus:outline-none focus:border-blue-500`}
                />
                {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded text-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Pending Approval
  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Application Pending</h1>
            <p className="text-gray-400">Your application is under review by our admin team</p>
          </div>

          <div className="bg-gray-700 rounded p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Organization:</span>
              <span className="text-white font-bold">{issuerProfile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{issuerProfile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="px-3 py-1 bg-yellow-600 text-white rounded text-sm font-bold">
                Pending
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Submitted:</span>
              <span className="text-white">
                {new Date(issuerProfile?.createdAt || '').toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded">
            <p className="text-blue-300 text-sm">
              💡 We typically review applications within 2-3 business days. You'll receive an email
              notification once your application is processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Approved
  if (step === 'approved') {
    return (
      <div className="min-h-screen bg-gray-900 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Welcome, {issuerProfile?.name}!</h1>
                  <p className="text-green-400 font-bold">✓ Approved Issuer</p>
                </div>
              </div>
            </div>

            {/* API Key Section */}
            <div className="bg-gray-700 rounded p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Your API Credentials</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">API Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-gray-800 px-4 py-2 rounded font-mono text-sm text-blue-400 border border-gray-600">
                      {issuerProfile?.apiKey}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(issuerProfile?.apiKey || '');
                        alert('API Key copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-yellow-400 text-sm mt-4">
                ⚠️ Keep your API key secure. Do not share it publicly.
              </p>
            </div>

            {/* Organization Info */}
            <div className="bg-gray-700 rounded p-6 space-y-3">
              <h2 className="text-xl font-bold text-white mb-4">Organization Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Email</span>
                  <p className="text-white">{issuerProfile?.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Phone</span>
                  <p className="text-white">{issuerProfile?.phone}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Organization Type</span>
                  <p className="text-white">{issuerProfile?.organizationType}</p>
                </div>
                {issuerProfile?.website && (
                  <div>
                    <span className="text-gray-400 text-sm">Website</span>
                    <a
                      href={issuerProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {issuerProfile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Rejected
  if (step === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 border border-red-700 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Application Rejected</h1>
            <p className="text-gray-400">
              Unfortunately, your application was not approved
            </p>
          </div>

          <div className="bg-gray-700 rounded p-6 mb-6">
            <p className="text-gray-300">
              Your application has been reviewed and we are unable to approve it at this time.
              This could be due to incomplete information or verification issues.
            </p>
          </div>

          <button
            onClick={() => {
              setStep('form');
              setFormData({
                name: '',
                email: '',
                phone: '',
                organizationType: '',
                website: '',
              });
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
          >
            Submit New Application
          </button>
        </div>
      </div>
    );
  }

  return null;
}