// app/api/docs/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkillCert API Documentation',
  description: 'Issue, renew, revoke, and settle web3 certificates',
};

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="inline-block mb-3 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            API REFERENCE
          </div>
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            SkillCert API
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Complete API reference for managing web3 skill certificates
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Base URL:</span>
            <code className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded font-mono text-indigo-600 dark:text-indigo-400">/api</code>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-16">
          {/* Issue Endpoint */}
          <section id="issue">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded font-mono text-xs font-bold text-green-700 dark:text-green-400">
                POST
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">/issue</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Issue a new certificate to a user for completing a course. The certificate is created off-chain 
              and can later be settled to the blockchain.
            </p>

            <div className="space-y-6">
              {/* Auth */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Authentication</h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 p-4">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    Authorization: Bearer sk_your_api_key_here
                  </code>
                </div>
              </div>

              {/* Request */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Request Body</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "userWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "course": "Solidity 101",
  "skills": ["ERC721", "IPFS", "Smart Contracts"],
  "expiresInDays": 90
}`}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Parameters</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Field</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">userWallet</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">string</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Ethereum address of the certificate recipient</td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">course</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">string</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Name of the completed course</td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">skills</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">string[]</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Array of skills acquired in the course</td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">expiresInDays</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">number</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Certificate validity period in days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Response</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">200 OK</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                      {`{
                        "success": true,
                        "message": "Certificate issued successfully",
                        "data": {
                          "credentialId": "cred_1a2b3c4d5e6f",
                          "userWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                          "course": "Solidity 101",
                          "skills": ["ERC721", "IPFS", "Smart Contracts"],
                          "issuedAt": "2025-10-25T14:30:00Z",
                          "expiresAt": "2026-01-23T14:30:00Z",
                          "status": "pending"
                        }
                      }`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Renew Endpoint */}
          <section id="renew">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 rounded font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                POST
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">/renew</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Extend the rental period for an existing certificate, adding additional days to its validity.
            </p>

            <div className="space-y-6">
              {/* Request */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Request Body</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "tokenId": 123,
  "userWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "additionalDays": 30
}`}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Parameters</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Field</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">tokenId</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">number</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">NFT token ID of the certificate</td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">userWallet</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">string</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Ethereum address of the certificate holder</td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">additionalDays</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">number</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Number of days to extend the certificate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Response</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">200 OK</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "success": true,
  "message": "Certificate renewed successfully",
  "data": {
    "tokenId": 123,
    "newExpirationDate": "2026-02-22T14:30:00Z",
    "daysAdded": 30
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Revoke Endpoint */}
          <section id="revoke">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 rounded font-mono text-xs font-bold text-red-700 dark:text-red-400">
                POST
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">/revoke</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Revoke a certificate, immediately removing the user's access and invalidating the credential.
            </p>

            <div className="space-y-6">
              {/* Request */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Request Body</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "tokenId": 123
}`}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Parameters</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Field</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">tokenId</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">number</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">NFT token ID of the certificate to revoke</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Response</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">200 OK</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": {
    "tokenId": 123,
    "status": "revoked",
    "revokedAt": "2025-10-25T14:30:00Z"
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Settle Endpoint */}
          <section id="settle">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 rounded font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                POST
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">/settle</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Settle pending credentials to the blockchain, making them permanently verifiable on-chain.
            </p>

            <div className="space-y-6">
              {/* Request */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Request Body</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "userWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}`}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Parameters</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Field</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">userWallet</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">string</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Ethereum address to settle credentials for</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Response</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">200 OK</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "success": true,
  "message": "Credentials settled successfully",
  "data": {
    "transactionHash": "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    "settledCount": 3,
    "blockNumber": 18234567,
    "gasUsed": "245120"
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Credentials Endpoint */}
          <section id="credentials">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">
                GET
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">/credentials</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Retrieve all certificates associated with a specific wallet address.
            </p>

            <div className="space-y-6">
              {/* Query Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Query Parameters</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Parameter</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr className="bg-white dark:bg-gray-950">
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">userWallet</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">string</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Ethereum address to query credentials for</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Example Request */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Example Request</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">cURL</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`GET /api/credentials?userWallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Response</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">JSON</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">200 OK</span>
                  </div>
                  <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-950">
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
{`{
  "success": true,
  "data": {
    "userWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "credentials": [
      {
        "credentialId": "cred_1a2b3c4d5e6f",
        "course": "Solidity 101",
        "skills": ["ERC721", "IPFS", "Smart Contracts"],
        "issuedAt": "2025-10-25T14:30:00Z",
        "expiresAt": "2026-01-23T14:30:00Z",
        "status": "active",
        "tokenId": 123
      },
      {
        "credentialId": "cred_7g8h9i0j1k2l",
        "course": "Advanced Web3 Development",
        "skills": ["DeFi", "DAOs", "Layer 2"],
        "issuedAt": "2025-09-15T10:20:00Z",
        "expiresAt": "2025-12-14T10:20:00Z",
        "status": "active",
        "tokenId": 89
      }
    ],
    "totalCount": 2
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}