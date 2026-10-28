import React, { useState } from 'react';
import { User, UserRole } from '../types/inventory';
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  LogOut, 
  Users, 
  Clock, 
  KeyRound, 
  Warehouse, 
  X,
  Sliders,
  Eye
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  pendingUsers: User[];
  onLogin: (email: string, pass: string) => boolean | { success: boolean; errorReason?: 'PENDING' | 'REJECTED' | 'INVALID' };
  onRegister: (name: string, email: string, role: UserRole, pass?: string) => void;
  onResetPassword?: (email: string, newPass: string) => { success: boolean; message?: string };
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
  onResetPassword,
  onLogout,
  onClose,
  onOpenUserManagement,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredPending, setRegisteredPending] = useState<boolean>(false);
  const [lastRegisteredName, setLastRegisteredName] = useState<string>('');
  const [lastRegisteredEmail, setLastRegisteredEmail] = useState<string>('');

  // Forgot Password local state
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = onLogin(email.trim(), password);
    const success = typeof res === 'boolean' ? res : res.success;
    if (!success) {
      const reason = typeof res === 'object' && res.errorReason ? res.errorReason : null;
      if (reason === 'PENDING') {
        setErrorMsg('Your account request is currently pending Master Admin approval.');
      } else if (reason === 'REJECTED') {
        setErrorMsg('This account registration was reviewed and rejected by the Master Admin.');
      } else {
        setErrorMsg('Invalid email address or password.');
      }
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
    // Role will be determined by Master Admin on approval
    onRegister(name.trim(), email.trim(), 'CUSTOMER_SERVICE', password);
    setRegisteredPending(true);
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your work email.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setForgotStep('VERIFY');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (enteredCode.trim() !== generatedCode) {
      setErrorMsg('Invalid security code. Please enter the 6-digit code shown.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (onResetPassword) {
      const res = onResetPassword(forgotEmail.trim().toLowerCase(), newPassword.trim());
      if (res.success) {
        setForgotStep('SUCCESS');
        setEmail(forgotEmail.trim().toLowerCase());
      } else {
        setErrorMsg(res.message || 'Failed to update password.');
      }
    } else {
      setForgotStep('SUCCESS');
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
        <div className="p-6 overflow-y-auto space-y-5">
          {currentUser ? (
            /* Current User Active Session State */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Role Capability Summary */}
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Warehouse className="h-4 w-4 text-indigo-500" />
                  <span>Assigned Operational Scope</span>
                </div>
                {currentUser.role === 'MASTER_ADMIN' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Full Master Admin privilege: Manage inventory, upload stock & PO files, determine user roles, and adjust preset safety stocks.
                  </p>
                )}
                {currentUser.role === 'ADMIN' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Operations Admin: Upload stock balance & extra PO CSVs, create and dispatch publisher purchase orders, and adjust safety thresholds.
                  </p>
                )}
                {currentUser.role === 'CUSTOMER_SERVICE' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Customer Services: Strict view-only access to inventory stocks, shortage calculations, and purchase order histories.
                  </p>
                )}
              </div>

              {currentUser.role === 'MASTER_ADMIN' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenUserManagement();
                  }}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Open User Management & Options</span>
                </button>
              )}

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out of Warehouse</span>
              </button>
            </div>
          ) : (
            /* Signed Out View */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
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
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Notice</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              )}

              {mode === 'login' && (
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
                        placeholder="name@emobooks.com"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setForgotStep('REQUEST');
                          setForgotEmail(email);
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
                </form>
              )}

              {mode === 'forgot' && (
                /* Forgot Password inside modal */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Recover Password
                    </span>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-indigo-500 hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>

                  {forgotStep === 'REQUEST' && (
                    <form onSubmit={handleForgotRequest} className="space-y-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enter your registered work email to generate a secure reset code.
                      </p>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="e.g. vignesh@emobooks.com"
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs cursor-pointer"
                      >
                        Generate Reset Code
                      </button>
                    </form>
                  )}

                  {forgotStep === 'VERIFY' && (
                    <form onSubmit={handleForgotSubmit} className="space-y-3">
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center">
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-semibold">
                          Security Verification Code
                        </span>
                        <span className="font-mono text-lg font-bold text-indigo-900 dark:text-indigo-200 tracking-wider">
                          {generatedCode}
                        </span>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Enter Code
                        </label>
                        <input
                          type="text"
                          required
                          value={enteredCode}
                          onChange={e => setEnteredCode(e.target.value)}
                          placeholder="6-digit code"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs cursor-pointer"
                      >
                        Save New Password
                      </button>
                    </form>
                  )}

                  {forgotStep === 'SUCCESS' && (
                    <div className="text-center py-3 space-y-3">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Password Reset Successful
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setForgotStep('REQUEST');
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  )}
                </div>
              )}

              {mode === 'register' && (
                registeredPending ? (
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
                        <span className="font-mono">{lastRegisteredEmail}</span>) has been submitted.
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        The Master Admin will review your application and determine your operational role (Admin or Customer Services) before access is activated.
                      </p>
                    </div>

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
                  /* Registration Request Form - NO ROLE SELECTOR */
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
                        Work Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="s.jenkins@emobooks.com"
                          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
                          placeholder="Min 6 characters"
                          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Role Determination by Master Admin</span>
                      </div>
                      <p>
                        Your operational role (Admin or Customer Services) will be determined and assigned by the Master Admin upon approval.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>Submit Application for Approval</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
