// app/api/docs/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkillCert API',
  description: 'Issue, renew, revoke, and settle web3 certificates',
};

export default function ApiDocs() {
  return (
    <div className="max-w-4xl mx-auto p-8 font-mono text-sm">
      <h1 className="text-3xl font-bold mb-6">SkillCert API</h1>
      <p className="mb-8">Base URL: <code className="bg-gray-100 p-1">/api</code></p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">POST /issue</h2>
        <p>Issue certificate (off-chain)</p>
        <pre className="bg-gray-100 p-4 rounded">
{`{
  "userWallet": "0x...",
  "course": "Solidity 101",
  "skills": ["ERC721", "IPFS"],
  "expiresInDays": 90
}`}
        </pre>
        <p><strong>Auth:</strong> <code>Authorization: Bearer sk_...</code></p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">POST /renew</h2>
        <p>Extend rental</p>
        <pre className="bg-gray-100 p-4 rounded">
{`{
  "tokenId": 123,
  "userWallet": "0x...",
  "additionalDays": 30
}`}
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">POST /revoke</h2>
        <p>Revoke access</p>
        <pre className="bg-gray-100 p-4 rounded">
{`{
  "tokenId": 123
}`}
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">POST /settle</h2>
        <p>Settle to chain</p>
        <pre className="bg-gray-100 p-4 rounded">
{`{
  "userWallet": "0x..."
}`}
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">GET /credentials</h2>
        <p>List user certs</p>
        <code>?userWallet=0x...</code>
      </section>

      <footer className="text-center text-gray-500 mt-16">
        Issuer verification is internal. API keys are managed via admin dashboard.
      </footer>
    </div>
  );
}