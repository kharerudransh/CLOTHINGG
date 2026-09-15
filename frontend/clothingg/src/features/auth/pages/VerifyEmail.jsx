import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/* ── animated envelope SVG ── */
const EnvelopeIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#a07850" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);


const VerifyEmail = () => {
  const user = useSelector((state) => state.auth?.user);
  const email = user?.email || null;

  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const navigate = useNavigate();

  const steps = [
    { num: '01', title: 'Check your inbox', desc: 'Look for an email from Clothingg with subject "Verify your email".' },
    { num: '02', title: 'Check your spam', desc: 'If you don\'t see it, check your Spam or Promotions folder.' },
    { num: '03', title: 'Click the link', desc: 'Click "Verify My Email" inside the email to activate your account.' },
    { num: '04', title: 'Sign in', desc: 'Once verified, sign in to your Clothingg account and start shopping.' },
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
      <main className="flex-1 flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-[520px] flex flex-col items-center gap-8">

          {/* Card */}
          <div className="bg-white border border-[#e8e2da] w-full px-10 py-12 relative overflow-hidden text-center">

            {/* shimmer top bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c8a882] via-[#a07850] to-[#c8a882] animate-pulse" />

            {/* Envelope icon with ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#fdf8f2] border border-[#e8ddd0] flex items-center justify-center">
                  <EnvelopeIcon />
                </div>
                {/* animated ping ring */}
                <span className="absolute inset-0 rounded-full border border-[#c8a882] animate-ping opacity-30" />
              </div>
            </div>

            {/* Eyebrow */}
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] mb-2">
              One more step
            </p>

            {/* Title */}
            <h1 className="font-[Cormorant_Garamond] text-[32px] font-medium text-[#1a1a1a] mb-4 leading-tight">
              Verify your email
            </h1>

            {/* Description */}
            <p className="text-[13px] text-[#7a7269] leading-[1.85] mb-6 max-w-[360px] mx-auto">
              Thank you for joining Clothingg. We've sent a verification link to
            </p>

            {/* Email pill */}
            {email ? (
              <button
                onClick={handleCopyEmail}
                title="Click to copy"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e0d9d0] bg-[#faf9f7]
                  hover:border-[#a07850] hover:bg-[#fdf8f2] transition-all duration-200 cursor-pointer mb-6 group"
              >
                <span className="text-[13px] font-medium text-[#1a1a1a] tracking-wide">{email}</span>
                <span className="text-[10px] text-[#9b8f82] group-hover:text-[#a07850] transition-colors">
                  {copied ? '✓ copied' : '⧉'}
                </span>
              </button>
            ) : (
              <p className="text-[13px] font-medium text-[#1a1a1a] tracking-wide mb-6">your registered email address.</p>
            )}

            <p className="text-[12px] text-[#7a7269] leading-relaxed mb-8">
              Please verify your email address to activate your account
              and continue shopping with us.
            </p>

            {/* Spam notice */}
            <div className="flex items-start gap-3 px-5 py-4 border border-[#f0e8d8] bg-[#fffaf4] mb-8 text-left">
              <span className="text-lg mt-0.5">📬</span>
              <p className="text-[11.5px] text-[#7a6855] leading-relaxed">
                <span className="font-semibold text-[#a07850]">Can't find the email?</span>
                {' '}Check your <span className="font-semibold">Spam</span> or{' '}
                <span className="font-semibold">Promotions</span> folder — it might have landed there.
              </p>
            </div>

            {/* CTA */}
            <Link
              to="/login"
              className="block w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-[0.22em] uppercase
                text-center transition-all duration-300 hover:bg-[#a07850] hover:tracking-[0.26em] mb-5"
            >
              Sign In to Your Account
            </Link>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#e8e2da]" />
              <span className="text-[10px] text-[#b0a898] tracking-[0.12em] uppercase">or</span>
              <div className="flex-1 h-px bg-[#e8e2da]" />
            </div>

            <p className="text-[11.5px] text-[#9b8f82]">
              Joined by mistake?{' '}
              <Link
                to="/register"
                className="text-[#1a1a1a] font-semibold border-b border-[#1a1a1a] pb-px
                  hover:text-[#a07850] hover:border-[#a07850] transition-all"
              >
                Create a new account
              </Link>
            </p>
          </div>

          {/* Steps */}
          <div className="w-full">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#9b8f82] text-center mb-5">
              What to do next
            </p>
            <div className="grid grid-cols-2 gap-3">
              {steps.map(({ num, title, desc }) => (
                <div
                  key={num}
                  className="bg-white border border-[#e8e2da] px-5 py-5 flex flex-col gap-2
                    hover:border-[#c8a882] hover:shadow-sm transition-all duration-200"
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#c8a882]">{num}</span>
                  <span className="text-[12px] font-semibold text-[#1a1a1a] tracking-wide">{title}</span>
                  <span className="text-[11px] text-[#9b8f82] leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-center py-5 text-[10px] tracking-[0.1em] text-[#b0a898] border-t border-[#e8e2da] bg-white">
        © {new Date().getFullYear()} CLOTHINGG · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default VerifyEmail;