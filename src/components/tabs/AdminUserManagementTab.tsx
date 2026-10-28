import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  KeyRound, 
  Check, 
  Lock, 
  Unlock, 
  Package, 
  Truck, 
  ShieldCheck, 
  ShoppingCart, 
  Download, 
  RotateCcw,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Headphones,
  Sliders
} from 'lucide-react';
import { AppUser, UserPermissions, UserRole, UserStatus, ROLE_DEFAULT_PERMISSIONS } from '../../types/auth';

interface AdminUserManagementTabProps {
  currentUser: AppUser;
  users: AppUser[];
  onUpdateUserPermissions: (id: string, newPermissions: UserPermissions) => void;
  onUpdateUserRole: (id: string, newRole: UserRole) => void;
  onUpdateUserStatus: (id: string, newStatus: UserStatus) => void;
  onUpdateUserPassword: (id: string, newPass: string) => void;
  onCreateUser: (newUser: AppUser) => void;
  onSwitchUser: (user: AppUser) => void;
}

export const AdminUserManagementTab: React.FC<AdminUserManagementTabProps> = ({
  currentUser,
  users,
  onUpdateUserPermissions,
  onUpdateUserRole,
  onUpdateUserStatus,
  onUpdateUserPassword,
  onCreateUser,
  onSwitchUser,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingPasswordUid, setEditingPasswordUid] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');

  // Create form state
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('Staff123Password!');
  const [newRole, setNewRole] = useState<UserRole>('CUSTOMER_SERVICE');
  const [newInitialStatus, setNewInitialStatus] = useState<UserStatus>('APPROVED');

  const pendingCount = users.filter(u => u.status === 'PENDING').length;

  const filteredUsers = users.filter(u => {
    const userId = u.id || u.uid || '';
    const userName = u.name || u.displayName || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || u.email.toLowerCase().includes(q) || userName.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTogglePermission = (user: AppUser, key: keyof UserPermissions) => {
    const userId = user.id || user.uid || '';
    const currentUserId = currentUser.id || currentUser.uid || '';
    // If updating current user's own admin rights, warn
    if (userId === currentUserId && key === 'canManageUsers' && user.permissions.canManageUsers) {
      if (!window.confirm('Warning: Disabling your own user management permission will revoke your access to this tab. Proceed?')) {
        return;
      }
    }

    const updated: UserPermissions = {
      ...user.permissions,
      [key]: !user.permissions[key],
    };
    onUpdateUserPermissions(userId, updated);
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    onUpdateUserRole(userId, role);
    onUpdateUserPermissions(userId, { ...ROLE_DEFAULT_PERMISSIONS[role] });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPass.trim()) return;

    const newId = `user-${Date.now()}`;
    const cleanName = newName.trim() || newEmail.split('@')[0];
    const user: AppUser = {
      id: newId,
      uid: newId,
      name: cleanName,
      displayName: cleanName,
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: newInitialStatus,
      permissions: { ...ROLE_DEFAULT_PERMISSIONS[newRole] },
      password: newPass.trim(),
      createdAt: new Date().toISOString(),
    };

    onCreateUser(user);
    setShowCreateModal(false);
    setNewEmail('');
    setNewName('');
    setNewPass('Staff123Password!');
    setNewRole('CUSTOMER_SERVICE');
    setNewInitialStatus('APPROVED');
  };

  const handleSavePassword = (userId: string) => {
    if (!newPasswordVal.trim()) return;
    onUpdateUserPassword(userId, newPasswordVal.trim());
    setEditingPasswordUid(null);
    setNewPasswordVal('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Control Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg sm:text-xl text-slate-100">
                  User Management & Admin-Determined Options
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Admin Authority
                </span>
                {pendingCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold flex items-center gap-1 animate-pulse">
                    <Clock className="h-3 w-3" /> {pendingCount} Pending Approval
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                As Administrator, you control user approval statuses (<strong>PENDING</strong>, <strong>APPROVED</strong>, <strong>REJECTED</strong>) and decide exactly which options each role can access (Stock Balance uploads, Extra PO sync, Preset 10 copies setup, and PO dispatch).
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create New User & Options</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>Pending Approvals</span>
            {pendingCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            Approved ({users.filter(u => u.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
            }`}
          >
            Rejected ({users.filter(u => u.status === 'REJECTED').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users & Permissions Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              User Options & Permissions Matrix (Admin-Determined)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any toggle pill to instantly grant or revoke an option
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">User Identity & Login</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5 text-center">Status & Approval</th>
                <th className="p-3.5 text-center bg-cyan-50/40 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-400">
                  Icon 1: Stock Balance
                </th>
                <th className="p-3.5 text-center bg-purple-50/40 dark:bg-purple-950/20 text-purple-800 dark:text-purple-400">
                  Icon 2: Extra PO
                </th>
                <th className="p-3.5 text-center bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400">
                  Safety Preset (10 Qty)
                </th>
                <th className="p-3.5 text-center bg-rose-50/40 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400">
                  Dispatch POs
                </th>
                <th className="p-3.5 text-center">Export CSV</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    No users match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const userId = user.id || user.uid || '';
                  const currentUserId = currentUser.id || currentUser.uid || '';
                  const isCurrent = userId === currentUserId;
                  const userName = user.name || user.displayName || user.email;
                  const p = user.permissions;

                  return (
                    <tr
                      key={userId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        user.status === 'REJECTED' ? 'opacity-60 bg-rose-50/30 dark:bg-rose-950/10' : ''
                      } ${user.status === 'PENDING' ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}
                    >
                      {/* User Identity & Password info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 shadow-sm ${
                            user.role === 'MASTER_ADMIN'
                              ? 'bg-purple-600 text-white'
                              : user.role === 'ADMIN'
                              ? 'bg-amber-600 text-white'
                              : 'bg-cyan-600 text-white'
                          }`}>
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {userName}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {user.email}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <KeyRound className="h-3 w-3" />
                              <span>Pass: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{user.password || '••••••••'}</code></span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role selection */}
                      <td className="p-3.5">
                        <select
                          value={user.role}
                          disabled={currentUser.role !== 'MASTER_ADMIN' && user.role === 'MASTER_ADMIN'}
                          onChange={e => handleRoleChange(userId, e.target.value as UserRole)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                        >
                          {currentUser.role === 'MASTER_ADMIN' && (
                            <option value="MASTER_ADMIN">MASTER_ADMIN</option>
                          )}
                          <option value="ADMIN">ADMIN</option>
                          <option value="CUSTOMER_SERVICE">CUSTOMER_SERVICE</option>
                        </select>
                      </td>

                      {/* Approval Status & Admin Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {user.status === 'APPROVED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Approved
                            </span>
                          )}
                          {user.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                              <Clock className="h-3 w-3" /> Pending Review
                            </span>
                          )}
                          {user.status === 'REJECTED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Rejected
                            </span>
                          )}

                          {/* Quick Admin Decision Buttons */}
                          {!isCurrent && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {user.status !== 'APPROVED' && (
                                <button
                                  onClick={() => onUpdateUserStatus(userId, 'APPROVED')}
                                  className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold cursor-pointer shadow-xs transition-colors"
                                  title="Approve user registration"
                                >
                                  Approve
                                </button>
                              )}
                              {user.status !== 'REJECTED' && (
                                <button
                                  onClick={() => onUpdateUserStatus(userId, 'REJECTED')}
                                  className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold cursor-pointer shadow-xs transition-colors"
                                  title="Reject user registration"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Option 1: Can Upload Stock Balance (Icon 1) */}
                      <td className="p-3.5 text-center bg-cyan-50/20 dark:bg-cyan-950/10">
                        <button
                          onClick={() => handleTogglePermission(user, 'canUploadStockBalance')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.canUploadStockBalance
                              ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                          title="Determine if user can click Icon 1 to update Stock Balance"
                        >
                          {p.canUploadStockBalance ? 'Allowed' : 'Disabled'}
                        </button>
                      </td>

                      {/* Option 2: Can Upload Extra PO (Icon 2) */}
                      <td className="p-3.5 text-center bg-purple-50/20 dark:bg-purple-950/10">
                        <button
                          onClick={() => handleTogglePermission(user, 'canUploadExtraPo')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.canUploadExtraPo
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                          title="Determine if user can click Icon 2 to update Extra PO Stock"
                        >
                          {p.canUploadExtraPo ? 'Allowed' : 'Disabled'}
                        </button>
                      </td>

                      {/* Option 3: Can Edit Safety Preset (10 Copies) */}
                      <td className="p-3.5 text-center bg-amber-50/20 dark:bg-amber-950/10">
                        <button
                          onClick={() => handleTogglePermission(user, 'canEditPresetMinStock')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.canEditPresetMinStock
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                          title="Determine if user can edit preset minimum stock (10 copies benchmark)"
                        >
                          {p.canEditPresetMinStock ? 'Allowed' : 'Disabled'}
                        </button>
                      </td>

                      {/* Option 4: Can Dispatch POs */}
                      <td className="p-3.5 text-center bg-rose-50/20 dark:bg-rose-950/10">
                        <button
                          onClick={() => handleTogglePermission(user, 'canCreatePo')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.canCreatePo
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                          title="Determine if user can dispatch supplier purchase orders"
                        >
                          {p.canCreatePo ? 'Allowed' : 'Disabled'}
                        </button>
                      </td>

                      {/* Option 5: Can Export CSV */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleTogglePermission(user, 'canExportData')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            p.canExportData
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {p.canExportData ? 'Allowed' : 'Disabled'}
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="p-3.5 text-right space-x-1">
                        {!isCurrent && user.status === 'APPROVED' && (
                          <button
                            onClick={() => onSwitchUser(user)}
                            className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Simulate / switch to this user session"
                          >
                            Switch To
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingPasswordUid(userId);
                            setNewPasswordVal(user.password || '');
                          }}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          title="Change password"
                        >
                          Pass
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Edit Dialog */}
      {editingPasswordUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-500" />
              <span>Change User Password</span>
            </h4>
            <p className="text-xs text-slate-500">
              Admin override for user authentication credentials.
            </p>
            <input
              type="text"
              autoFocus
              value={newPasswordVal}
              onChange={e => setNewPasswordVal(e.target.value)}
              placeholder="Enter new password"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPasswordUid(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSavePassword(editingPasswordUid)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
              >
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Create Warehouse User & Assign Options
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. david@logiflow.io"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="text"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {currentUser.role === 'MASTER_ADMIN' && (
                      <option value="MASTER_ADMIN">MASTER_ADMIN</option>
                    )}
                    <option value="ADMIN">ADMIN</option>
                    <option value="CUSTOMER_SERVICE">CUSTOMER_SERVICE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Approval Status
                  </label>
                  <select
                    value={newInitialStatus}
                    onChange={e => setNewInitialStatus(e.target.value as UserStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="APPROVED">APPROVED (Immediate)</option>
                    <option value="PENDING">PENDING (Review Needed)</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">
                  Role Default Options ({newRole}):
                </span>
                <p>
                  {newRole === 'MASTER_ADMIN' && '✓ Full authority: Icon 1, Icon 2, 10 Copies preset editing, PO dispatch, CSV export, User options & master reset.'}
                  {newRole === 'ADMIN' && '✓ High authority: Icon 1, Icon 2, 10 Copies preset editing, PO dispatch, CSV export, User options control.'}
                  {newRole === 'CUSTOMER_SERVICE' && '✓ Standard operational authority: Icon 1 (Stock Balance), Icon 2 (Extra PO), CSV export. Preset setup and user management restricted.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
