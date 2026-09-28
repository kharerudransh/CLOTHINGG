import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/* ── transition keyframes (injected once) ── */
const injectTransitionStyles = () => {
  if (document.getElementById('reg-step-styles')) return;
  const s = document.createElement('style');
  s.id = 'reg-step-styles';
  s.textContent = `
    @keyframes reg-slide-out-left {
      from { opacity:1; transform:translateX(0) scale(1); }
      to   { opacity:0; transform:translateX(-48px) scale(0.97); }
    }
    @keyframes reg-slide-out-right {
      from { opacity:1; transform:translateX(0) scale(1); }
      to   { opacity:0; transform:translateX(48px) scale(0.97); }
    }
    @keyframes reg-slide-in-right {
      from { opacity:0; transform:translateX(48px) scale(0.97); }
      to   { opacity:1; transform:translateX(0) scale(1); }
    }
    @keyframes reg-slide-in-left {
      from { opacity:0; transform:translateX(-48px) scale(0.97); }
      to   { opacity:1; transform:translateX(0) scale(1); }
    }
    .reg-anim-out-left  { animation: reg-slide-out-left  300ms cubic-bezier(0.4,0,0.6,1) forwards; }
    .reg-anim-out-right { animation: reg-slide-out-right 300ms cubic-bezier(0.4,0,0.6,1) forwards; }
    .reg-anim-in-right  { animation: reg-slide-in-right  420ms cubic-bezier(0.16,1,0.3,1) forwards; }
    .reg-anim-in-left   { animation: reg-slide-in-left   420ms cubic-bezier(0.16,1,0.3,1) forwards; }
  `;
  document.head.appendChild(s);
};

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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
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
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
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
    { text: 'At least 6 characters',         met: password.length >= 6 },
    { text: 'Upper & lowercase letters',      met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { text: 'Contains a number',              met: /[0-9]/.test(password) },
    { text: 'Special character (!@#$…)',      met: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : 'bg-[#e8e2da]'}`}/>
        ))}
      </div>
      <p className={`text-[10.5px] font-semibold tracking-wide ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-orange-500' : score === 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
        Password strength: {label}
      </p>
      <ul className="flex flex-col gap-1">
        {reqs.map(({ text, met }) => (
          <li key={text} className={`flex items-center gap-1.5 text-[10px] transition-colors ${met ? 'text-emerald-600' : 'text-[#b0a898]'}`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${met ? 'bg-emerald-100 text-emerald-600' : 'bg-[#f0ece7] text-[#c0b8b0]'}`}>
              {met ? '✓' : '·'}
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ── reusable field wrapper ── */
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#7a7269]">{label}</label>
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
        type={show ? 'text' : 'password'} name={name} value={value}
        onChange={onChange} placeholder={placeholder}
        className={`w-full px-4 py-3 pr-11 border text-sm font-[Montserrat] text-[#1a1a1a] placeholder-[#bbb0a5] bg-[#faf9f7] outline-none transition-all duration-200 focus:bg-white focus:shadow-[0_0_0_3px_rgba(160,120,80,0.1)] ${error ? 'border-red-500' : 'border-[#e0d9d0] focus:border-[#a07850]'}`}
      />
      <button type="button" onClick={() => setShow(v => !v)} tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8f82] hover:text-[#a07850] transition-colors">
        {show ? <EyeOff /> : <EyeOpen />}
      </button>
    </div>
  );
};

/* ── step indicator ── */
const StepIndicator = ({ step }) => (
  <div className="flex items-center justify-center gap-3 mb-8">
    {[1, 2].map((n) => (
      <React.Fragment key={n}>
        <div className={`flex items-center gap-2 transition-all duration-300`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300
            ${step === n ? 'bg-[#1a1a1a] text-white scale-110' : step > n ? 'bg-[#a07850] text-white' : 'bg-[#e8e2da] text-[#9b8f82]'}`}>
            {step > n ? '✓' : n}
          </div>
          <span className={`text-[10px] tracking-[0.14em] uppercase font-medium transition-colors duration-300 ${step === n ? 'text-[#1a1a1a]' : step > n ? 'text-[#a07850]' : 'text-[#b0a898]'}`}>
            {n === 1 ? 'Your Info' : 'Address'}
          </span>
        </div>
        {n < 2 && <div className={`flex-1 h-px max-w-[40px] transition-colors duration-500 ${step > 1 ? 'bg-[#a07850]' : 'bg-[#e8e2da]'}`}/>}
      </React.Fragment>
    ))}
  </div>
);

/* ══════════════════════════════════════════ */
const Register = () => {
  const { handleRegister } = useAuth();

  /* ── step: logical progress (drives indicator)
     renderedStep: what is actually shown (swaps after exit anim)
     animClass: CSS class on the animated wrapper ── */
  const [step, setStep]               = useState(1);
  const [renderedStep, setRenderedStep] = useState(1);
  const [animClass, setAnimClass]     = useState('');
  const animTimers                    = useRef([]);

  /* ── form state ── */
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', contactNo: '', isSeller: false,
  });
  const [address, setAddress] = useState({
    line1: '', line2: '', city: '', state: '', pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [agreed, setAgreed]   = useState(false);

  /* ── inject styles & cleanup timers ── */
  useEffect(() => {
    injectTransitionStyles();
    return () => animTimers.current.forEach(clearTimeout);
  }, []);

  /* ── smooth step transition helper ── */
  const transitionTo = useCallback((targetStep, direction) => {
    const outClass = direction === 'forward' ? 'reg-anim-out-left' : 'reg-anim-out-right';
    const inClass  = direction === 'forward' ? 'reg-anim-in-right' : 'reg-anim-in-left';
    setAnimClass(outClass);
    const t1 = setTimeout(() => {
      setRenderedStep(targetStep);
      setStep(targetStep);
      setAnimClass(inClass);
      const t2 = setTimeout(() => setAnimClass(''), 440);
      animTimers.current.push(t2);
    }, 310);
    animTimers.current.push(t1);
  }, []);

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  /* ── step 1 validation ── */
  const validateStep1 = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim())  e.lastName  = 'Last name is required';
    if (!formData.email.trim())     e.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.contactNo.trim()) e.contactNo = 'Contact number is required';
    else if (!/^\d{10}$/.test(formData.contactNo)) e.contactNo = 'Enter a valid 10-digit number';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!agreed) e.agreed = 'Please accept the terms & conditions';
    return e;
  };

  /* ── step 2 validation ── */
  const validateStep2 = () => {
    const e = {};
    if (!address.line1.trim()) e.line1   = 'Address line 1 is required';
    if (!address.city.trim())  e.city    = 'City is required';
    if (!address.state.trim()) e.state   = 'State is required';
    if (!address.pincode)      e.pincode = 'Pincode is required';
    else if (!/^[1-9][0-9]{5}$/.test(String(address.pincode))) e.pincode = 'Enter a valid 6-digit pincode';
    return e;
  };

  /* ── next (step 1 → 2) ── */
  const handleNext = (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    transitionTo(2, 'forward');
  };

  const handleBack = () => {
    setErrors({});
    transitionTo(1, 'backward');
  };

  /* ── final submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await handleRegister({
      firstName: formData.firstName, lastName: formData.lastName,
      email: formData.email, password: formData.password,
      contactNo: formData.contactNo, isSeller: formData.isSeller,
      address: {
        line1:   address.line1,
        line2:   address.line2,
        city:    address.city,
        state:   address.state,
        pincode: Number(address.pincode),
      },
    });
    setLoading(false);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border text-sm font-[Montserrat] text-[#1a1a1a] placeholder-[#bbb0a5] bg-[#faf9f7] outline-none transition-all duration-200 focus:bg-white focus:shadow-[0_0_0_3px_rgba(160,120,80,0.1)] ${errors[field] ? 'border-red-500' : 'border-[#e0d9d0] focus:border-[#a07850]'}`;

  const perks = [
    { icon: '✦', text: 'Exclusive early access to new arrivals' },
    { icon: '◈', text: 'Personalised style recommendations' },
    { icon: '◇', text: 'Members-only offers & rewards' },
    { icon: '⊛', text: 'Priority care & free returns' },
  ];

  const INDIA_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
  ];

  return (
    <div className="min-h-screen bg-[#f5f3f0] flex flex-col font-[Montserrat]">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#e8e2da] text-center py-7 px-6">
        <Link to="/" className="inline-block text-[#1a1a1a] font-bold tracking-[0.35em] text-2xl mb-1.5 no-underline font-[Montserrat]">
          CLOTHINGG
        </Link>
        <p className="text-[10px] tracking-[0.28em] text-[#9b8f82] font-normal">TIMELESS · REFINED · YOURS</p>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-start justify-center gap-12 px-5 py-12">

        {/* Left panel */}
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
                <span className="w-8 h-8 rounded-full bg-white border border-[#e0d9d0] flex items-center justify-center text-sm flex-shrink-0">{icon}</span>
                {text}
              </li>
            ))}
          </ul>

          {/* address teaser — shown when on step 2 */}
          {step === 2 && (
            <div className="mt-8 p-4 border border-[#e0d9d0] bg-white">
              <p className="text-[10px] tracking-[0.22em] uppercase text-[#a07850] mb-2">Step 2 of 2</p>
              <p className="text-[12px] text-[#7a7269] leading-relaxed">
                We need your delivery address to ensure seamless order fulfilment right to your door.
              </p>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-[#d4cdc5] to-transparent" />

        {/* ── CARD ── */}
        <div className="bg-white border border-[#e8e2da] w-full max-w-[480px] px-10 py-11 relative overflow-hidden">
          {/* shimmer top bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c8a882] via-[#a07850] to-[#c8a882] animate-pulse" />

          {/* step indicator */}
          <StepIndicator step={step} />

          {/* ── ANIMATED STEP WRAPPER ── */}
          <div className={animClass} style={{ willChange: 'opacity, transform' }}>

          {/* ── STEP 1 ── */}
          {renderedStep === 1 && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] text-center mb-2">Step 1 of 2 · Account Details</p>
              <h2 className="font-[Cormorant_Garamond] text-[26px] font-medium text-[#1a1a1a] text-center mb-8">
                Welcome to Clothingg
              </h2>

              <form onSubmit={handleNext} noValidate className="flex flex-col gap-5">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" error={errors.firstName}>
                    <input name="firstName" type="text" value={formData.firstName}
                      onChange={handleChange} placeholder="Jane" className={inputClass('firstName')}/>
                  </Field>
                  <Field label="Last Name" error={errors.lastName}>
                    <input name="lastName" type="text" value={formData.lastName}
                      onChange={handleChange} placeholder="Doe" className={inputClass('lastName')}/>
                  </Field>
                </div>

                <Field label="Email Address" error={errors.email}>
                  <input name="email" type="email" value={formData.email}
                    onChange={handleChange} placeholder="jane@example.com" className={inputClass('email')}/>
                </Field>

                <Field label="Contact Number" error={errors.contactNo}>
                  <input name="contactNo" type="tel" value={formData.contactNo}
                    onChange={handleChange} placeholder="10-digit mobile number"
                    maxLength={10} className={inputClass('contactNo')}/>
                </Field>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#7a7269]">Password</label>
                  <PasswordInput name="password" value={formData.password}
                    onChange={handleChange} placeholder="Min. 6 characters" error={errors.password}/>
                  <PasswordStrengthMeter password={formData.password} />
                  {errors.password && <p className="text-[10.5px] text-red-600 tracking-wide">{errors.password}</p>}
                </div>

                <Field label="Confirm Password" error={errors.confirmPassword}>
                  <PasswordInput name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="Re-enter password" error={errors.confirmPassword}/>
                </Field>

                {/* Seller toggle */}
                <div
                  onClick={() => setFormData(p => ({ ...p, isSeller: !p.isSeller }))}
                  className={`flex items-center gap-3 px-4 py-3.5 border cursor-pointer transition-all duration-200 ${formData.isSeller ? 'border-[#a07850] bg-[#fdf8f2]' : 'border-[#e0d9d0] bg-[#faf9f7] hover:border-[#c8a882] hover:bg-white'}`}
                >
                  <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 flex-shrink-0 ${formData.isSeller ? 'bg-[#a07850]' : 'bg-[#ddd8d0]'}`}>
                    <div className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] shadow-sm transition-all duration-300 ${formData.isSeller ? 'left-[21px]' : 'left-[3px]'}`}/>
                  </div>
                  <div className="flex-1">
                    <span className="block text-[11.5px] font-semibold text-[#1a1a1a] tracking-wide mb-0.5">Register as a Seller</span>
                    <span className="text-[10.5px] text-[#9b8f82]">List your pieces and reach a curated audience</span>
                  </div>
                  <span className={`text-lg transition-colors ${formData.isSeller ? 'text-[#a07850]' : 'text-[#ccc5bb]'}`}>◈</span>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input id="terms" type="checkbox" checked={agreed}
                    onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: '' })); }}
                    className="mt-0.5 w-4 h-4 border border-[#c8bfb5] bg-[#faf9f7] rounded-none cursor-pointer accent-[#a07850] flex-shrink-0"/>
                  <label htmlFor="terms" className="text-[11px] text-[#7a7269] leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#a07850] border-b border-transparent hover:border-[#a07850] transition-all">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-[#a07850] border-b border-transparent hover:border-[#a07850] transition-all">Privacy Policy</Link>
                    {' '}of Clothingg.
                  </label>
                </div>
                {errors.agreed && <p className="-mt-3 text-[10.5px] text-red-600">{errors.agreed}</p>}

                {/* NEXT button */}
                <button type="submit"
                  className="w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-[0.22em] uppercase transition-all duration-300 cursor-pointer hover:bg-[#a07850] hover:tracking-[0.26em] flex items-center justify-center gap-2">
                  Next — Delivery Address
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                {/* OR / Google */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#e8e2da]"/>
                  <span className="text-[10px] text-[#b0a898] tracking-[0.12em] uppercase">or</span>
                  <div className="flex-1 h-px bg-[#e8e2da]"/>
                </div>
                <a href="/api/auth/google"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-[#e0d9d0] bg-[#faf9f7] text-[11px] font-semibold tracking-[0.15em] uppercase text-[#3a3530] no-underline transition-all duration-300 cursor-pointer hover:border-[#c8a882] hover:bg-white hover:shadow-[0_2px_12px_rgba(160,120,80,0.08)]">
                  <GoogleIcon />Continue with Google
                </a>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#e8e2da]"/>
                  <span className="text-[10px] text-[#b0a898] tracking-[0.12em] uppercase">Already a member?</span>
                  <div className="flex-1 h-px bg-[#e8e2da]"/>
                </div>
                <p className="text-center text-[11.5px] text-[#9b8f82]">
                  <Link to="/login" className="text-[#1a1a1a] font-semibold border-b border-[#1a1a1a] pb-px hover:text-[#a07850] hover:border-[#a07850] transition-all">
                    Sign in to your account →
                  </Link>
                </p>
              </form>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {renderedStep === 2 && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] text-center mb-2">Step 2 of 2 · Delivery Address</p>
              <h2 className="font-[Cormorant_Garamond] text-[26px] font-medium text-[#1a1a1a] text-center mb-2">
                Where should we deliver?
              </h2>
              <p className="text-[11px] text-[#9b8f82] text-center mb-8 leading-relaxed">
                Your address is used only for order fulfilment. You can update it any time.
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

                {/* Line 1 */}
                <Field label="Address Line 1" error={errors.line1}>
                  <input name="line1" type="text" value={address.line1}
                    onChange={handleAddressChange} placeholder="Flat / House no., Building, Street"
                    className={inputClass('line1')}/>
                </Field>

                {/* Line 2 */}
                <Field label="Address Line 2 (optional)">
                  <input name="line2" type="text" value={address.line2}
                    onChange={handleAddressChange} placeholder="Area, Colony, Landmark"
                    className={inputClass('line2')}/>
                </Field>

                {/* City + Pincode row */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" error={errors.city}>
                    <input name="city" type="text" value={address.city}
                      onChange={handleAddressChange} placeholder="New Delhi"
                      className={inputClass('city')}/>
                  </Field>
                  <Field label="Pincode" error={errors.pincode}>
                    <input name="pincode" type="text" inputMode="numeric" value={address.pincode}
                      onChange={handleAddressChange} placeholder="110001"
                      maxLength={6} className={inputClass('pincode')}/>
                  </Field>
                </div>

                {/* State dropdown */}
                <Field label="State" error={errors.state}>
                  <select name="state" value={address.state}
                    onChange={handleAddressChange}
                    className={`${inputClass('state')} cursor-pointer`}>
                    <option value="">Select state</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                {/* mini summary of step 1 */}
                <div className="bg-[#faf9f7] border border-[#e8e2da] p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#a07850] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[11px] font-bold">{formData.firstName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-semibold text-[#1a1a1a] truncate">{formData.firstName} {formData.lastName}</p>
                    <p className="text-[10px] text-[#9b8f82] truncate">{formData.email}</p>
                  </div>
                  <button type="button" onClick={handleBack}
                    className="text-[10px] text-[#a07850] tracking-[0.1em] uppercase border-b border-transparent hover:border-[#a07850] transition-all cursor-pointer bg-transparent border-0 font-[Montserrat]">
                    Edit
                  </button>
                </div>

                {/* action buttons */}
                <div className="flex gap-3">
                  {/* back */}
                  <button type="button" onClick={handleBack}
                    className="flex items-center gap-1.5 px-5 py-4 border border-[#e0d9d0] text-[#1a1a1a] text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer hover:border-[#1a1a1a] bg-white font-[Montserrat]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Back
                  </button>

                  {/* create account */}
                  <button type="submit" disabled={loading}
                    className={`flex-1 py-4 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-[0.22em] uppercase transition-all duration-300 cursor-pointer hover:bg-[#a07850] hover:tracking-[0.26em] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}>
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
                    {loading ? 'Creating Account…' : 'Create Account'}
                  </button>
                </div>

              </form>
            </div>
          )}

          </div> {/* end animated wrapper */}
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