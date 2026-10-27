import React, { useState } from 'react';
import {
  Users,
  CalendarDays,
  FileText,
  BarChart2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Globe,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import factoryBg from '../assets/login_factory_bg.jpg';

interface LoginPageProps {
  onLoginSuccess: (user: { id: number; fullName: string; email: string; role: string; token: string }) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, showToast }) => {
  const [roleType, setRoleType] = useState<'admin' | 'client'>('admin');
  const [email, setEmail] = useState('sirijapolinati17@gmail.com');
  const [password, setPassword] = useState('Sirija@2004');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Authentication mode: 'login' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const checkStrongPassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must include at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(pwd)) return 'Password must include at least one lowercase letter (a-z).';
    if (!/[0-9]/.test(pwd)) return 'Password must include at least one number (0-9).';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must include at least one special character (!@#$%^&*).';
    return null;
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400', width: '0%' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500', width: '25%' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500', width: '50%' };
    if (score === 4) return { score, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-500', width: '75%' };
    return { score, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', width: '100%' };
  };

  // Step 1: Request 6-digit OTP for Forgot Password
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || 'Could not find an account with that email.');
        return;
      }
      setForgotStep('otp');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setSuccessMsg(
        data.dev_code
          ? `Code sent to ${email}! (Dev Code: ${data.dev_code})`
          : `A 6-digit verification code has been sent to ${email}. Please check your inbox.`
      );
    } catch {
      setErrorMsg('Failed to connect to email server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || 'Invalid or expired verification code.');
        return;
      }
      setForgotStep('newPassword');
      setPassword('');
      setConfirmPassword('');
      setSuccessMsg('Code verified! Please set your new password below.');
    } catch {
      setErrorMsg('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submit: Login / Signup / Password Reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (authMode === 'signup') {
      const pwdError = checkStrongPassword(password);
      if (pwdError) {
        setErrorMsg(pwdError);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Password and Confirm Password do not match.');
        return;
      }
    }

    if (authMode === 'forgot') {
      if (!otp.trim() || otp.trim().length !== 6) {
        setErrorMsg('Verification code missing. Please restart password reset.');
        setForgotStep('email');
        return;
      }
      const pwdError = checkStrongPassword(password);
      if (pwdError) {
        setErrorMsg(pwdError);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('New Password and Confirm Password do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password/verify-and-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
            new_password: password
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.detail || 'Failed to verify code or reset password.');
          return;
        }
        setSuccessMsg('Password has been successfully updated! You can now sign in.');
        showToast('Password updated successfully! Please sign in.', 'success');
        setAuthMode('login');
        setForgotStep('email');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        return;
      }

      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = authMode === 'signup'
        ? {
            full_name: fullName,
            email: email.trim(),
            password: password,
            role: roleType === 'admin' ? 'HR Admin' : 'Client'
          }
        : { email: email.trim(), password: password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || 'Authentication failed. Please check your credentials.');
        return;
      }

      const userSession = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        role: data.role || (roleType === 'admin' ? 'HR Admin' : 'Client'),
        token: data.token
      };

      if (rememberMe) {
        localStorage.setItem('fugosoft_remember_email', email);
      } else {
        localStorage.removeItem('fugosoft_remember_email');
      }

      localStorage.setItem('fugosoft_user', JSON.stringify(userSession));
      onLoginSuccess(userSession);
      showToast(`Welcome back, ${userSession.fullName}!`, 'success');
    } catch {
      setErrorMsg('Could not connect to authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans select-none overflow-x-hidden lg:overflow-hidden bg-white">
      {/* ==============================================================
          LEFT SECTION: BRANDING, HERO IMAGE, FEATURES, TESTIMONIALS
          Visible on desktop / large screens; hidden on mobile to prioritize login
          ============================================================== */}
      <div className="hidden lg:flex relative w-full lg:w-[58%] h-full p-6 sm:p-10 lg:p-12 flex-col justify-between overflow-hidden text-white shrink-0">
        {/* Background image of automated manufacturing robotics plant */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${factoryBg})` }}
        />

          {/* High-fidelity Blue Graphic Overlay as seen in reference image */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.95) 0%, rgba(240, 247, 255, 0.92) 35%, rgba(230, 242, 255, 0.75) 55%, rgba(6, 105, 226, 0.2) 80%, rgba(0, 0, 0, 0.4) 100%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 255, 0.85) 45%, rgba(20, 115, 230, 0.25) 75%, rgba(2, 60, 150, 0.4) 100%)
              `
            }}
          />

          {/* Stylized Modern Diagonal Shapes mimicking reference */}
          <div className="absolute -top-16 -right-16 w-80 h-80 rounded-3xl bg-blue-600/30 blur-2xl pointer-events-none transform rotate-45" />
          <div className="absolute top-0 right-10 w-44 h-96 bg-gradient-to-b from-[#0a66c2]/80 to-transparent transform -skew-x-12 pointer-events-none" />

          {/* TOP: Brand Logo Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0256b8] to-[#0477f4] flex items-center justify-center shadow-lg shadow-blue-600/30 text-white">
                <svg className="w-6 h-6" viewBox="0 0 36 36" fill="currentColor">
                  <path d="M4 27V15l6 3v-6l6 3.5V8l8 5v14H4z" fill="white" />
                  <rect x="18" y="4" width="2.5" height="3" rx="0.5" fill="#38bdf8" />
                  <rect x="11" y="9" width="2.5" height="3" rx="0.5" fill="#38bdf8" />
                  <circle cx="10" cy="24" r="5" fill="#38bdf8" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0f284e] tracking-tight leading-none font-sans">
                  HRMS & Accounting
                </h2>
                <p className="text-[9.5px] font-bold tracking-[0.22em] text-[#0a66c2] uppercase mt-1">
                  PEOPLE &bull; PAYROLL &bull; FINANCES
                </p>
              </div>
            </div>
          </div>

          {/* MIDDLE: Hero Headline & Value Proposition */}
          <div className="relative z-10 my-auto py-8 lg:py-10 max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0e284a] leading-[1.12] tracking-tight">
              Streamline <br />
              <span className="text-[#025ecc]">Your People,</span> <br />
              <span className="text-[#025ecc]">Payroll and</span> <br />
              Finances
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-md">
              A complete solution designed for manufacturing businesses to manage your workforce, payroll, production costs and financial operations &mdash; all in one place.
            </p>

            {/* 4 Feature Pill Badges matching screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-7">
              {/* HR & Employee Management */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#025ecc] mb-2">
                  <Users className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  HR & Employee Management
                </span>
              </div>

              {/* Payroll & Attendance */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                  <CalendarDays className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Payroll & Attendance
                </span>
              </div>

              {/* Accounting & Finance */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Accounting & Finance
                </span>
              </div>

              {/* Reports & Analytics */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 mb-2">
                  <BarChart2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  Reports & Analytics
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM: Trust Badges / Key Selling Points */}
          <div className="relative z-10 pt-4 border-t border-slate-300/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#025ecc] shrink-0" />
              <span className="text-[10.5px] font-semibold leading-tight">Improve Productivity</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#025ecc] shrink-0" />
              <span className="text-[10.5px] font-semibold leading-tight">Accurate Financial Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#025ecc] shrink-0" />
              <span className="text-[10.5px] font-semibold leading-tight">Secure & Reliable</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#025ecc] shrink-0" />
              <span className="text-[10.5px] font-semibold leading-tight">Built for Manufacturing</span>
            </div>
          </div>
        </div>

        {/* ==============================================================
            RIGHT SECTION: THE FOCUSED AUTH CARD (LOGIN / FORGOT / SIGNUP)
            ============================================================== */}
        <div className="w-full lg:w-[42%] bg-white px-4 sm:px-8 lg:px-12 py-6 sm:py-7 flex flex-col justify-between min-h-screen lg:min-h-0 lg:h-full overflow-y-auto lg:overflow-hidden">
          {/* Top right language switch */}
          <div className="flex justify-end relative">
            {showLangDropdown && (
              <div
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setShowLangDropdown(false)}
              />
            )}
            <button
              type="button"
              onClick={() => setShowLangDropdown(prev => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold hover:text-slate-800 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50 relative z-40"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedLanguage}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 top-8 w-32 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-150">
                {['English', 'Hindi', 'Kannada', 'Tamil'].map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${
                      selectedLanguage === lang ? 'text-[#025ecc] font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="my-auto max-w-sm w-full mx-auto">
            {/* Centered Logo & Title on Right Form */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#025ecc] to-[#0477f4] text-white shadow-md shadow-blue-500/25 mb-2">
                <svg className="w-6 h-6" viewBox="0 0 36 36" fill="currentColor">
                  <path d="M4 27V15l6 3v-6l6 3.5V8l8 5v14H4z" fill="white" />
                  <rect x="18" y="4" width="2.5" height="3" rx="0.5" fill="#93c5fd" />
                  <rect x="11" y="9" width="2.5" height="3" rx="0.5" fill="#93c5fd" />
                  <circle cx="10" cy="24" r="5" fill="#93c5fd" />
                </svg>
              </div>
              <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase">
                HRMS & Accounting
              </h2>
              <p className="text-[8.5px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-0.5">
                PEOPLE &bull; PAYROLL &bull; FINANCES
              </p>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5">
                {authMode === 'login'
                  ? 'Welcome Back'
                  : authMode === 'signup'
                  ? 'Create an Account'
                  : forgotStep === 'email'
                  ? 'Forgot Password'
                  : forgotStep === 'otp'
                  ? 'Verify 6-Digit Code'
                  : 'Set New Password'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {authMode === 'login'
                  ? 'Sign in to access your account'
                  : authMode === 'signup'
                  ? 'Join as Admin or Client'
                  : forgotStep === 'email'
                  ? 'Enter your email to receive a verification code'
                  : forgotStep === 'otp'
                  ? `Enter the 6-digit code sent to ${email}`
                  : 'Enter and confirm your new password'}
              </p>
            </div>

            {/* Role Selector: Admin vs Client (Matches UI Cards) */}
            {authMode === 'login' && (
              <div className="mb-3.5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Login as
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Admin Option */}
                  <button
                    type="button"
                    onClick={() => setRoleType('admin')}
                    className={`relative p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      roleType === 'admin'
                        ? 'border-[#025ecc] bg-blue-50/70 shadow-sm ring-1 ring-[#025ecc]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Radio Dot Indicator */}
                    <div className="absolute top-2.5 right-2.5 flex items-center justify-center">
                      {roleType === 'admin' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#025ecc] flex items-center justify-center bg-white shadow-2xs">
                          <div className="w-2 h-2 rounded-full bg-[#025ecc]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 bg-transparent" />
                      )}
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                      roleType === 'admin' ? 'text-[#025ecc]' : 'text-slate-500'
                    }`}>
                      <Users className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Admin
                    </span>
                    <span className="text-[9.5px] text-slate-500 block leading-tight mt-0.5">
                      Manage HRMS & Accounting
                    </span>
                  </button>

                  {/* Client Option */}
                  <button
                    type="button"
                    onClick={() => setRoleType('client')}
                    className={`relative p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      roleType === 'client'
                        ? 'border-[#025ecc] bg-blue-50/70 shadow-sm ring-1 ring-[#025ecc]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Radio Dot Indicator */}
                    <div className="absolute top-2.5 right-2.5 flex items-center justify-center">
                      {roleType === 'client' ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#025ecc] flex items-center justify-center bg-white shadow-2xs">
                          <div className="w-2 h-2 rounded-full bg-[#025ecc]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 bg-transparent" />
                      )}
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                      roleType === 'client' ? 'text-[#025ecc]' : 'text-slate-500'
                    }`}>
                      <Briefcase className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Client
                    </span>
                    <span className="text-[9.5px] text-slate-500 block leading-tight mt-0.5">
                      Access Services and Reports
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* FORGOT PASSWORD STEP 1: EMAIL */}
            {authMode === 'forgot' && forgotStep === 'email' ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025ecc]/30 focus:border-[#025ecc] transition-all"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    A 6-digit verification code will be sent to your email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#025ecc] hover:bg-[#024ebd] text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : authMode === 'forgot' && forgotStep === 'otp' ? (
              /* FORGOT PASSWORD STEP 2: VERIFY OTP */
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={isLoading}
                      className="text-xs font-semibold text-[#025ecc] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025ecc]/30 focus:border-[#025ecc] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full mt-2 py-3 bg-[#025ecc] hover:bg-[#024ebd] text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* LOGIN, SIGNUP, OR NEW PASSWORD */
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full name input for Sign Up */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025ecc]/30 focus:border-[#025ecc] transition-all"
                    />
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      readOnly={authMode === 'forgot'}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs focus:outline-none transition-all ${
                        authMode === 'forgot'
                          ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                          : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#025ecc]/30 focus:border-[#025ecc]'
                      }`}
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {authMode === 'forgot' ? 'New Password' : 'Password'}
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025ecc]/30 focus:border-[#025ecc] transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(prev => !prev);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-md"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicators during signup or reset */}
                  {(authMode === 'signup' || authMode === 'forgot') && password && (
                    <div className="mt-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                        <span className="text-slate-500">Strength:</span>
                        <span className={getPasswordStrength(password).textColor}>
                          {getPasswordStrength(password).label}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrength(password).color} rounded-full transition-all duration-300`}
                          style={{ width: getPasswordStrength(password).width }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password (for signup or new password) */}
                {(authMode === 'signup' || authMode === 'forgot') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#025ecc]/30 focus:border-[#025ecc] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Remember me & Forgot Password Bar (Login Mode) */}
                {authMode === 'login' && (
                  <div className="flex items-center justify-between pt-0.5 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 font-medium text-[11.5px]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#025ecc] border-slate-300 focus:ring-[#025ecc]/30"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setForgotStep('email');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="font-semibold text-[11.5px] text-[#025ecc] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Login Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 bg-[#025ecc] hover:bg-[#024ebd] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : authMode === 'login' ? (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : authMode === 'signup' ? (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}



            {/* Bottom Section - Only shows 'Remember your password? Sign in' when in Forgot Password mode */}
            {authMode === 'forgot' && (
              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Remember your password?
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setForgotStep('email');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="ml-1 text-[#025ecc] font-bold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} HRMS & Accounting System. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    );
};
