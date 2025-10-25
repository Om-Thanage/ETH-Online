'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Issuer } from '@/models/Issuer';

interface Admin {
  _id: string;
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issuers' | 'admins'>('issuers');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if user is super admin
      const adminRes = await fetch('/api/admin/issuers', {
        credentials: 'include', // ← IMPORTANT: Include cookies
      });
      if (adminRes.status === 401) {
        console.log('Unauthorized, redirecting to login');
        router.push('/admin/login');
        return;
      }

      if (!adminRes.ok) {
        console.error('Error fetching issuers:', adminRes.statusText);
        setLoading(false);
        return;
      }

      // Fetch issuers
      const issuersData = await adminRes.json();
      setIssuers(issuersData.issuers || []);

      // Fetch admins if super admin
      try {
        const adminsRes = await fetch('/api/admin/admins', {
          credentials: 'include', // ← IMPORTANT: Include cookies
        });
        if (adminsRes.status === 200) {
          const adminsData = await adminsRes.json();
          setAdmins(adminsData.admins || []);
          setIsSuperAdmin(true);
        } else if (adminsRes.status === 403) {
          console.log('User is not super admin');
          setIsSuperAdmin(false);
        }
      } catch (e) {
        console.error('Error fetching admins:', e);
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (issuerId: string) => {
    setApproving(issuerId);
    try {
      const res = await fetch('/api/admin/issuers/approve', {
        method: 'POST',
        credentials: 'include', // ← IMPORTANT: Include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issuerId }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Approved! API Key: ${data.apiKey}`);
        fetchData();
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (issuerId: string) => {
    try {
      const res = await fetch('/api/admin/issuers/reject', {
        method: 'POST',
        credentials: 'include', // ← IMPORTANT: Include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issuerId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Rejected');
        fetchData();
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      alert('Email and password required');
      return;
    }

    try {
      const res = await fetch('/api/admin/admins/create', {
        method: 'POST',
        credentials: 'include', // ← IMPORTANT: Include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Admin created successfully');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setShowAddAdmin(false);
        fetchData();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      const res = await fetch('/api/admin/admins/delete', {
        method: 'POST',
        credentials: 'include', // ← IMPORTANT: Include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Admin deleted');
        fetchData();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include', // ← IMPORTANT: Include cookies
    });
    router.push('/admin/login');
  };

  if (loading) return <div className="text-white text-center mt-8">Loading...</div>;

  const pending = issuers.filter((i) => i.status === 'pending');
  const approved = issuers.filter((i) => i.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('issuers')}
          className={`px-4 py-2 font-bold ${
            activeTab === 'issuers'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Issuer Management
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'admins'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin Management
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* ISSUERS TAB */}
        {activeTab === 'issuers' && (
          <>
            {/* Pending Issuers */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">
                Pending Approvals ({pending.length})
              </h2>

              {pending.length === 0 ? (
                <p className="text-gray-400">No pending requests</p>
              ) : (
                <div className="space-y-4">
                  {pending.map((issuer) => (
                    <div
                      key={issuer._id?.toString()}
                      className="bg-gray-700 p-4 rounded border border-gray-600 flex justify-between items-start"
                    >
                      <div>
                        <h3 className="font-bold text-lg">{issuer.name}</h3>
                        <p className="text-gray-300">📧 {issuer.email}</p>
                        <p className="text-gray-400 font-mono text-sm">
                          🔗 {issuer.wallet.slice(0, 10)}...{issuer.wallet.slice(-8)}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Applied: {new Date(issuer.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(issuer._id!.toString())}
                          disabled={approving === issuer._id?.toString()}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold disabled:opacity-50"
                        >
                          {approving === issuer._id?.toString()
                            ? 'Approving...'
                            : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(issuer._id!.toString())}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Issuers */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Approved Issuers ({approved.length})</h2>

              {approved.length === 0 ? (
                <p className="text-gray-400">No approved issuers yet</p>
              ) : (
                <div className="space-y-4">
                  {approved.map((issuer) => (
                    <div
                      key={issuer._id?.toString()}
                      className="bg-gray-700 p-4 rounded border border-gray-600"
                    >
                      <h3 className="font-bold text-lg">{issuer.name}</h3>
                      <p className="text-gray-300">📧 {issuer.email}</p>
                      <p className="text-gray-400 font-mono text-sm mt-2">
                        🔑 API Key: {issuer.apiKey?.substring(0, 20)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ADMINS TAB */}
        {activeTab === 'admins' && isSuperAdmin && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Admins ({admins.length})</h2>
                <button
                  onClick={() => setShowAddAdmin(!showAddAdmin)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
                >
                  {showAddAdmin ? 'Cancel' : 'Add Admin'}
                </button>
              </div>

              {showAddAdmin && (
                <div className="bg-gray-700 p-4 rounded mb-4 border border-gray-600">
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded mb-2 border border-gray-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded mb-2 border border-gray-500"
                  />
                  <button
                    onClick={handleAddAdmin}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold"
                  >
                    Create Admin
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="bg-gray-700 p-4 rounded border border-gray-600 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{admin.email}</p>
                      <p className="text-sm text-gray-400">
                        Role:{' '}
                        <span
                          className={
                            admin.role === 'super_admin'
                              ? 'text-yellow-400 font-bold'
                              : 'text-blue-400'
                          }
                        >
                          {admin.role}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
