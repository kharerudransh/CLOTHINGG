import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/* ── Eye Icons ── */
const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Lock icon ── */
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* ── Arrow left ── */
const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ── Shield check (success) ── */
const ShieldCheck = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

/* ── Password strength helper ── */
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '#e0d9d0' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#e53e3e' };
  if (score <= 3) return { score, label: 'Fair',   color: '#d69e2e' };
  if (score === 4) return { score, label: 'Good',  color: '#38a169' };
  return             { score, label: 'Strong', color: '#a07850' };
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { handleResetPassword } = useAuth();

  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [errors, setErrors]               = useState({});

  const strength = getStrength(newPassword);

  const validate = () => {
    const e = {};
    if (!newPassword)          e.newPassword = 'New password is required.';
    else if (newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters.';
    if (!confirmPassword)      e.confirmPassword = 'Please confirm your password.';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await handleResetPassword({ token, newPassword });
    setLoading(false);
  };

  /* ── No token guard ── */
  if (!token) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <Link to="/" style={styles.brandLink}>CLOTHINGG</Link>
          <p style={styles.brandTagline}>TIMELESS · REFINED · YOURS</p>
        </header>
        <main style={{ ...styles.main, flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ ...styles.card, textAlign: 'center', maxWidth: '380px' }}>
            <div style={styles.shimmerBar} />
            <p style={{ ...styles.cardOverline, marginBottom: '0.75rem' }}>Invalid Link</p>
            <h2 style={styles.cardHeading}>No reset token found</h2>
            <p style={{ fontSize: '0.78rem', color: '#7a7269', lineHeight: 1.75, marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              This reset link is missing or has already been used. Please request a new one.
            </p>
            <Link to="/forgot-password" style={styles.submitBtn}>
              Request New Link
            </Link>
          </div>
        </main>
        <footer style={styles.footer}>
          © {new Date().getFullYear()} CLOTHINGG · ALL RIGHTS RESERVED
        </footer>
        <style>{globalStyles}</style>
      </div>
    );
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

        {/* Left decorative panel */}
        <div className="rp-left-panel" style={styles.leftPanel}>
          <p style={styles.overline}>Security</p>
          <h1 style={styles.leftHeading}>
            Choose a new<br /><em style={styles.goldItalic}>password.</em>
          </h1>
          <p style={styles.leftBody}>
            Create a strong, unique password to keep your Clothingg account safe.
            We recommend using a mix of letters, numbers, and symbols.
          </p>

          <div style={styles.dividerRow}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerStar}>✦</span>
            <div style={styles.dividerLine} />
          </div>

          <ul style={styles.featureList}>
            {[
              { icon: '◈', text: 'At least 6 characters long' },
              { icon: '◇', text: 'Mix uppercase & lowercase letters' },
              { icon: '⊛', text: 'Include numbers or symbols for strength' },
            ].map(({ icon, text }) => (
              <li key={text} style={styles.featureItem}>
                <span style={styles.featureIcon}>{icon}</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Vertical divider */}
        <div className="rp-vert-divider" style={styles.vertDivider} />

        {/* ── CARD ── */}
        <div className="rp-card" style={styles.card}>
          <div style={styles.shimmerBar} />

          {/* Icon badge */}
          <div style={styles.iconBadge}>
            <span style={styles.iconBadgeInner}><LockIcon /></span>
          </div>

          <p style={styles.cardOverline}>New Password</p>
          <h2 style={styles.cardHeading}>Reset Password</h2>
          <p style={styles.cardSubtext}>Enter and confirm your new password below.</p>

          <form onSubmit={handleSubmit} noValidate style={styles.form}>

            {/* New Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  placeholder="Enter new password"
                  onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(p => ({ ...p, newPassword: '' })); }}
                  style={{
                    ...styles.input,
                    paddingRight: '44px',
                    ...(errors.newPassword ? styles.inputError : {}),
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#a07850'; e.target.style.boxShadow = '0 0 0 3px rgba(160,120,80,0.10)'; e.target.style.background = '#ffffff'; }}
                  onBlur={(e)  => { e.target.style.borderColor = errors.newPassword ? '#e53e3e' : '#e0d9d0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#faf9f7'; }}
                  required
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowNew(v => !v)}
                  style={styles.eyeBtn}
                >
                  {showNew ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>

              {/* Strength meter */}
              {newPassword && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={styles.strengthTrack}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        style={{
                          ...styles.strengthSegment,
                          background: i <= strength.score ? strength.color : '#e0d9d0',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: strength.color, marginTop: '0.25rem' }}>
                    {strength.label}
                  </p>
                </div>
              )}

              {errors.newPassword && <p style={styles.errorText}>{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  placeholder="Re-enter your password"
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: '' })); }}
                  style={{
                    ...styles.input,
                    paddingRight: '44px',
                    ...(errors.confirmPassword ? styles.inputError : {}),
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#a07850'; e.target.style.boxShadow = '0 0 0 3px rgba(160,120,80,0.10)'; e.target.style.background = '#ffffff'; }}
                  onBlur={(e)  => { e.target.style.borderColor = errors.confirmPassword ? '#e53e3e' : '#e0d9d0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#faf9f7'; }}
                  required
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowConfirm(v => !v)}
                  style={styles.eyeBtn}
                >
                  {showConfirm ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword && (
                <p style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: '0.35rem',
                  color: newPassword === confirmPassword ? '#38a169' : '#e53e3e',
                }}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              {errors.confirmPassword && <p style={styles.errorText}>{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#a07850'; e.currentTarget.style.letterSpacing = '0.26em'; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.letterSpacing = '0.22em'; } }}
            >
              {loading && <span style={styles.spinner} />}
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>

            {/* Divider */}
            <div style={styles.orRow}>
              <div style={styles.orLine} />
              <span style={styles.orText}>Remembered it?</span>
              <div style={styles.orLine} />
            </div>

            <p style={{ textAlign: 'center' }}>
              <Link to="/login" style={styles.backLink}>
                <ArrowLeft /> &nbsp;Back to Sign In
              </Link>
            </p>

          </form>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} CLOTHINGG · ALL RIGHTS RESERVED
      </footer>

      <style>{globalStyles}</style>
    </div>
  );
};

/* ────────────────────────────────────────────
   Global CSS (keyframes + responsive classes)
──────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600;700&display=swap');

  @keyframes rpPageEnter {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rpSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes rpShimmer {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }

  .rp-left-panel  { display: flex; }
  .rp-vert-divider { display: block; }

  @media (max-width: 1023px) {
    .rp-left-panel   { display: none !important; }
    .rp-vert-divider { display: none !important; }
  }

  @media (max-width: 479px) {
    .rp-card { padding: 2rem 1.25rem 2.5rem !important; }
  }
`;

/* ────────────────────────────────────────────
   Inline styles — exact CLOTHINGG palette
──────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f3f0',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Montserrat', sans-serif",
    animation: 'rpPageEnter 0.45s ease both',
  },

  /* Header */
  header: { background: '#ffffff', borderBottom: '1px solid #e8e2da', textAlign: 'center', padding: '1.75rem 1.5rem' },
  brandLink: { display: 'inline-block', color: '#1a1a1a', fontWeight: 700, letterSpacing: '0.35em', fontSize: '1.5rem', marginBottom: '0.375rem', textDecoration: 'none' },
  brandTagline: { fontSize: '0.625rem', letterSpacing: '0.28em', color: '#9b8f82', margin: 0 },

  /* Main */
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', padding: '3.5rem 1.25rem' },

  /* Left panel */
  leftPanel: { flexDirection: 'column', maxWidth: '300px' },
  overline: { fontSize: '0.625rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9b8f82', marginBottom: '0.75rem' },
  leftHeading: { fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 400, color: '#1a1a1a', lineHeight: 1.15, marginBottom: '1.25rem' },
  goldItalic: { fontStyle: 'italic', color: '#a07850' },
  leftBody: { fontSize: '0.78rem', color: '#7a7269', lineHeight: 1.85, marginBottom: '2.5rem' },
  dividerRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' },
  dividerLine: { flex: 1, height: '1px', background: '#e0d9d0' },
  dividerStar: { color: '#c8a882', fontSize: '1.125rem' },
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 },
  featureItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#5a5450' },
  featureIcon: { width: '2rem', height: '2rem', borderRadius: '50%', background: '#ffffff', border: '1px solid #e0d9d0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0 },

  /* Vertical divider */
  vertDivider: { width: '1px', alignSelf: 'stretch', background: 'linear-gradient(to bottom, transparent, #d4cdc5, transparent)' },

  /* Card */
  card: { background: '#ffffff', border: '1px solid #e8e2da', width: '100%', maxWidth: '420px', padding: '2.75rem 2.5rem 3rem', position: 'relative', overflow: 'hidden' },
  shimmerBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #c8a882, #a07850, #c8a882)', animation: 'rpShimmer 2.5s ease-in-out infinite' },

  /* Icon badge */
  iconBadge: { display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' },
  iconBadgeInner: { width: '3.25rem', height: '3.25rem', borderRadius: '50%', background: '#faf7f4', border: '1px solid #e8e2da', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#a07850' },

  /* Card text */
  cardOverline: { fontSize: '0.625rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9b8f82', textAlign: 'center', marginBottom: '0.5rem' },
  cardHeading: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 500, color: '#1a1a1a', textAlign: 'center', marginBottom: '0.5rem' },
  cardSubtext: { fontSize: '0.75rem', color: '#9b8f82', textAlign: 'center', marginBottom: '2rem', letterSpacing: '0.02em' },

  /* Form */
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.625rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: '#7a7269' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '1px solid #e0d9d0', fontSize: '0.875rem', fontFamily: "'Montserrat', sans-serif", color: '#1a1a1a', background: '#faf9f7', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s', letterSpacing: '0.01em' },
  inputError: { borderColor: '#e53e3e' },
  errorText: { fontSize: '0.656rem', color: '#e53e3e', letterSpacing: '0.04em', marginTop: '0.1rem' },

  /* Eye button */
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9b8f82', display: 'flex', alignItems: 'center', padding: 0 },

  /* Strength meter */
  strengthTrack: { display: 'flex', gap: '4px' },
  strengthSegment: { flex: 1, height: '3px', borderRadius: '2px' },

  /* Submit */
  submitBtn: { width: '100%', padding: '1rem', background: '#1a1a1a', color: '#ffffff', fontSize: '0.688rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', transition: 'background 0.3s, letter-spacing 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem', textDecoration: 'none' },
  submitBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  spinner: { display: 'inline-block', width: '0.875rem', height: '0.875rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'rpSpin 0.7s linear infinite' },

  /* Or divider */
  orRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  orLine: { flex: 1, height: '1px', background: '#e8e2da' },
  orText: { fontSize: '0.625rem', color: '#b0a898', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' },

  /* Back link */
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.719rem', color: '#1a1a1a', fontWeight: 600, borderBottom: '1px solid #1a1a1a', paddingBottom: '1px', textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s' },

  /* Footer */
  footer: { textAlign: 'center', padding: '1.25rem', fontSize: '0.625rem', letterSpacing: '0.1em', color: '#b0a898', borderTop: '1px solid #e8e2da', background: '#ffffff' },
};

export default ResetPassword;