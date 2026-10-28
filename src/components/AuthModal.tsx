import React, { useState } from 'react';
import { User, UserRole } from '../types/inventory';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  ExternalLink, 
  AlertCircle, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  LogOut, 
  Users, 
  Clock, 
  Sparkles,
  KeyRound,
  Warehouse,
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  pendingUsers: User[];
  onLogin: (email: string, pass: string) => boolean;
  onRegister: (name: string, email: string, role: UserRole) => void;
  onLogout: () => void;
  onClose: () => void;
  onOpenUserManagement: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  pendingUsers,
  onLogin,
  onRegister,
  onLogout,
  onClose,
  onOpenUserManagement,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('master@admin.com');
  const [password, setPassword] = useState<string>('admin123');
  const [name, setName] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('CUSTOMER_SERVICE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredPending, setRegisteredPending] = useState<boolean>(false);
  const [lastRegisteredName, setLastRegisteredName] = useState<string>('');
  const [lastRegisteredEmail, setLastRegisteredEmail] = useState<string>('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const success = onLogin(email.trim(), password);
    if (!success) {
      setErrorMsg('Invalid credentials or account pending master admin approval.');
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter both name and email.');
      return;
    }
    setErrorMsg(null);
    setLastRegisteredName(name.trim());
    setLastRegisteredEmail(email.trim());
    onRegister(name.trim(), email.trim(), regRole);
    setRegisteredPending(true);
  };

  const handleQuickFillMasterAdmin = () => {
    setEmail('master@admin.com');
    setPassword('admin123');
    setErrorMsg(null);
    const success = onLogin('master@admin.com', 'admin123');
    if (success) {
      onClose();
    }
  };

  const handleQuickFillAdmin = () => {
    setEmail('admin@logiflow.io');
    setPassword('Admin123Password!');
    setErrorMsg(null);
    const success = onLogin('admin@logiflow.io', 'Admin123Password!');
    if (success) {
      onClose();
    }
  };

  const handleQuickFillCustomerService = () => {
    setEmail('cs@logiflow.io');
    setPassword('CS123Password!');
    setErrorMsg(null);
    const success = onLogin('cs@logiflow.io', 'CS123Password!');
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">LogiFlow WMS Access Control</h3>
              <p className="text-xs text-slate-300">Master Admin & Role-Based Security</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            title="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {currentUser ? (
            /* Current Logged In User State */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Active Session
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {currentUser.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      <Mail className="h-3 w-3 inline shrink-0" />
                      {currentUser.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        currentUser.role === 'MASTER_ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                          : currentUser.role === 'ADMIN'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                      }`}>
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Notice for Master Admin & Admin */}
              {(currentUser.role === 'MASTER_ADMIN' || currentUser.role === 'ADMIN') && pendingUsers.length > 0 && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                      {pendingUsers.length} Pending User Approval{pendingUsers.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded font-bold">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    New staff registrations are waiting for Master Admin verification and permission assignment.
                  </p>
                  <button
                    onClick={() => {
                      onOpenUserManagement();
                      onClose();
                    }}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Review Pending User Approvals</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {(currentUser.role === 'MASTER_ADMIN' || currentUser.role === 'ADMIN') && (
                  <button
                    onClick={() => {
                      onOpenUserManagement();
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span>User Management & Options</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Switch Account / Sign Out</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Continue to Dashboard</span>
                </button>
              </div>
            </div>
          ) : (
            /* Authentication Form (Sign In / Register) */
            <div className="space-y-4">
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 pb-1.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 pb-1.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
                    mode === 'register'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  Request Registration
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Authentication Notice</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              )}

              {mode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="master@admin.com"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Sign In to LogiFlow WMS</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  {/* Master Admin Demo Pill */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        Demo Master Admin Account:
                      </span>
                      <span className="text-[10px] bg-purple-200 dark:bg-purple-900/80 px-1.5 py-0.5 rounded text-purple-900 dark:text-purple-200">
                        Default
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-purple-800 dark:text-purple-300 font-mono text-[11px]">
                      <span>master@admin.com</span>
                      <span className="font-bold">admin123</span>
                    </div>
                    <div className="pt-1 grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={handleQuickFillMasterAdmin}
                        className="py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold transition-colors cursor-pointer truncate"
                      >
                        Master Admin
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickFillAdmin}
                        className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[10px] font-semibold transition-colors cursor-pointer truncate"
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickFillCustomerService}
                        className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[10px] font-semibold transition-colors cursor-pointer truncate"
                      >
                        CS Rep
                      </button>
                    </div>
                  </div>
                </form>
              ) : registeredPending ? (
                /* Registration Submitted - Pending Review State */
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-2 text-center">
                    <div className="h-10 w-10 mx-auto rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Clock className="h-6 w-6 animate-pulse" />
                    </div>
                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                      Registration Pending Approval
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      Account for <span className="font-semibold">{lastRegisteredName || 'New User'}</span> (
                      <span className="font-mono">{lastRegisteredEmail}</span>) has been submitted with status <span className="font-bold">PENDING</span>.
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      The Master Admin must approve your account and configure your permissions in the User Options tab before you can sign in.
                    </p>
                  </div>

                  {/* Gmail Inbox Link for Master Admin Notification */}
                  <a
                    href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Open Master Admin Gmail Inbox</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setRegisteredPending(false);
                      setMode('login');
                      setEmail(lastRegisteredEmail);
                      setPassword('');
                    }}
                    className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                /* Registration Request Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="s.jenkins@warehouse.io"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Requested Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('CUSTOMER_SERVICE')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          regRole === 'CUSTOMER_SERVICE'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <p className="text-xs font-bold">Customer Service</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Icon 1 & Icon 2 upload</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('ADMIN')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          regRole === 'ADMIN'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <p className="text-xs font-bold">Administrator</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">PO & User options</p>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      * The Master Admin will determine and configure your final user options upon approval.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Submit Registration for Approval</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
