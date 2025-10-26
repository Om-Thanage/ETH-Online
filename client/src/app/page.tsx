
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Web3 Certificate Platform
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Issue, manage, and verify on-chain credentials with blockchain technology.
            Rent, renew, and revoke certificates with full transparency.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Verify Certificates</h3>
            <p className="text-gray-400 mb-4">
              Instantly verify the authenticity of any blockchain-based certificate
            </p>
            <Link 
              href="/verify"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors"
            >
              Verify Now →
            </Link>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">For Issuers</h3>
            <p className="text-gray-400 mb-4">
              Register as a verified issuer and start issuing blockchain-based certificates
            </p>
            <Link 
              href="/issuer"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors"
            >
              Get Started →
            </Link>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">For Developers</h3>
            <p className="text-gray-400 mb-4">
              Integrate our API to issue and manage certificates programmatically
            </p>
            <Link 
              href="/api/docs"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-colors"
            >
              View API Docs →
            </Link>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="text-white font-bold mb-1">On-Chain Verification</h4>
                <p className="text-gray-400 text-sm">All certificates are verified on the blockchain</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="text-white font-bold mb-1">Encrypted Storage</h4>
                <p className="text-gray-400 text-sm">Certificate data encrypted on IPFS via Lighthouse</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="text-white font-bold mb-1">Rental & Expiry</h4>
                <p className="text-gray-400 text-sm">Support for temporary credentials with renewal options</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="text-white font-bold mb-1">Revocation Support</h4>
                <p className="text-gray-400 text-sm">Issuers can revoke certificates when needed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="text-white font-bold mb-1">RESTful API</h4>
                <p className="text-gray-400 text-sm">Easy integration with comprehensive API</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="text-white font-bold mb-1">Soulbound NFTs</h4>
                <p className="text-gray-400 text-sm">Non-transferable certificates tied to user wallets</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
