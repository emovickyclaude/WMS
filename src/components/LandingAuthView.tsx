import React, { useState } from 'react';
import { 
  Warehouse, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Sliders, 
  Eye, 
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { AppUser } from '../types/auth';

interface LandingAuthViewProps {
  users: AppUser[];
  onLogin: (email: string, pass: string) => { success: boolean; errorReason?: 'PENDING' | 'REJECTED' | 'INVALID' };
  onRegister: (name: string, email: string, pass: string) => { success: boolean; message?: string };
  onResetPassword: (email: string, newPass: string) => { success: boolean; message?: string };
}

export const LandingAuthView: React.FC<LandingAuthViewProps> = ({
  users,
  onLogin,
  onRegister,
  onResetPassword,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Sign In state (clean, no demo credentials pre-filled)
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<{
    type: 'PENDING' | 'REJECTED' | 'INVALID';
    message: string;
  } | null>(null);

  // Register state (only Name, Email, Password - NO role selector)
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPass, setRegPass] = useState<string>('');
  const [regConfirmPass, setRegConfirmPass] = useState<string>('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const result = onLogin(loginEmail.trim(), loginPass.trim());
    if (!result.success) {
      if (result.errorReason === 'PENDING') {
        setLoginError({
          type: 'PENDING',
          message: 'Your account request is currently pending review. The Master Admin will verify your application and assign your operational role.',
        });
      } else if (result.errorReason === 'REJECTED') {
        setLoginError({
          type: 'REJECTED',
          message: 'This account registration was rejected by the Master Admin. Please contact vignesh@emobooks.com for verification.',
        });
      } else {
        setLoginError({
          type: 'INVALID',
          message: 'Invalid email address or password. Please verify your credentials and try again.',
        });
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide both your full name and work email address.');
      return;
    }
    if (regPass.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPass !== regConfirmPass) {
      setRegError('Passwords do not match. Please verify your input.');
      return;
    }

    const res = onRegister(regName.trim(), regEmail.trim(), regPass.trim());
    if (res.success) {
      setRegSuccess(true);
      setRegName('');
      setRegEmail('');
      setRegPass('');
      setRegConfirmPass('');
    } else {
      setRegError(res.message || 'Registration failed. An account with this email address may already exist.');
    }
  };

  // Forgot password workflows
  const handleOpenForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep('REQUEST');
    setForgotEmail(loginEmail.trim());
    setForgotError(null);
    setInputCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const emailToFind = forgotEmail.trim().toLowerCase();
    if (!emailToFind) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    const userExists = users.some(u => u.email.toLowerCase() === emailToFind);
    if (!userExists) {
      setForgotError('No registered account was found matching this email address.');
      return;
    }

    // Generate a secure 6-digit verification code
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generated);
    setForgotStep('VERIFY');
  };

  const handleConfirmPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (inputCode.trim() !== verificationCode) {
      setForgotError('Invalid verification security code. Please enter the 6-digit code shown.');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    const res = onResetPassword(forgotEmail.trim().toLowerCase(), newPassword.trim());
    if (res.success) {
      setForgotStep('SUCCESS');
      setLoginEmail(forgotEmail.trim().toLowerCase());
      setLoginPass('');
    } else {
      setForgotError(res.message || 'Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  LogiFlow WMS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Phase 1 Order Management
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cambridge & Oxford Educational Publisher Inventory Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Safety Preset: 10 Units</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Domain Context, Formula & RBAC Architecture */}
        <div className="flex-1 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Dedicated Educational Publisher Distribution System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Warehouse Stock Reconciler & Purchase Order Engine
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Automating inventory safety buffers for Cambridge Primary English and Oxford International Primary Maths series. Continuously balances physical on-hand stocks against inbound supplier POs using a strict preset safety formula.
          </p>

          {/* Formula Callout Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800 text-xs sm:text-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                ★ Core Shortage Calculation Formula
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Preset Safety Threshold: 50 Copies (Minimum Qty.xlsx)
              </span>
            </div>
            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
              <span className="text-amber-300 font-bold">Preset Min Stock (50)</span>
              <span className="text-slate-500 font-bold">−</span>
              <span className="text-cyan-300 font-bold">Stock Balance</span>
              <span className="text-slate-500 font-bold">−</span>
              <span className="text-purple-300 font-bold">Extra PO Stock</span>
              <span className="text-slate-500 font-bold">=</span>
              <span className="text-rose-400 font-bold">Shortage Qty Needed</span>
            </div>
            <p className="text-[11px] text-slate-400">
              When shortage &gt; 0, the title is flagged as <strong className="text-rose-400">Qty Not Sufficient</strong> and queued for automated supplier purchase requisition dispatch.
            </p>
          </div>

          {/* Role Structure Explained */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Master Admin</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Full authority. Reviews pending registrations and explicitly determines user roles and permissions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Sliders className="h-4 w-4" />
                <span>Operations Admin</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Uploads physical stock and PO CSVs, dispatches purchase requisitions, and adjusts safety thresholds.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                <Eye className="h-4 w-4" />
                <span>Customer Services</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                <strong className="text-cyan-300">View-Only Access</strong>. Inspects on-hand quantities, shortages, and requisition logs without edit permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Authentication Portal (No Demo Credentials) */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Secure Warehouse Portal
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                Protected Session
              </span>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setRegError(null);
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setLoginError(null);
                  setRegSuccess(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Request Account</span>
              </button>
            </div>

            {/* TAB 1: CLEAN SIGN IN (No Demo Helper Cards) */}
            {activeTab === 'signin' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white">Log In to Your Account</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your authorized warehouse credentials to access inventory.
                  </p>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                    loginError.type === 'PENDING'
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {loginError.type === 'PENDING' ? (
                        <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>{loginError.message}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="e.g. name@emobooks.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenForgotModal}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPass}
                      onChange={e => setLoginPass(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Authenticate & Open Dashboard</span>
                </button>

                <div className="pt-3 border-t border-slate-800 text-center">
                  <p className="text-[11px] text-slate-500">
                    Need an account? Click <strong className="text-indigo-400 cursor-pointer" onClick={() => setActiveTab('register')}>Request Account</strong> to apply.
                  </p>
                </div>
              </form>
            )}

            {/* TAB 2: REQUEST ACCOUNT (REGISTRATION - NO ROLE SELECTOR) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <h2 className="text-base font-bold text-white">Request Warehouse Access</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submit your details. The Master Admin will review your application and determine your operational role.
                  </p>
                </div>

                {/* Success Banner */}
                {regSuccess && (
                  <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs leading-relaxed space-y-2">
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block text-sm">Application Submitted Successfully</span>
                        Your registration has been submitted to the Master Admin for review. Once approved and assigned a role (Admin or Customer Services), you will be able to log in with your credentials.
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {regError && (
                  <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="e.g. rachel@emobooks.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regPass}
                      onChange={e => setRegPass(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm Pass
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPass}
                      onChange={e => setRegConfirmPass(e.target.value)}
                      placeholder="Re-enter pass"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                    <span>Role Assignment by Master Admin</span>
                  </div>
                  <p>
                    Applicants do not select roles. The Master Admin determines and assigns operational privileges upon reviewing your application.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Submit Application</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Secure credential recovery workflow</p>
              </div>
            </div>

            {forgotError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 'REQUEST' && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered work email address. We will verify your account and provide a security verification code to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="e.g. vignesh@emobooks.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Generate Reset Code</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Verify Code and Set New Password */}
            {forgotStep === 'VERIFY' && (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                {/* Security Code Banner */}
                <div className="p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                      Security Verification Code
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Dispatched for {forgotEmail}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-indigo-500/30 text-center font-mono text-xl font-black text-indigo-300 tracking-widest">
                    {verificationCode}
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Enter the 6-digit code above to authenticate your password change.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm New
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter pass"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('REQUEST')}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save New Password</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS */}
            {forgotStep === 'SUCCESS' && (
              <div className="text-center py-4 space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Password Reset Complete</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Your password has been successfully updated. You can now authenticate with your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Proceed to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>LogiFlow WMS · Cambridge & Oxford Bookstore Order Management</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Formula: <code>10 Min − Stock Balance − Extra PO = Shortage Qty</code></span>
            <span>· Status: <span className="text-emerald-400">All Systems Operational</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
