import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import LogoutConfirmModal from '../../../components/LogoutConfirmModal';

/* ── nav links ── */
const NAV_LINKS = [
  {
    label: 'Discover',
    sublabel: 'Browse all collections',
    to: '/buyer-home',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    label: 'All Products',
    sublabel: 'Full catalogue & new arrivals',
    to: '/buyer-products',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    label: 'Wishlist',
    sublabel: 'Your saved items',
    to: '/buyer-wishlist',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    label: 'My Orders',
    sublabel: 'Track your purchases',
    to: '/buyer-orders',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    sublabel: 'Account & settings',
    to: '/buyer-profile',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const SPRING   = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_OUT = 'cubic-bezier(0.0, 0.0, 0.2, 1)';

const BuyerLayout = () => {
  const [open, setOpen]             = useState(false);
  const [hovIdx, setHovIdx]         = useState(null);
  const [edgeVis, setEdgeVis]       = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const closeTimer    = useRef(null);
  const edgeTimer     = useRef(null);
  const edgeHideTimer = useRef(null);

  const user      = useSelector((s) => s.auth?.user);
  const { handleLogOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const firstName = user?.firstName || 'Guest';

  /* close on route change */
  useEffect(() => { setOpen(false); setMobileOpen(false); }, [location.pathname]);
  /* cleanup */
  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    clearTimeout(edgeTimer.current);
    clearTimeout(edgeHideTimer.current);
  }, []);
  /* ESC */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') { setOpen(false); setMobileOpen(false); }};
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 260);
  }, []);
  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);

  const handleEdgeEnter = useCallback(() => {
    clearTimeout(edgeHideTimer.current);
    setEdgeVis(true);
    edgeTimer.current = setTimeout(() => { cancelClose(); setOpen(true); }, 180);
  }, [cancelClose]);

  const handleEdgeLeave = useCallback(() => {
    clearTimeout(edgeTimer.current);
    edgeHideTimer.current = setTimeout(() => setEdgeVis(false), 400);
  }, []);

  const itemStyle = (idx) => ({
    opacity   : open ? 1 : 0,
    transform : open ? 'translateX(0)' : 'translateX(-18px)',
    transition: `opacity ${open ? 300 : 120}ms ${SPRING} ${open ? 60 + idx * 55 : 0}ms,
                 transform ${open ? 340 : 120}ms ${SPRING} ${open ? 60 + idx * 55 : 0}ms`,
    willChange: 'opacity, transform',
  });

  const handleLogout = () => setShowLogout(true);
  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    await handleLogOut();
    setLogoutLoading(false);
    setShowLogout(false);
  };

  /* ── sidebar content (shared between desktop & mobile) ── */
  const SidebarContent = ({ animate }) => (
    <>
      {/* header */}
      <div style={{ padding: '22px 24px', borderBottom: '1px solid #e8e2da', flexShrink: 0, position: 'relative' }}>
        <div style={animate ? itemStyle(-1) : {}}>
          <p style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b8f82', marginBottom: '3px' }}>
            Member
          </p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.04em' }}>
            {firstName}
          </p>
        </div>
        <button
          onClick={() => { setOpen(false); setMobileOpen(false); }}
          style={{ position: 'absolute', top: '18px', right: '18px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9b8f82', borderRadius: '50%' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f3f0'; e.currentTarget.style.color = '#1a1a1a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9b8f82'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <p style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b0a898', padding: '0 8px', marginBottom: '8px' }}>
          Navigation
        </p>
        {NAV_LINKS.map(({ label, sublabel, to, icon }, idx) => (
          <Link
            key={to}
            to={to}
            onClick={() => { setOpen(false); setMobileOpen(false); }}
            onMouseEnter={() => setHovIdx(idx)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              ...(animate ? itemStyle(idx) : {}),
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '11px 14px', textDecoration: 'none',
              border: `1px solid ${hovIdx === idx ? '#e0d9d0' : 'transparent'}`,
              background: location.pathname === to ? '#faf9f7' : hovIdx === idx ? '#faf9f7' : 'transparent',
              borderRadius: '2px',
              transition: 'border-color 180ms ease, background 180ms ease',
            }}
          >
            <span style={{
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: location.pathname === to ? '#1a1a1a' : hovIdx === idx ? '#1a1a1a' : '#f5f3f0',
              border: `1px solid ${hovIdx === idx || location.pathname === to ? '#1a1a1a' : '#e8e2da'}`,
              color: hovIdx === idx || location.pathname === to ? '#fff' : '#9b8f82',
              flexShrink: 0,
              transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
            }}>
              {icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.03em', margin: 0 }}>{label}</p>
              <p style={{ fontSize: '10.5px', color: '#9b8f82', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0' }}>{sublabel}</p>
            </div>
            <svg style={{ color: hovIdx === idx ? '#a07850' : '#c8bfb5', flexShrink: 0, transition: 'color 200ms ease, transform 200ms ease', transform: hovIdx === idx ? 'translateX(2px)' : 'none' }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </nav>

      {/* logout footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #e8e2da', flexShrink: 0 }}>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', borderRadius: '2px', transition: 'background 200ms ease, border-color 200ms ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff0ed'; e.currentTarget.style.borderColor = '#f5d0c8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0685a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#c0685a', letterSpacing: '0.04em' }}>Sign Out</span>
        </button>
        <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a898', marginTop: '12px' }}>
          © {new Date().getFullYear()} CLOTHINGG
        </p>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3f0', fontFamily: 'Montserrat, sans-serif' }}>

      {/* ── LEFT EDGE HOVER STRIP (desktop only) ── */}
      <div
        onMouseEnter={handleEdgeEnter}
        onMouseLeave={handleEdgeLeave}
        aria-hidden="true"
        style={{ position: 'fixed', top: '56px', left: 0, width: '6px', height: 'calc(100vh - 56px)', zIndex: 45, cursor: 'pointer' }}
      >
        <div style={{
          position: 'absolute', top: '50%', left: '1px',
          transform: `translateY(-50%) scaleY(${edgeVis ? 1 : 0.3})`,
          width: '3px', height: '64px', borderRadius: '0 3px 3px 0',
          background: '#c8a882', opacity: edgeVis ? 0.85 : 0,
          boxShadow: edgeVis ? '2px 0 12px rgba(200,168,130,0.55)' : 'none',
          transition: 'opacity 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)',
        }}/>
      </div>

      {/* ── OVERLAY ── */}
      <div
        onClick={() => { cancelClose(); setOpen(false); setMobileOpen(false); }}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 30,
          backgroundColor: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(2px)',
          opacity: (open || mobileOpen) ? 1 : 0,
          pointerEvents: (open || mobileOpen) ? 'auto' : 'none',
          transition: `opacity 320ms ${EASE_OUT}`,
        }}
      />

      {/* ── DESKTOP SIDEBAR (hover-triggered) ── */}
      <aside
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        style={{
          position: 'fixed', top: 0, left: 0, height: '100%', width: '280px',
          zIndex: 40, display: 'flex', flexDirection: 'column',
          background: '#ffffff', borderRight: '1px solid #e8e2da',
          boxShadow: open ? '6px 0 40px rgba(0,0,0,0.10)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform 400ms ${SPRING}, box-shadow 400ms ${SPRING}`,
        }}
      >
        <SidebarContent animate={true} />
      </aside>

      {/* ── MOBILE SIDEBAR (hamburger-triggered, from left) ── */}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, height: '100%', width: '280px',
          zIndex: 42, display: 'flex', flexDirection: 'column',
          background: '#ffffff', borderRight: '1px solid #e8e2da',
          boxShadow: mobileOpen ? '6px 0 40px rgba(0,0,0,0.12)' : 'none',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform 380ms ${SPRING}`,
        }}
        className="lg:hidden"
      >
        <SidebarContent animate={false} />
      </aside>

      {/* ── TOP NAV BAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#ffffff', borderBottom: '1px solid #e8e2da',
        height: '56px', display: 'flex', alignItems: 'center', padding: '0 20px',
      }}>
        {/* hamburger */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* desktop hover trigger (shows on hover of button too) */}
          <button
            onMouseEnter={() => { cancelClose(); setOpen(true); }}
            onMouseLeave={scheduleClose}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
            className="hidden lg:flex"
            style={{ width: '36px', height: '36px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', padding: 0 }}
          >
            {[open ? '15px' : '20px', '13px', open ? '15px' : '20px'].map((w, i) => (
              <span key={i} style={{
                display: 'block', height: '1.5px', width: w, background: '#1a1a1a',
                transformOrigin: 'center',
                transform: open && i === 0 ? 'rotate(45deg) translateY(6.5px)' : open && i === 2 ? 'rotate(-45deg) translateY(-6.5px)' : 'none',
                opacity: open && i === 1 ? 0 : 1,
                transition: `width 250ms ${SPRING}, transform 300ms ${SPRING}, opacity 200ms ease`,
              }}/>
            ))}
          </button>

          {/* mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle mobile menu"
            className="flex lg:hidden"
            style={{ width: '36px', height: '36px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {['20px','13px','20px'].map((w, i) => (
              <span key={i} style={{ display: 'block', height: '1.5px', width: w, background: '#1a1a1a' }}/>
            ))}
          </button>
        </div>

        {/* brand */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Link to="/buyer-home" style={{ color: '#1a1a1a', fontWeight: 700, letterSpacing: '0.35em', fontSize: '15px', textDecoration: 'none', transition: 'color 250ms ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a07850'}
            onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}>
            CLOTHINGG
          </Link>
        </div>

        {/* right — cart + avatar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
          {/* cart */}
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid transparent', borderRadius: '2px', cursor: 'pointer', color: '#1a1a1a', transition: 'background 200ms, border-color 200ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f3f0'; e.currentTarget.style.borderColor = '#e0d9d0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>

          {/* avatar */}
          <button onClick={() => navigate('/buyer-profile')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', borderRadius: '2px', transition: 'background 200ms, border-color 200ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f3f0'; e.currentTarget.style.borderColor = '#e0d9d0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#a07850', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700 }}>{firstName.charAt(0).toUpperCase()}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#1a1a1a', letterSpacing: '0.04em' }} className="hidden sm:block">
              {firstName}
            </span>
          </button>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main>
        <Outlet />
      </main>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      <LogoutConfirmModal
        open={showLogout}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogout(false)}
        loading={logoutLoading}
      />
    </div>
  );
};

export default BuyerLayout;
