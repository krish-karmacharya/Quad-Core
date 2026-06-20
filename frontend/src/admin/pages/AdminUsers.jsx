import { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import Loader from '../../components/Loader';
import { getAdminUsers, createAdminUser, updateUserRole, deleteUser } from '../services/adminApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, admin, user

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Feedback Toast/Notification
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success'); // success, error

  // Logged-in user info (to prevent editing self)
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch users.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred loading users. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        showToast(response.message || 'User role updated successfully');
      } else {
        showToast(response.message || 'Failed to update role.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating user role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
        showToast(response.message || 'User deleted successfully');
      } else {
        showToast(response.message || 'Failed to delete user.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting user', 'error');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword) {
      setModalError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    if (newUserPassword.length < 8) {
      setModalError('Password must be at least 8 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await createAdminUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });

      if (response.success) {
        // Refresh list
        await fetchUsers();
        // Reset and close
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        setIsModalOpen(false);
        showToast('User created successfully');
      } else {
        setModalError(response.message || 'Failed to create user.');
      }
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Error creating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  // Filtered and Searched Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'ALL' || 
      u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        
        {/* Main Content Pane */}
        <main className="flex-1 pl-60 pt-16 min-h-screen">
          <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
                <p className="text-slate-400 text-sm mt-1">Manage system administrators, editors, and regular users.</p>
              </div>
              <div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="minimal-primary text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
              <div className={`p-4 rounded-lg flex items-center justify-between border transition duration-300 ${
                toastType === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {toastType === 'success' ? (
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{toastMessage}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
              {/* Tabs for Roles */}
              <div className="flex gap-1.5 w-full md:w-auto">
                {['ALL', 'admin', 'user'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition duration-150 w-full md:w-auto text-center ${
                      roleFilter === role
                        ? 'minimal-primary'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850'
                    }`}
                  >
                    {role === 'ALL' ? 'All Roles' : `${role}s`}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-slate-600 transition"
                />
              </div>
            </div>

            {/* Users Table / List */}
            {isLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex justify-center">
                <Loader message="Fetching users list..." />
              </div>
            ) : error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400">
                <h3 className="font-bold text-lg mb-1">Server Connection Issue</h3>
                <p className="text-sm">{error}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <p className="text-slate-500 italic text-sm">No registered users matched the criteria.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 bg-slate-950/20">
                      <tr>
                        <th className="py-4 px-5">User</th>
                        <th className="py-4 px-5">Email</th>
                        <th className="py-4 px-5">Role</th>
                        <th className="py-4 px-5">Date Registered</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.map((userObj) => {
                        const date = new Date(userObj.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });
                        
                        const isSelf = currentUser && (currentUser.id === userObj._id || currentUser._id === userObj._id);

                        return (
                          <tr key={userObj._id} className="hover:bg-slate-800/25 transition">
                            <td className="py-4 px-5 font-semibold text-slate-100 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-xs text-slate-400">
                                {userObj.name ? userObj.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="flex flex-col">
                                <span>{userObj.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">You</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5 text-slate-300 font-mono text-xs">{userObj.email}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                userObj.role === 'admin' 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-slate-550/10 border-slate-500/10 text-slate-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${userObj.role === 'admin' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                {userObj.role}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-xs text-slate-500">{date}</td>
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                {/* Role Switch Dropdown */}
                                <select
                                  value={userObj.role}
                                  disabled={isSelf}
                                  onChange={(e) => handleRoleChange(userObj._id, e.target.value)}
                                  className={`bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>

                                {/* Delete User Button */}
                                <button
                                  disabled={isSelf}
                                  onClick={() => handleDeleteUser(userObj._id)}
                                  className="text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-transparent text-xs font-bold px-2.5 py-1 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={isSelf ? "You cannot delete your own admin account" : "Delete user"}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100">Add New User</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUserSubmit}>
              <div className="p-6 flex flex-col gap-4">
                {modalError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{modalError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role Designation</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-600 transition"
                  >
                    <option value="user">User (Standard account)</option>
                    <option value="admin">Admin (System level control)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 bg-slate-950/45 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-4 py-2 text-xs font-semibold rounded-lg border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="minimal-primary text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
