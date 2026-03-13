import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      // Data is already extracted by the API interceptor
      setStats(statsRes);
      setUsers(usersRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-primary-500">{stats.users.total}</div>
            <div className="text-sm text-gray-400">{stats.users.recentRegistrations} this month</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Mothers</div>
            <div className="text-3xl font-bold text-secondary-500">{stats.users.mothers}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Providers</div>
            <div className="text-3xl font-bold text-emerald-500">{stats.users.providers}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-500 mb-1">Pending Emergencies</div>
            <div className="text-3xl font-bold text-red-500">{stats.emergencies.pending}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'users' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          Manage Users
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Records Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pregnancy Records</span>
                <span className="font-semibold text-primary-500">{stats.records.totalPregnancies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nutrition Plans</span>
                <span className="font-semibold text-secondary-500">{stats.records.totalNutritionPlans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Immunization Schedules</span>
                <span className="font-semibold text-emerald-500">{stats.records.totalImmunizations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Emergency Reports</span>
                <span className="font-semibold text-red-500">{stats.emergencies.total}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Mothers</span>
                  <span className="font-medium">{stats.users.mothers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(stats.users.mothers / stats.users.total) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Providers</span>
                  <span className="font-medium">{stats.users.providers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-secondary-500 h-2 rounded-full" style={{ width: `${(stats.users.providers / stats.users.total) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Admins</span>
                  <span className="font-medium">{stats.users.admins}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.users.admins / stats.users.total) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">User Management</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-64 text-gray-600"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field w-40 text-gray-600"
              >
                <option value="">All Roles</option>
                <option value="mother">Mother</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Role</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Phone</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Joined</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-600">{user.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1 text-gray-600"
                        disabled={user.role === 'admin'}
                      >
                        <option value="mother">Mother</option>
                        <option value="provider">Provider</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

