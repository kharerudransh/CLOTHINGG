import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { toast } from "react-hot-toast";

/* ── checkmark icon ── */
const CheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── spinner icon ── */
const SpinnerIcon = () => (
  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
);

const REDIRECT_AFTER = 4;

const Verified = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { handleUserVerify } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [countdown, setCountdown] = useState(REDIRECT_AFTER);

  /* ── Step 1: verify token on mount ── */
  useEffect(() => {
    if (!token) {
      toast.error("Invalid verification link");
      setStatus("error");
      return;
    }
    const verify = async () => {
      try {
        await handleUserVerify(token);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };
    verify();
  }, [token]);

  /* ── Step 2: start countdown only after success ── */
  useEffect(() => {
    if (status !== "success") return;
    if (countdown === 0) { navigate("/login"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  /* circular ring maths — r=28 */
  const circumference = 2 * Math.PI * 28;
  const ringProgress = ((REDIRECT_AFTER - countdown) / REDIRECT_AFTER) * circumference;

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
      <main className="flex-1 flex items-center justify-center px-5 py-14">
        <div className="bg-white border border-[#e8e2da] w-full max-w-[480px] px-10 py-14 relative overflow-hidden text-center">

          {/* shimmer top bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c8a882] via-[#a07850] to-[#c8a882] animate-pulse" />

          {/* ════════ VERIFYING STATE ════════ */}
          {status === "verifying" && (
            <>
              <div className="flex items-center justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-[#faf9f7] border border-[#e0d9d0] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#e0d9d0] border-t-[#a07850] rounded-full animate-spin" />
                </div>
              </div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] mb-2">Please wait</p>
              <h1 className="font-[Cormorant_Garamond] text-[30px] font-medium text-[#1a1a1a] mb-4">
                Verifying your email…
              </h1>
              <p className="text-[13px] text-[#7a7269] leading-[1.85]">
                We're confirming your verification link. This will only take a moment.
              </p>
            </>
          )}

          {/* ════════ SUCCESS STATE ════════ */}
          {status === "success" && (
            <>
              {/* icon + countdown ring */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-24 h-24">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#e8e2da" strokeWidth="2.5" />
                    <circle
                      cx="32" cy="32" r="28" fill="none"
                      stroke="#a07850" strokeWidth="2.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - ringProgress}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>
                  <div className="absolute inset-3 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                    <CheckIcon />
                  </div>
                </div>
              </div>

              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] mb-2">
                Account Activated
              </p>
              <h1 className="font-[Cormorant_Garamond] text-[32px] font-medium text-[#1a1a1a] mb-4 leading-tight">
                Email verified!
              </h1>
              <p className="text-[13px] text-[#7a7269] leading-[1.85] mb-8 max-w-[340px] mx-auto">
                Your Clothingg account is now active. Welcome to a world of
                curated fashion, exclusive collections and timeless style.
              </p>

              {/* countdown badge */}
              <div className="flex items-center justify-center gap-2 mb-8 px-5 py-3.5 border border-[#e8e2da] bg-[#faf9f7]">
                <span className="text-[12px] text-[#9b8f82]">Redirecting to sign in in</span>
                <span className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white text-[13px] font-bold flex items-center justify-center transition-all">
                  {countdown}
                </span>
                <span className="text-[12px] text-[#9b8f82]">sec…</span>
              </div>

              <Link
                to="/login"
                className="block w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-[0.22em] uppercase
                  text-center transition-all duration-300 hover:bg-[#a07850] hover:tracking-[0.26em] mb-5"
              >
                Sign In Now →
              </Link>

              <p className="text-[11.5px] text-[#9b8f82]">
                <Link to="/"
                  className="text-[#1a1a1a] font-semibold border-b border-[#1a1a1a] pb-px hover:text-[#a07850] hover:border-[#a07850] transition-all">
                  ← Continue to Clothingg
                </Link>
              </p>
            </>
          )}

          {/* ════════ ERROR STATE ════════ */}
          {status === "error" && (
            <>
              <div className="flex items-center justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>

              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9b8f82] mb-2">Verification Failed</p>
              <h1 className="font-[Cormorant_Garamond] text-[30px] font-medium text-[#1a1a1a] mb-4">
                Link expired or invalid
              </h1>
              <p className="text-[13px] text-[#7a7269] leading-[1.85] mb-8 max-w-[340px] mx-auto">
                Your verification link may have expired or already been used.
                Please register again to receive a new link.
              </p>

              <Link to="/register"
                className="block w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-semibold tracking-[0.22em] uppercase
                  text-center transition-all duration-300 hover:bg-[#a07850] hover:tracking-[0.26em] mb-5">
                Register Again
              </Link>
              <p className="text-[11.5px] text-[#9b8f82]">
                <Link to="/login"
                  className="text-[#1a1a1a] font-semibold border-b border-[#1a1a1a] pb-px hover:text-[#a07850] hover:border-[#a07850] transition-all">
                  Already verified? Sign in →
                </Link>
              </p>
            </>
          )}

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-center py-5 text-[10px] tracking-[0.1em] text-[#b0a898] border-t border-[#e8e2da] bg-white">
        © {new Date().getFullYear()} CLOTHINGG · ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default Verified;