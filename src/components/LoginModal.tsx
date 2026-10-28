import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Warehouse,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Headphones
} from 'lucide-react';
import { AppUser, UserRole, ROLE_DEFAULT_PERMISSIONS } from '../types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: AppUser) => void;
  registeredUsers: AppUser[];
  onRegisterUser: (newUser: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  registeredUsers,
  onRegisterUser,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('admin@logiflow.io');
  const [password, setPassword] = useState<string>('Admin123Password!');
  const [displayName, setDisplayName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSuccessNotice, setPendingSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Please provide both email and password.');
      return;
    }

    if (isRegisterMode) {
      // Check existing
      const existing = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        setError('A user account with this email already exists.');
        return;
      }

      if (cleanPass.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      // Default role for self-registration: CUSTOMER_SERVICE with PENDING status
      const userId = `user-${Date.now()}`;
      const userName = displayName.trim() || cleanEmail.split('@')[0];
      const newUser: AppUser = {
        id: userId,
        uid: userId,
        name: userName,
        displayName: userName,
        email: cleanEmail,
        role: 'CUSTOMER_SERVICE',
        status: 'PENDING',
        permissions: { ...ROLE_DEFAULT_PERMISSIONS.CUSTOMER_SERVICE },
        password: cleanPass,
        createdAt: new Date().toISOString(),
      };

      onRegisterUser(newUser);
      setIsRegisterMode(false);
      setPendingSuccessNotice(
        `Account registration submitted for "${cleanEmail}". Status is PENDING. An Administrator must approve your account and determine your permissions before you can sign in.`
      );
    } else {
      // Find matching user
      const user = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        setError('User not found. Check email or register a new account.');
        return;
      }

      if (user.password && user.password !== cleanPass) {
        setError('Incorrect password. Please try again or use a 1-click test login below.');
        return;
      }

      if (user.status === 'PENDING') {
        setError(
          'Account status: PENDING. Your registration has not yet been approved by an Administrator. Please wait for an Admin or Master Admin to approve your role and options.'
        );
        return;
      }

      if (user.status === 'REJECTED') {
        setError(
          'Account status: REJECTED. Your access has been denied by the Administrator.'
        );
        return;
      }

      onLogin(user);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const target = registeredUsers.find(u => u.role === role && u.status === 'APPROVED');
    if (target) {
      setEmail(target.email);
      setPassword(target.password || '');
      onLogin(target);
    }
  };

  const handleSelectPendingDemo = () => {
    const pendingUser = registeredUsers.find(u => u.status === 'PENDING');
    if (pendingUser) {
      setEmail(pendingUser.email);
      setPassword(pendingUser.password || 'Staff123Password!');
      setError(
        `[Demo Validation] "${pendingUser.email}" has status PENDING. Log in is blocked until approved by Master Admin or Admin in the User Options tab.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Warehouse className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">LogiFlow WMS Authentication</h3>
              <p className="text-xs text-slate-400">
                {isRegisterMode ? 'New User Registration (Pending Approval)' : 'Sign in to access order & inventory system'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4 text-slate-800 dark:text-slate-200 overflow-y-auto">
          {pendingSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold">Registration Pending Approval</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">{pendingSuccessNotice}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

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
                  placeholder="name@logiflow.io"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isRegisterMode ? 'New accounts require Admin approval before first sign-in.' : 'Enter your password to proceed.'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isRegisterMode ? 'Submit Registration for Approval' : 'Sign In to LogiFlow WMS'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Toggle Register / Sign In */}
          <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            {isRegisterMode ? (
              <span>
                Already have an approved account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError(null);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            ) : (
              <span>
                New warehouse staff member?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError(null);
                    setPendingSuccessNotice(null);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Register new account
                </button>
              </span>
            )}
          </div>

          {/* Quick Role Logins */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Quick 1-Click Role Logins:
              </span>
              <span className="text-[10px] text-slate-400">Pre-seeded users</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('MASTER_ADMIN')}
                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 text-left hover:bg-purple-100 dark:hover:bg-purple-950/70 transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-500" /> Master Admin
                </div>
                <div className="text-[10px] text-purple-700/80 dark:text-purple-300/80 mt-0.5 truncate">
                  All rights + reset defaults
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-left hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Admin
                </div>
                <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-0.5 truncate">
                  Determines user options
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CUSTOMER_SERVICE')}
                className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-200 text-left hover:bg-cyan-100 dark:hover:bg-cyan-950/70 transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1">
                  <Headphones className="h-3.5 w-3.5 text-cyan-500" /> Customer Service
                </div>
                <div className="text-[10px] text-cyan-700/80 dark:text-cyan-300/80 mt-0.5 truncate">
                  Stock balance & Extra PO
                </div>
              </button>

              <button
                type="button"
                onClick={handleSelectPendingDemo}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Test how pending user approval blocks sign in"
              >
                <div className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" /> Pending Demo
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Test pending approval state
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
