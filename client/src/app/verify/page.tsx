import CertificateVerification from '@/components/CertificateVerification';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Certificate Verification</h1>
          <p className="text-gray-400 text-lg">
            Verify the authenticity of blockchain-based certificates
          </p>
        </div>

        {/* Verification Component */}
        <CertificateVerification />

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Blockchain Verified</h3>
            <p className="text-gray-400 text-sm">
              All certificates are verified against the blockchain for authenticity
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tamper-Proof</h3>
            <p className="text-gray-400 text-sm">
              Certificate data is immutably stored on IPFS and cannot be altered
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Verification</h3>
            <p className="text-gray-400 text-sm">
              Verify any certificate in seconds using multiple methods
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">How do I verify a certificate?</h3>
              <p className="text-gray-400">
                Choose a verification method (Token ID, IPFS CID, or Wallet Address), enter the value, and click Verify.
                The system will check the blockchain and display the certificate details if valid.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">What is a Token ID?</h3>
              <p className="text-gray-400">
                A Token ID is the unique identifier number assigned to each NFT certificate on the blockchain.
                You can find this in your certificate details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">What is an IPFS CID?</h3>
              <p className="text-gray-400">
                CID (Content Identifier) is the unique hash that identifies your certificate data stored on IPFS.
                It ensures your certificate data is immutable and tamper-proof.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">Can I verify multiple certificates at once?</h3>
              <p className="text-gray-400">
                Yes! Use the "Wallet Address" verification method to see all certificates associated with a specific wallet.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">What does "Revoked" status mean?</h3>
              <p className="text-gray-400">
                A revoked certificate has been invalidated by the issuer. This could be due to policy violations,
                errors in issuance, or other reasons determined by the issuing organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
