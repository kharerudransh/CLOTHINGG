import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import LogoutConfirmModal from '../../../components/LogoutConfirmModal';

/* ─────────────── sidebar links ─────────────── */
const sidebarLinks = [
  {
    label: 'List a Product',
    sublabel: 'Add new item to your store',
    to: '/add-product',
    Icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    label: 'My Products',
    sublabel: 'View all your listed items',
    to: '/see-products',
    Icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    sublabel: 'Account & store details',
    to: '/seller-profile',
    Icon: () => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

/* ─────────────── easing presets ─────────────── */
const SPRING  = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_OUT = 'cubic-bezier(0.0, 0.0, 0.2, 1)';

/* ─────────────── component ─────────────── */
const NavBar = () => {
  const [open, setOpen]           = useState(false);
  const [hovered, setHovered]     = useState(null);
  const [edgeVisible, setEdgeVisible]   = useState(false);
  const [showLogout, setShowLogout]     = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const closeTimer  = useRef(null);
  const edgeTimer   = useRef(null);
  const edgeHideTimer = useRef(null);
  const sidebarRef  = useRef(null);

  const user      = useSelector((s) => s.auth?.user);
  const navigate  = useNavigate();
  const location  = useLocation();
  const firstName = user?.firstName || 'Account';
  const { handleLogOut } = useAuth();

  /* close sidebar on route change */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  /* ── hover-out close with grace period ── */
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 260);
  }, []);

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /* ── edge strip handlers ── */
  const handleEdgeEnter = useCallback(() => {
    clearTimeout(edgeHideTimer.current);
    // show the strip glow immediately
    setEdgeVisible(true);
    // open sidebar after short hover delay for intentionality
    edgeTimer.current = setTimeout(() => {
      cancelClose();
      setOpen(true);
    }, 200);
  }, [cancelClose]);

  const handleEdgeLeave = useCallback(() => {
    clearTimeout(edgeTimer.current);
    edgeHideTimer.current = setTimeout(() => setEdgeVisible(false), 400);
  }, []);

  useEffect(() => () => {
    clearTimeout(edgeTimer.current);
    clearTimeout(edgeHideTimer.current);
  }, []);

  /* ── keyboard ESC to close ── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ─── stagger helpers ─── */
  const itemStyle = (idx) => ({
    opacity   : open ? 1 : 0,
    transform : open ? 'translateX(0)' : 'translateX(-18px)',
    transition: `opacity ${open ? 320 : 150}ms ${SPRING} ${open ? 80 + idx * 65 : 0}ms,
                 transform ${open ? 360 : 150}ms ${SPRING} ${open ? 80 + idx * 65 : 0}ms`,
    willChange: 'opacity, transform',
  });

  return (
    <>
      {/* ══ LEFT EDGE HOVER STRIP ══ */}
      {/* Thin 6px invisible trigger zone — on hover reveals a glowing pill and opens the sidebar */}
      <div
        onMouseEnter={handleEdgeEnter}
        onMouseLeave={handleEdgeLeave}
        aria-hidden="true"
        style={{
          position   : 'fixed',
          top        : '56px',        // below the navbar
          left       : 0,
          width      : '6px',
          height     : 'calc(100vh - 56px)',
          zIndex     : 45,            // above sidebar overlay, but fine since it's outside it
          cursor     : 'pointer',
        }}
      >
        {/* visible glow pill */}
        <div
          style={{
            position  : 'absolute',
            top       : '50%',
            left      : '1px',
            transform : `translateY(-50%) scaleY(${edgeVisible ? 1 : 0.3})`,
            width     : '3px',
            height    : '64px',
            borderRadius: '0 3px 3px 0',
            background: '#c8a882',
            opacity   : edgeVisible ? 0.85 : 0,
            boxShadow : edgeVisible ? '2px 0 12px rgba(200,168,130,0.55)' : 'none',
            transition: 'opacity 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms ease',
            willChange: 'opacity, transform',
          }}
        />
      </div>
      {/* ══ OVERLAY ══ */}
      <div
        onClick={() => { cancelClose(); setOpen(false); }}
        aria-hidden="true"
        style={{
          position       : 'fixed',
          inset          : 0,
          zIndex         : 30,
          backgroundColor: 'rgba(0,0,0,0.22)',
          backdropFilter : 'blur(2px)',
          opacity        : open ? 1 : 0,
          pointerEvents  : open ? 'auto' : 'none',
          transition     : `opacity 320ms ${EASE_OUT}`,
          willChange     : 'opacity',
        }}
      />

      {/* ══ SIDEBAR ══ */}
      <aside
        ref={sidebarRef}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        style={{
          position   : 'fixed',
          top        : 0,
          left       : 0,
          height     : '100%',
          width      : '288px',
          zIndex     : 40,
          display    : 'flex',
          flexDirection: 'column',
          background : '#ffffff',
          borderRight: '1px solid #e8e2da',
          boxShadow  : open ? '6px 0 40px rgba(0,0,0,0.12)' : 'none',
          transform  : open ? 'translateX(0)' : 'translateX(-100%)',
          transition : `transform 400ms ${SPRING}, box-shadow 400ms ${SPRING}`,
          willChange : 'transform',
        }}
      >
        {/* header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #e8e2da', flexShrink: 0 }}>
          <div style={itemStyle(-1)}>
            <p style={{ fontSize: '9.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b8f82', marginBottom: '3px' }}>
              Seller Panel
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.04em' }}>
              {firstName}
            </p>
          </div>

          {/* close button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            style={{
              position  : 'absolute',
              top       : '18px',
              right     : '18px',
              width     : '32px',
              height    : '32px',
              display   : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border    : 'none',
              background: 'transparent',
              cursor    : 'pointer',
              color     : '#9b8f82',
              borderRadius: '50%',
              transition: 'background 200ms ease, color 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f3f0'; e.currentTarget.style.color = '#1a1a1a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9b8f82'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* nav */}
        <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          <p style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b0a898', padding: '0 8px', marginBottom: '8px' }}>
            Navigation
          </p>

          {sidebarLinks.map(({ label, sublabel, to, Icon }, idx) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...itemStyle(idx),
                display       : 'flex',
                alignItems    : 'center',
                gap           : '14px',
                padding       : '12px 14px',
                textDecoration: 'none',
                border        : `1px solid ${hovered === idx ? '#e0d9d0' : 'transparent'}`,
                background    : hovered === idx ? '#faf9f7' : 'transparent',
                transition    : `opacity ${open ? 320 : 150}ms ${SPRING} ${open ? 80 + idx * 65 : 0}ms,
                                 transform ${open ? 360 : 150}ms ${SPRING} ${open ? 80 + idx * 65 : 0}ms,
                                 border-color 180ms ease,
                                 background 180ms ease`,
              }}
            >
              {/* icon box */}
              <span style={{
                width     : '36px',
                height    : '36px',
                display   : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: hovered === idx ? '#1a1a1a' : '#f5f3f0',
                border    : `1px solid ${hovered === idx ? '#1a1a1a' : '#e8e2da'}`,
                color     : hovered === idx ? '#fff' : '#9b8f82',
                flexShrink: 0,
                transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
              }}>
                <Icon />
              </span>

              {/* text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.03em', lineHeight: 1.3, margin: 0 }}>
                  {label}
                </p>
                <p style={{ fontSize: '10.5px', color: '#9b8f82', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0 0' }}>
                  {sublabel}
                </p>
              </div>

              {/* chevron */}
              <svg style={{ color: hovered === idx ? '#a07850' : '#c8bfb5', flexShrink: 0, transition: 'color 200ms ease, transform 200ms ease', transform: hovered === idx ? 'translateX(2px)' : 'translateX(0)' }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </nav>

        {/* footer */}
        <div style={{ ...itemStyle(sidebarLinks.length), padding: '12px 16px 16px', borderTop: '1px solid #e8e2da', flexShrink: 0 }}>
          {/* sign out button */}
          <button
            onClick={() => setShowLogout(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', border: '1px solid transparent', background: 'transparent',
              cursor: 'pointer', borderRadius: '2px', fontFamily: 'Montserrat, sans-serif',
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff0ed'; e.currentTarget.style.borderColor = '#f5d0c8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0685a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#c0685a', letterSpacing: '0.04em' }}>Sign Out</span>
          </button>
          <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a898', marginTop: '10px', paddingLeft: '14px' }}>
            © {new Date().getFullYear()} CLOTHINGG
          </p>
        </div>
      </aside>

      {/* ══ NAVBAR ══ */}
      <nav
        style={{
          position     : 'sticky',
          top          : 0,
          zIndex       : 20,
          background   : '#ffffff',
          borderBottom : '1px solid #e8e2da',
          height       : '56px',
          display      : 'flex',
          alignItems   : 'center',
          padding      : '0 20px',
          fontFamily   : 'Montserrat, sans-serif',
        }}
      >
        {/* LEFT — hamburger */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <button
            onMouseEnter={() => { cancelClose(); setOpen(true); }}
            onMouseLeave={scheduleClose}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            style={{
              width       : '36px',
              height      : '36px',
              display     : 'flex',
              flexDirection: 'column',
              alignItems  : 'center',
              justifyContent: 'center',
              gap         : '5px',
              background  : 'transparent',
              border      : '1px solid transparent',
              cursor      : 'pointer',
              padding     : 0,
              transition  : 'background 200ms ease, border-color 200ms ease',
            }}
            onMouseEnter2={e => { e.currentTarget.style.background = '#f5f3f0'; e.currentTarget.style.borderColor = '#e0d9d0'; }}
          >
            <span style={{
              display   : 'block',
              height    : '1.5px',
              width     : open ? '15px' : '20px',
              background: '#1a1a1a',
              transformOrigin: 'center',
              transform : open ? 'rotate(45deg) translateY(6.5px)' : 'none',
              transition: `width 250ms ${SPRING}, transform 300ms ${SPRING}`,
            }} />
            <span style={{
              display   : 'block',
              height    : '1.5px',
              width     : '13px',
              background: '#1a1a1a',
              opacity   : open ? 0 : 1,
              transform : open ? 'scaleX(0)' : 'scaleX(1)',
              transition: `opacity 200ms ease, transform 200ms ${SPRING}`,
            }} />
            <span style={{
              display   : 'block',
              height    : '1.5px',
              width     : open ? '15px' : '20px',
              background: '#1a1a1a',
              transformOrigin: 'center',
              transform : open ? 'rotate(-45deg) translateY(-6.5px)' : 'none',
              transition: `width 250ms ${SPRING}, transform 300ms ${SPRING}`,
            }} />
          </button>
        </div>

        {/* CENTER — brand */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Link
            to="/seller-home"
            style={{
              color         : '#1a1a1a',
              fontWeight    : 700,
              letterSpacing : '0.35em',
              fontSize      : '15px',
              textDecoration: 'none',
              transition    : 'color 250ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#a07850'}
            onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}
          >
            CLOTHINGG
          </Link>
        </div>

        {/* RIGHT — username */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/seller-home')}
            style={{
              display    : 'flex',
              alignItems : 'center',
              gap        : '8px',
              padding    : '6px 12px',
              border     : '1px solid transparent',
              background : 'transparent',
              cursor     : 'pointer',
              transition : 'background 200ms ease, border-color 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f3f0'; e.currentTarget.style.borderColor = '#e0d9d0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            {/* avatar */}
            <div style={{
              width          : '26px',
              height         : '26px',
              borderRadius   : '50%',
              background     : '#1a1a1a',
              display        : 'flex',
              alignItems     : 'center',
              justifyContent : 'center',
              flexShrink     : 0,
            }}>
              <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.04em' }}
              className="hidden sm:block">
              {firstName}
            </span>
          </button>
        </div>
      </nav>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      <LogoutConfirmModal
        open={showLogout}
        onConfirm={async () => {
          setLogoutLoading(true);
          await handleLogOut();
          setLogoutLoading(false);
          setShowLogout(false);
        }}
        onCancel={() => setShowLogout(false)}
        loading={logoutLoading}
      />
    </>
  );
};

export default NavBar;