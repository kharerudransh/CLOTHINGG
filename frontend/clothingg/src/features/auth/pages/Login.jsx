import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


/* ── Google icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

/* ── eye icons ── */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    const user=await handleLogin({ email: formData.email, password: formData.password });
    if(user.role=="Buyer"){
        navigate("/buyer-home");
    }else if(user.role=="Seller"){
        navigate("/seller-home");
    }
    setLoading(false);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border text-sm font-[Montserrat] text-[#1a1a1a] placeholder-[#bbb0a5] bg-[#faf9f7] outline-none transition-all duration-200
    focus:bg-white focus:shadow-[0_0_0_3px_rgba(160,120,80,0.1)]
    ${errors[field] ? 'border-red-500' : 'border-[#e0d9d0] focus:border-[#a07850]'}`;

  return (
    <div className="min-h-screen bg-[#f5f3f0] flex flex-col font-[Montserrat] animate-page-enter">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#e8e2da] text-center py-7 px-6">
        <Link to="/" className="inline-block text-[#1a1a1a] font-bold tracking-[0.35em] text-2xl mb-1.5 no-underline">
          CLOTHINGG
        </Link>
        <p className="text-[10px] tracking-[0.28em] text-[#9b8f82]">
          TIMELESS · REFINED · YOURS
        </p>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-center justify-center gap-12 px-5 py-14">

        {/* Left panel */}
        <div className="hidden lg:flex flex-col max-w-[300px]">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] mb-3">Welcome back</p>
          <h1 className="font-[Cormorant_Garamond] text-[40px] font-normal text-[#1a1a1a] leading-tight mb-5">
            Good to see<br />you <em className="italic text-[#a07850]">again.</em>
          </h1>
          <p className="text-[12.5px] text-[#7a7269] leading-[1.85] mb-10">
            Sign in to your Clothingg account and pick up right
            where you left off — your style, your way.
          </p>

          {/* decorative divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-[#e0d9d0]" />
            <span className="text-[#c8a882] text-lg">✦</span>
            <div className="h-px flex-1 bg-[#e0d9d0]" />
          </div>

          <ul className="flex flex-col gap-4">
            {[
              { icon: '◈', text: 'Access your orders & wishlist' },
              { icon: '◇', text: 'Exclusive member-only offers' },
              { icon: '⊛', text: 'Personalised style picks' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[12px] text-[#5a5450]">
                <span className="w-8 h-8 rounded-full bg-white border border-[#e0d9d0] flex items-center justify-center text-sm flex-shrink-0">
                  {icon}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-[#d4cdc5] to-transparent" />

        {/* ── CARD ── */}
        <div className="bg-white border border-[#e8e2da] w-full max-w-[420px] px-10 py-11 relative overflow-hidden">

          {/* shimmer bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c8a882] via-[#a07850] to-[#c8a882] animate-pulse" />

          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] text-center mb-2">
            Sign In
          </p>
          <h2 className="font-[Cormorant_Garamond] text-[28px] font-medium text-[#1a1a1a] text-center mb-8">
            Welcome back
          </h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#7a7269]">
                Email Address
              </label>
              <input
                name="email" type="email" value={formData.email}
                onChange={handleChange} placeholder="jane@example.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="text-[10.5px] text-red-600 tracking-wide">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#7a7269]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] text-[#a07850] tracking-wide hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ paddingRight: '44px' }}
                  className={inputClass('password')}
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8f82] hover:text-[#a07850] transition-colors"
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errors.password && <p className="text-[10.5px] text-red-600 tracking-wide">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-[0.22em] uppercase
                transition-all duration-300 cursor-pointer mt-1
                hover:bg-[#a07850] hover:tracking-[0.26em]
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Signing In…' : 'Sign In'}
            </button>

            {/* Google OAuth */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e8e2da]" />
              <span className="text-[10px] text-[#b0a898] tracking-[0.12em] uppercase">or</span>
              <div className="flex-1 h-px bg-[#e8e2da]" />
            </div>

            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}
              className="w-full py-3.5 border border-[#e0d9d0] bg-white text-[#1a1a1a] text-[11px] font-semibold
                tracking-[0.15em] uppercase flex items-center justify-center gap-3
                transition-all duration-300 cursor-pointer
                hover:border-[#a07850] hover:shadow-[0_2px_12px_rgba(160,120,80,0.12)] hover:bg-[#faf9f7]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e8e2da]" />
              <span className="text-[10px] text-[#b0a898] tracking-[0.12em] uppercase">New here?</span>
              <div className="flex-1 h-px bg-[#e8e2da]" />
            </div>

            <p className="text-center text-[11.5px] text-[#9b8f82]">
              <Link
                to="/register"
                className="text-[#1a1a1a] font-semibold border-b border-[#1a1a1a] pb-px hover:text-[#a07850] hover:border-[#a07850] transition-all"
              >
                Create your account →
              </Link>
            </p>

          </form>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-center py-5 text-[10px] tracking-[0.1em] text-[#b0a898] border-t border-[#e8e2da] bg-white">
        © {new Date().getFullYear()} CLOTHINGG · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default Login;