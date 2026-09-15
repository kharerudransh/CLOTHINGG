import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/* ── tiny eye icons ── */
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

/* ── password strength ── */
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

const STRENGTH_META = [
  { label: 'Weak',   color: 'bg-red-400' },
  { label: 'Fair',   color: 'bg-orange-400' },
  { label: 'Good',   color: 'bg-yellow-400' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

const PasswordStrengthMeter = ({ password }) => {
  const score = getStrength(password);
  if (!password) return null;
  const { label, color } = STRENGTH_META[score - 1] ?? STRENGTH_META[0];
  const reqs = [
    { text: 'At least 6 characters',           met: password.length >= 6 },
    { text: 'Upper & lowercase letters',        met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { text: 'Contains a number',                met: /[0-9]/.test(password) },
    { text: 'Special character (!@#$…)',        met: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <div className="mt-2 flex flex-col gap-2">
      {/* bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300
              ${i <= score ? color : 'bg-[#e8e2da]'}`}
          />
        ))}
      </div>
      {/* label */}
      <p className={`text-[10.5px] font-semibold tracking-wide
        ${ score <= 1 ? 'text-red-500'
         : score === 2 ? 'text-orange-500'
         : score === 3 ? 'text-yellow-600'
         : 'text-emerald-600'}`}>
        Password strength: {label}
      </p>
      {/* requirements checklist */}
      <ul className="flex flex-col gap-1">
        {reqs.map(({ text, met }) => (
          <li key={text} className={`flex items-center gap-1.5 text-[10px] transition-colors
            ${met ? 'text-emerald-600' : 'text-[#b0a898]'}`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0
              ${met ? 'bg-emerald-100 text-emerald-600' : 'bg-[#f0ece7] text-[#c0b8b0]'}`}>
              {met ? '✓' : '·'}
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ── reusable field ── */
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#7a7269]">
      {label}
    </label>
    {children}
    {error && <p className="text-[10.5px] text-red-600 tracking-wide">{error}</p>}
  </div>
);

/* ── password input ── */
const PasswordInput = ({ name, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 pr-11 border text-sm font-[Montserrat] text-[#1a1a1a] placeholder-[#bbb0a5] bg-[#faf9f7] outline-none transition-all duration-200
          focus:bg-white focus:shadow-[0_0_0_3px_rgba(160,120,80,0.1)]
          ${error ? 'border-red-500' : 'border-[#e0d9d0] focus:border-[#a07850]'}`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8f82] hover:text-[#a07850] transition-colors"
      >
        {show ? <EyeOff /> : <EyeOpen />}
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════ */
const Register = () => {
  const { handleRegister } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', contactNo: '', isSeller: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.contactNo.trim()) e.contactNo = 'Contact number is required';
    else if (!/^\d{10}$/.test(formData.contactNo)) e.contactNo = 'Enter a valid 10-digit number';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!agreed) e.agreed = 'Please accept the terms & conditions';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    await handleRegister({
      firstName: formData.firstName, lastName: formData.lastName,
      email: formData.email, password: formData.password,
      contactNo: formData.contactNo, isSeller: formData.isSeller,
    });
    setLoading(false);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border text-sm font-[Montserrat] text-[#1a1a1a] placeholder-[#bbb0a5] bg-[#faf9f7] outline-none transition-all duration-200
    focus:bg-white focus:shadow-[0_0_0_3px_rgba(160,120,80,0.1)]
    ${errors[field] ? 'border-red-500' : 'border-[#e0d9d0] focus:border-[#a07850]'}`;

  const perks = [
    { icon: '✦', text: 'Exclusive early access to new arrivals' },
    { icon: '◈', text: 'Personalised style recommendations' },
    { icon: '◇', text: 'Members-only offers & rewards' },
    { icon: '⊛', text: 'Priority care & free returns' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f3f0] flex flex-col font-[Montserrat] animate-page-enter">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#e8e2da] text-center py-7 px-6">
        <Link to="/" className="inline-block text-[#1a1a1a] font-bold tracking-[0.35em] text-2xl mb-1.5 no-underline font-[Montserrat]">
          CLOTHINGG
        </Link>
        <p className="text-[10px] tracking-[0.28em] text-[#9b8f82] font-normal">
          TIMELESS · REFINED · YOURS
        </p>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-start justify-center gap-12 px-5 py-12">

        {/* Left panel — visible on lg+ */}
        <div className="hidden lg:flex flex-col max-w-[320px] pt-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] mb-3">Join the House</p>
          <h1 className="font-[Cormorant_Garamond] text-[38px] font-normal text-[#1a1a1a] leading-tight mb-4">
            Style begins<br />with <em className="italic text-[#a07850]">you.</em>
          </h1>
          <p className="text-[12.5px] text-[#7a7269] leading-[1.85] mb-9">
            Become a member of Clothingg and unlock a world of curated fashion,
            exclusive collections, and a refined shopping experience built around your taste.
          </p>
          <ul className="flex flex-col gap-4">
            {perks.map(({ icon, text }) => (
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
        <div className="bg-white border border-[#e8e2da] w-full max-w-[480px] px-10 py-11 relative overflow-hidden">
          {/* shimmer top bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c8a882] via-[#a07850] to-[#c8a882] animate-pulse" />

          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] text-center mb-2">
            Create Account
          </p>
          <h2 className="font-[Cormorant_Garamond] text-[28px] font-medium text-[#1a1a1a] text-center mb-8">
            Welcome to Clothingg
          </h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" error={errors.firstName}>
                <input
                  name="firstName" type="text" value={formData.firstName}
                  onChange={handleChange} placeholder="Jane"
                  className={inputClass('firstName')}
                />
              </Field>
              <Field label="Last Name" error={errors.lastName}>
                <input
                  name="lastName" type="text" value={formData.lastName}
                  onChange={handleChange} placeholder="Doe"
                  className={inputClass('lastName')}
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email Address" error={errors.email}>
              <input
                name="email" type="email" value={formData.email}
                onChange={handleChange} placeholder="jane@example.com"
                className={inputClass('email')}
              />
            </Field>

            {/* Contact */}
            <Field label="Contact Number" error={errors.contactNo}>
              <input
                name="contactNo" type="tel" value={formData.contactNo}
                onChange={handleChange} placeholder="10-digit mobile number"
                maxLength={10} className={inputClass('contactNo')}
              />
            </Field>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#7a7269]">
                Password
              </label>
              <PasswordInput
                name="password" value={formData.password}
                onChange={handleChange} placeholder="Min. 6 characters"
                error={errors.password}
              />
              <PasswordStrengthMeter password={formData.password} />
              {errors.password && <p className="text-[10.5px] text-red-600 tracking-wide">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword}>
              <PasswordInput
                name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} placeholder="Re-enter password"
                error={errors.confirmPassword}
              />
            </Field>

            {/* Seller toggle */}
            <div
              onClick={() => setFormData((p) => ({ ...p, isSeller: !p.isSeller }))}
              className={`flex items-center gap-3 px-4 py-3.5 border cursor-pointer transition-all duration-200
                ${formData.isSeller
                  ? 'border-[#a07850] bg-[#fdf8f2]'
                  : 'border-[#e0d9d0] bg-[#faf9f7] hover:border-[#c8a882] hover:bg-white'}`}
            >
              {/* pill toggle */}
              <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 flex-shrink-0
                ${formData.isSeller ? 'bg-[#a07850]' : 'bg-[#ddd8d0]'}`}>
                <div className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] shadow-sm transition-all duration-300
                  ${formData.isSeller ? 'left-[21px]' : 'left-[3px]'}`} />
              </div>
              <div className="flex-1">
                <span className="block text-[11.5px] font-semibold text-[#1a1a1a] tracking-wide mb-0.5">
                  Register as a Seller
                </span>
                <span className="text-[10.5px] text-[#9b8f82]">
                  List your pieces and reach a curated audience
                </span>
              </div>
              <span className={`text-lg transition-colors ${formData.isSeller ? 'text-[#a07850]' : 'text-[#ccc5bb]'}`}>◈</span>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms" type="checkbox" checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: '' })); }}
                className="mt-0.5 w-4 h-4 border border-[#c8bfb5] bg-[#faf9f7] rounded-none cursor-pointer accent-[#a07850] flex-shrink-0"
              />
              <label htmlFor="terms" className="text-[11px] text-[#7a7269] leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-[#a07850] border-b border-transparent hover:border-[#a07850] transition-all">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#a07850] border-b border-transparent hover:border-[#a07850] transition-all">
                  Privacy Policy
                </Link>
                {' '}of Clothingg.
              </label>
            </div>
            {errors.agreed && <p className="-mt-3 text-[10.5px] text-red-600">{errors.agreed}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-[0.22em] uppercase
                transition-all duration-300 cursor-pointer
                hover:bg-[#a07850] hover:tracking-[0.26em]
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Creating Your Account…' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e8e2da]" />
              <span className="text-[10px] text-[#b0a898] tracking-[0.12em] uppercase">Already a member?</span>
              <div className="flex-1 h-px bg-[#e8e2da]" />
            </div>

            <p className="text-center text-[11.5px] text-[#9b8f82]">
              <Link
                to="/login"
                className="text-[#1a1a1a] font-semibold border-b border-[#1a1a1a] pb-px hover:text-[#a07850] hover:border-[#a07850] transition-all"
              >
                Sign in to your account →
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

export default Register;