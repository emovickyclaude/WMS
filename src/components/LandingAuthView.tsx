import React, { useState } from 'react';
import { 
  Warehouse, 
  Lock, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  BookOpen, 
  Layers, 
  ArrowRight,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { AppUser, UserRole, GMAIL_INBOX_URL } from '../types/auth';

interface LandingAuthViewProps {
  users: AppUser[];
  onLogin: (email: string, pass: string) => { success: boolean; errorReason?: 'PENDING' | 'REJECTED' | 'INVALID' };
  onRegister: (name: string, email: string, role: UserRole, pass: string) => { success: boolean; message?: string };
}

export const LandingAuthView: React.FC<LandingAuthViewProps> = ({
  users,
  onLogin,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Sign In state
  const [loginEmail, setLoginEmail] = useState<string>('master@admin.com');
  const [loginPass, setLoginPass] = useState<string>('admin123');
  const [loginError, setLoginError] = useState<{
    type: 'PENDING' | 'REJECTED' | 'INVALID';
    message: string;
  } | null>(null);

  // Register state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('CUSTOMER_SERVICE');
  const [regPass, setRegPass] = useState<string>('');
  const [regConfirmPass, setRegConfirmPass] = useState<string>('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  const pendingCount = users.filter(u => u.status === 'PENDING').length;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const result = onLogin(loginEmail.trim(), loginPass.trim());
    if (!result.success) {
      if (result.errorReason === 'PENDING') {
        setLoginError({
          type: 'PENDING',
          message: 'Your account request has been submitted to the Master Admin for review. Once approved, you will be able to log in with your credentials.',
        });
      } else if (result.errorReason === 'REJECTED') {
        setLoginError({
          type: 'REJECTED',
          message: 'This account registration was reviewed and rejected by the Master Admin. Please contact master@admin.com for assistance.',
        });
      } else {
        setLoginError({
          type: 'INVALID',
          message: 'Invalid email or password. Please verify your credentials or click a demo account below.',
        });
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide both your full name and email address.');
      return;
    }
    if (regPass.length < 4) {
      setRegError('Password must be at least 4 characters.');
      return;
    }
    if (regPass !== regConfirmPass) {
      setRegError('Passwords do not match.');
      return;
    }

    const res = onRegister(regName.trim(), regEmail.trim(), regRole, regPass.trim());
    if (res.success) {
      setRegSuccess(true);
      setRegName('');
      setRegEmail('');
      setRegPass('');
      setRegConfirmPass('');
    } else {
      setRegError(res.message || 'Registration failed. An account with this email may already exist.');
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPass(pass);
    setLoginError(null);
    setActiveTab('signin');
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
                  Phase 1 WMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cambridge & Oxford Educational Publisher Inventory Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={GMAIL_INBOX_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group cursor-pointer"
              title="Open Master Admin Gmail inbox to review access requests"
            >
              <Mail className="h-3.5 w-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Master Admin Gmail Inbox</span>
              <span className="sm:hidden">Gmail Inbox</span>
              <ExternalLink className="h-3 w-3 text-rose-400/80" />
            </a>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
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
            <span>Dedicated Educational Publisher Distribution Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Secure Warehouse Management & Shortage Requisitions
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Automating book distributor stock control across Cambridge Primary English & Oxford Mathematics series. Reconciles physical warehouse stock balances against inbound supplier purchase orders using a strict preset safety formula.
          </p>

          {/* Formula Callout Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800 text-xs sm:text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                ★ Core Shortage Calculation Engine
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Formula Benchmark: 10 Units
              </span>
            </div>
            <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
              <span className="text-amber-300 font-bold">Preset Min (10)</span>
              <span className="text-slate-500 font-bold">−</span>
              <span className="text-cyan-300 font-bold">Stock Balance</span>
              <span className="text-slate-500 font-bold">−</span>
              <span className="text-purple-300 font-bold">Extra PO Stock</span>
              <span className="text-slate-500 font-bold">=</span>
              <span className="text-rose-400 font-bold">Shortage Qty Needed</span>
            </div>
            <p className="text-[11px] text-slate-400">
              When shortage &gt; 0, status marks as <strong className="text-rose-400">Qty Not Sufficient</strong> and prepares an automatic purchase requisition for Cambridge University Press or Oxford University Press.
            </p>
          </div>

          {/* Three Roles Explained */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Master Admin</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                You only (<code className="text-purple-300">master@admin.com</code>). Absolute authority, Gmail approval reviews, user options & reset.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Sliders className="h-4 w-4" />
                <span>Operations Admin</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Upload physical stock & PO CSV files, dispatch purchase orders, adjust safety presets, and export reports.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                <Eye className="h-4 w-4" />
                <span>Customer Services</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                <strong className="text-cyan-300">View-Only Access</strong>. Can inspect stock availability, shortages, and PO history. Cannot edit or upload.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: High-Fidelity Authentication Card */}
        <div className="w-full lg:w-[440px] shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative">
            <div className="absolute -top-3 -right-3">
              <span className="flex h-6 items-center px-2.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/40">
                LogiFlow Auth
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

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Sign In to LogiFlow WMS</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your authorized warehouse credentials to access inventory.
                  </p>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                    loginError.type === 'PENDING'
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                      : loginError.type === 'REJECTED'
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
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

                    {loginError.type === 'PENDING' && (
                      <div className="pt-1 border-t border-amber-500/30 flex items-center justify-between">
                        <span className="text-[10px] text-amber-300">Notify or check inbox:</span>
                        <a
                          href={GMAIL_INBOX_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Open Master Admin Gmail to Review Requests</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
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
                      placeholder="e.g. master@admin.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={e => setLoginPass(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Authenticate & Open Dashboard</span>
                </button>

                {/* Quick Demo Credentials Autofill */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Quick Demo Credentials (1-Click Fill)
                  </span>
                  
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {/* Master Admin Button */}
                    <button
                      type="button"
                      onClick={() => fillCredentials('master@admin.com', 'admin123')}
                      className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-950/70 border border-purple-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                          👑
                        </div>
                        <div>
                          <div className="font-bold text-purple-300 text-[11px]">
                            Master Admin (You Only)
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            master@admin.com · pass: admin123
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-purple-300 font-semibold group-hover:underline">
                        Fill ➔
                      </span>
                    </button>

                    {/* Operations Admin Button */}
                    <button
                      type="button"
                      onClick={() => fillCredentials('admin@logiflow.io', 'Admin123Password!')}
                      className="p-2 rounded-xl bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                          ⚡
                        </div>
                        <div>
                          <div className="font-bold text-amber-300 text-[11px]">
                            Operations Admin
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            admin@logiflow.io · pass: Admin123Password!
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-300 font-semibold group-hover:underline">
                        Fill ➔
                      </span>
                    </button>

                    {/* Customer Services Button */}
                    <button
                      type="button"
                      onClick={() => fillCredentials('cs@logiflow.io', 'CS123Password!')}
                      className="p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                          👁️
                        </div>
                        <div>
                          <div className="font-bold text-cyan-300 text-[11px]">
                            Customer Services (View-Only)
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            cs@logiflow.io · pass: CS123Password!
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-semibold group-hover:underline">
                        Fill ➔
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: REQUEST ACCOUNT (REGISTRATION) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Request Warehouse Account</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submit application to Master Admin. New accounts start as <strong>Pending Approval</strong>.
                  </p>
                </div>

                {/* Success Banner */}
                {regSuccess && (
                  <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs leading-relaxed space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block text-sm">Application Submitted!</span>
                        Your account request has been submitted to the Master Admin for review. Once approved, you will be able to log in with your credentials.
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-500/30 flex items-center justify-between">
                      <span className="text-[10px] text-amber-300">Master Admin Review Shortcut:</span>
                      <a
                        href={GMAIL_INBOX_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Open Master Admin Gmail</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
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
                    placeholder="e.g. rachel@logiflow.io"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Requested Warehouse Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      onClick={() => setRegRole('ADMIN')}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        regRole === 'ADMIN'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-[11px] flex items-center gap-1 text-amber-300">
                        <Sliders className="h-3.5 w-3.5" /> Admin
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Upload CSVs, dispatch POs & edit safety stocks
                      </div>
                    </label>

                    <label
                      onClick={() => setRegRole('CUSTOMER_SERVICE')}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        regRole === 'CUSTOMER_SERVICE'
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-[11px] flex items-center gap-1 text-cyan-300">
                        <Eye className="h-3.5 w-3.5" /> Customer Services
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Strict View-Only stock inspection & reporting
                      </div>
                    </label>
                  </div>
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
                      placeholder="Min 4 chars"
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

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Submit Application to Master Admin</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Submissions require approval by Master Admin (<code className="text-purple-300">master@admin.com</code>).
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>LogiFlow WMS · Publishing Distributor Order Management System</span>
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
