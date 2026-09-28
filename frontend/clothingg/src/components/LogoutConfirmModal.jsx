import React, { useEffect } from 'react';

const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * LogoutConfirmModal
 * Props:
 *  - open: boolean
 *  - onConfirm: () => void
 *  - onCancel: () => void
 *  - loading: boolean  (optional — disables buttons during API call)
 */
const LogoutConfirmModal = ({ open, onConfirm, onCancel, loading = false }) => {

  /* close on ESC */
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onCancel]);

  return (
    <>
      {/* ── backdrop ── */}
      <div
        onClick={!loading ? onCancel : undefined}
        aria-hidden="true"
        style={{
          position       : 'fixed',
          inset          : 0,
          zIndex         : 200,
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter : 'blur(3px)',
          opacity        : open ? 1 : 0,
          pointerEvents  : open ? 'auto' : 'none',
          transition     : `opacity 280ms ${SPRING}`,
        }}
      />

      {/* ── modal card ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        style={{
          position   : 'fixed',
          top        : '50%',
          left       : '50%',
          zIndex     : 201,
          width      : 'min(380px, 90vw)',
          background : '#ffffff',
          border     : '1px solid #e8e2da',
          boxShadow  : '0 32px 80px rgba(0,0,0,0.18)',
          transform  : open
            ? 'translate(-50%, -50%) scale(1)'
            : 'translate(-50%, -48%) scale(0.96)',
          opacity    : open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition : `transform 340ms ${SPRING}, opacity 280ms ${SPRING}`,
          willChange : 'transform, opacity',
          fontFamily : 'Montserrat, sans-serif',
        }}
      >
        {/* top accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #c0685a, #e8937a)' }} />

        <div style={{ padding: '32px 32px 28px' }}>
          {/* icon */}
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fff0ed', border: '1px solid #f5d0c8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0685a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>

          {/* heading */}
          <h2 id="logout-title" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#1a1a1a', letterSpacing: '-0.01em', marginBottom: '8px', lineHeight: 1.3 }}>
            Sign out of CLOTHINGG?
          </h2>
          <p style={{ fontSize: '12px', color: '#6b6057', lineHeight: 1.65, marginBottom: '28px' }}>
            You'll need to sign in again to access your account, orders, and wishlist.
          </p>

          {/* action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* cancel */}
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1, padding: '12px 16px',
                background: 'transparent', border: '1px solid #e0d9d0',
                color: '#1a1a1a', fontSize: '11px', letterSpacing: '0.16em',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif', opacity: loading ? 0.5 : 1,
                transition: 'border-color 180ms ease, background 180ms ease',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#1a1a1a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0d9d0'; }}
            >
              Stay
            </button>

            {/* confirm */}
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: '12px 16px',
                background: loading ? '#e89380' : '#c0685a', border: '1px solid transparent',
                color: '#fff', fontSize: '11px', letterSpacing: '0.16em',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 180ms ease',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#a85549'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c0685a'; }}
            >
              {loading ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing out…
                </>
              ) : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default LogoutConfirmModal;
