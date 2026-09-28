import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

/* ── mail icon ── */
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

/* ── arrow left icon ── */
const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ── check circle icon ── */
const CheckCircle = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { handleForgotPassword } = useAuth();

  const validate = () => {
    if (!email.trim()) return "Email address is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    return "";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    await handleForgotPassword({ email });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div style={styles.page}>

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <Link to="/" style={styles.brandLink}>CLOTHINGG</Link>
        <p style={styles.brandTagline}>TIMELESS · REFINED · YOURS</p>
      </header>

      {/* ── MAIN ── */}
      <main style={styles.main}>

        {/* Left decorative panel — hidden on mobile via media query class */}
        <div className="fp-left-panel" style={styles.leftPanel}>
          <p style={styles.overline}>Account Recovery</p>
          <h1 style={styles.leftHeading}>
            Forgotten<br />your <em style={styles.goldItalic}>password?</em>
          </h1>
          <p style={styles.leftBody}>
            It happens to the best of us. Enter your registered email address
            and we'll send you a secure link to reset your password in moments.
          </p>

          {/* Decorative divider */}
          <div style={styles.dividerRow}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerStar}>✦</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Feature list */}
          <ul style={styles.featureList}>
            {[
              { icon: "◈", text: "Secure, encrypted reset link" },
              { icon: "◇", text: "Link expires after 15 minutes" },
              { icon: "⊛", text: "No password stored in plain text" },
            ].map(({ icon, text }) => (
              <li key={text} style={styles.featureItem}>
                <span style={styles.featureIcon}>{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Vertical divider — hidden on mobile */}
        <div className="fp-vert-divider" style={styles.vertDivider} />

        {/* ── CARD ── */}
        <div className="fp-card" style={styles.card}>
          {/* shimmer accent bar */}
          <div style={styles.shimmerBar} />

          {!submitted ? (
            <>
              {/* Icon badge */}
              <div style={styles.iconBadge}>
                <span style={styles.iconBadgeInner}><MailIcon /></span>
              </div>

              <p style={styles.cardOverline}>Password Reset</p>
              <h2 style={styles.cardHeading}>Forgot Password</h2>
              <p style={styles.cardSubtext}>
                We'll send a reset link to your email address.
              </p>

              <form onSubmit={handleSubmit} noValidate style={styles.form}>
                {/* Email field */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                    placeholder="jane@example.com"
                    style={{
                      ...styles.input,
                      ...(error ? styles.inputError : {}),
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#a07850";
                      e.target.style.boxShadow = "0 0 0 3px rgba(160,120,80,0.10)";
                      e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? "#e53e3e" : "#e0d9d0";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#faf9f7";
                    }}
                    required
                  />
                  {error && <p style={styles.errorText}>{error}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.submitBtn,
                    ...(loading ? styles.submitBtnDisabled : {}),
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#a07850"; e.currentTarget.style.letterSpacing = "0.26em"; } }}
                  onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.letterSpacing = "0.22em"; } }}
                >
                  {loading && <span style={styles.spinner} />}
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>

                {/* Divider */}
                <div style={styles.orRow}>
                  <div style={styles.orLine} />
                  <span style={styles.orText}>Remembered it?</span>
                  <div style={styles.orLine} />
                </div>

                {/* Back to login */}
                <p style={{ textAlign: "center" }}>
                  <Link to="/login" style={styles.backLink}>
                    <ArrowLeft /> &nbsp;Back to Sign In
                  </Link>
                </p>
              </form>
            </>
          ) : (
            /* ── SUCCESS STATE ── */
            <div style={styles.successContainer}>
              <div style={styles.successIcon}><CheckCircle /></div>
              <p style={styles.cardOverline}>Email Sent</p>
              <h2 style={styles.cardHeading}>Check your inbox</h2>
              <p style={styles.successBody}>
                We've sent a password reset link to{" "}
                <strong style={{ color: "#1a1a1a", fontWeight: 600 }}>{email}</strong>.
                It will expire in 15 minutes.
              </p>
              <p style={styles.successNote}>
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  style={styles.retryBtn}
                >
                  try again
                </button>.
              </p>
              <Link to="/login" style={styles.backToLoginFull}>
                <ArrowLeft /> &nbsp;Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CLOTHINGG · ALL RIGHTS RESERVED
      </footer>

      {/* ── Global styles & keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600;700&display=swap');

        @keyframes fpPageEnter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fpSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes fpSuccessPop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fpShimmer {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }

        .fp-left-panel { display: flex; }
        .fp-vert-divider { display: block; }

        @media (max-width: 1023px) {
          .fp-left-panel  { display: none !important; }
          .fp-vert-divider { display: none !important; }
        }

        @media (max-width: 479px) {
          .fp-card {
            padding: 2rem 1.25rem 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

/* ────────────────────────────────────────────
   Styles — mirrors Login.jsx palette exactly
──────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f3f0",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Montserrat', sans-serif",
    animation: "fpPageEnter 0.45s ease both",
  },

  /* Header */
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e8e2da",
    textAlign: "center",
    padding: "1.75rem 1.5rem",
  },
  brandLink: {
    display: "inline-block",
    color: "#1a1a1a",
    fontWeight: 700,
    letterSpacing: "0.35em",
    fontSize: "1.5rem",
    marginBottom: "0.375rem",
    textDecoration: "none",
  },
  brandTagline: {
    fontSize: "0.625rem",
    letterSpacing: "0.28em",
    color: "#9b8f82",
    margin: 0,
  },

  /* Main layout */
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "3rem",
    padding: "3.5rem 1.25rem",
  },

  /* Left panel */
  leftPanel: {
    flexDirection: "column",
    maxWidth: "300px",
  },
  overline: {
    fontSize: "0.625rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#9b8f82",
    marginBottom: "0.75rem",
  },
  leftHeading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "2.5rem",
    fontWeight: 400,
    color: "#1a1a1a",
    lineHeight: 1.15,
    marginBottom: "1.25rem",
  },
  goldItalic: {
    fontStyle: "italic",
    color: "#a07850",
  },
  leftBody: {
    fontSize: "0.78rem",
    color: "#7a7269",
    lineHeight: 1.85,
    marginBottom: "2.5rem",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e0d9d0",
  },
  dividerStar: {
    color: "#c8a882",
    fontSize: "1.125rem",
  },
  featureList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: 0,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.75rem",
    color: "#5a5450",
  },
  featureIcon: {
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    background: "#ffffff",
    border: "1px solid #e0d9d0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    flexShrink: 0,
  },

  /* Vertical divider */
  vertDivider: {
    width: "1px",
    alignSelf: "stretch",
    background: "linear-gradient(to bottom, transparent, #d4cdc5, transparent)",
  },

  /* Card */
  card: {
    background: "#ffffff",
    border: "1px solid #e8e2da",
    width: "100%",
    maxWidth: "420px",
    padding: "2.75rem 2.5rem 3rem",
    position: "relative",
    overflow: "hidden",
  },
  shimmerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(to right, #c8a882, #a07850, #c8a882)",
    animation: "fpShimmer 2.5s ease-in-out infinite",
  },

  /* Icon badge */
  iconBadge: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  iconBadgeInner: {
    width: "3.25rem",
    height: "3.25rem",
    borderRadius: "50%",
    background: "#faf7f4",
    border: "1px solid #e8e2da",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#a07850",
  },

  /* Card text */
  cardOverline: {
    fontSize: "0.625rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#9b8f82",
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  cardHeading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.75rem",
    fontWeight: 500,
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: "0.5rem",
  },
  cardSubtext: {
    fontSize: "0.75rem",
    color: "#9b8f82",
    textAlign: "center",
    marginBottom: "2rem",
    letterSpacing: "0.02em",
  },

  /* Form */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.625rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 500,
    color: "#7a7269",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #e0d9d0",
    fontSize: "0.875rem",
    fontFamily: "'Montserrat', sans-serif",
    color: "#1a1a1a",
    background: "#faf9f7",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    letterSpacing: "0.01em",
  },
  inputError: {
    borderColor: "#e53e3e",
  },
  errorText: {
    fontSize: "0.656rem",
    color: "#e53e3e",
    letterSpacing: "0.04em",
    marginTop: "0.1rem",
  },

  /* Submit button */
  submitBtn: {
    width: "100%",
    padding: "1rem",
    background: "#1a1a1a",
    color: "#ffffff",
    fontSize: "0.688rem",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s, letter-spacing 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0.25rem",
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinner: {
    display: "inline-block",
    width: "0.875rem",
    height: "0.875rem",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "fpSpin 0.7s linear infinite",
  },

  /* Or divider */
  orRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  orLine: {
    flex: 1,
    height: "1px",
    background: "#e8e2da",
  },
  orText: {
    fontSize: "0.625rem",
    color: "#b0a898",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  /* Back link */
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.719rem",
    color: "#1a1a1a",
    fontWeight: 600,
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: "1px",
    textDecoration: "none",
    transition: "color 0.2s, border-color 0.2s",
  },

  /* Success state */
  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "0.75rem",
    paddingTop: "0.5rem",
  },
  successIcon: {
    color: "#a07850",
    marginBottom: "0.75rem",
    animation: "fpSuccessPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
  },
  successBody: {
    fontSize: "0.8rem",
    color: "#7a7269",
    lineHeight: 1.75,
    maxWidth: "300px",
    marginTop: "0.25rem",
  },
  successNote: {
    fontSize: "0.72rem",
    color: "#9b8f82",
    marginTop: "0.25rem",
    lineHeight: 1.6,
  },
  retryBtn: {
    background: "none",
    border: "none",
    borderBottom: "1px solid #a07850",
    color: "#a07850",
    fontSize: "0.72rem",
    cursor: "pointer",
    padding: 0,
    fontFamily: "'Montserrat', sans-serif",
  },
  backToLoginFull: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    marginTop: "1rem",
    fontSize: "0.688rem",
    fontWeight: 600,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#1a1a1a",
    textDecoration: "none",
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: "2px",
    transition: "color 0.2s, border-color 0.2s",
  },

  /* Footer */
  footer: {
    textAlign: "center",
    padding: "1.25rem",
    fontSize: "0.625rem",
    letterSpacing: "0.1em",
    color: "#b0a898",
    borderTop: "1px solid #e8e2da",
    background: "#ffffff",
  },
};

export default ForgotPassword;