import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../../products/hooks/useProduct';

/* ── inject keyframes once ── */
const injectStyles = () => {
  if (document.getElementById('buyer-home-styles')) return;
  const s = document.createElement('style');
  s.id = 'buyer-home-styles';
  s.textContent = `
    @keyframes bh-fade-up {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes bh-shimmer {
      0%   { background-position: -300% center; }
      100% { background-position:  300% center; }
    }
    @keyframes bh-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes bh-grain {
      0%,100%{ transform:translate(0,0) }
      10%{ transform:translate(-2%,-3%) }
      20%{ transform:translate(3%,2%) }
      30%{ transform:translate(-1%,4%) }
      40%{ transform:translate(2%,-2%) }
      50%{ transform:translate(-3%,1%) }
      60%{ transform:translate(1%,3%) }
      70%{ transform:translate(-2%,-1%) }
      80%{ transform:translate(3%,-3%) }
      90%{ transform:translate(-1%,2%) }
    }
    @keyframes bh-spin {
      to { transform: rotate(360deg); }
    }
    .bh-card:hover { transform: translateY(-4px); box-shadow: 0 18px 48px rgba(0,0,0,0.12) !important; }
    .bh-card { transition: transform 320ms cubic-bezier(0.16,1,0.3,1), box-shadow 320ms ease; cursor: pointer; }
    .bh-stat-card:hover { background: #1a1a1a !important; }
    .bh-stat-card:hover p, .bh-stat-card:hover span { color: #fff !important; }
    .bh-stat-card { transition: background 250ms ease; }
    .bh-btn-primary:hover { background: #8a6640 !important; }
    .bh-btn-primary { transition: background 200ms ease; }
    .bh-category:hover { transform: scale(1.03); filter: brightness(1.04); }
    .bh-category { transition: transform 300ms cubic-bezier(0.16,1,0.3,1), filter 300ms ease; cursor: pointer; }
    .bh-wish:hover { background: #1a1a1a !important; border-color: #1a1a1a !important; }
    .bh-img-fade { transition: transform 400ms cubic-bezier(0.16,1,0.3,1); }
    .bh-card:hover .bh-img-fade { transform: scale(1.04); }
  `;
  document.head.appendChild(s);
};

/* ── scroll reveal hook ── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── data ── */
const CATEGORIES = [
  { label: 'New Arrivals',  bg: '#1a1a1a',  color: '#f5f3f0', accent: '#a07850' },
  { label: 'Dresses',       bg: '#e8e2da',  color: '#1a1a1a', accent: '#9b8f82' },
  { label: 'Outerwear',     bg: '#a07850',  color: '#fff',    accent: '#f5f3f0' },
  { label: 'Accessories',   bg: '#f5f3f0',  color: '#1a1a1a', accent: '#a07850' },
];

/* ── section reveal wrapper ── */
const Section = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 650ms cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                   transform 650ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      willChange: 'opacity, transform',
      ...style,
    }}>
      {children}
    </div>
  );
};

/* ── currency symbol helper ── */
const currencySymbol = (c) => c === 'INR' ? '₹' : '$';

/* ── placeholder image gradient ── */
const placeholderBg = (i) =>
  `hsl(${32 + (i % 6) * 20}, ${18 - (i % 3) * 3}%, ${88 + (i % 4) * 2}%)`;

/* ── product card ── */
const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const symbol = currencySymbol(product.price?.currency);
  const amount = product.price?.amount;
  const firstImage = product.images?.[0];

  return (
    <div
      className="bh-card"
      onClick={() => navigate(`/product/${product._id}`)}
      style={{
        background: '#fff', border: '1px solid #e8e2da',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* image */}
      <div style={{ height: '260px', overflow: 'hidden', position: 'relative', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {firstImage ? (
          <img
            className="bh-img-fade"
            src={firstImage}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        {/* image count badge */}
        {product.images?.length > 1 && (
          <span style={{
            position: 'absolute', bottom: '10px', right: '10px',
            fontSize: '9px', letterSpacing: '0.1em', background: 'rgba(0,0,0,0.55)',
            color: '#fff', padding: '3px 8px', borderRadius: '2px',
          }}>
            +{product.images.length - 1}
          </span>
        )}
      </div>

      {/* info */}
      <div style={{ padding: '16px 18px' }}>
        <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.03em', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.title}
        </p>
        {product.description && (
          <p style={{ fontSize: '10.5px', color: '#9b8f82', lineHeight: 1.5, marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '19px', color: '#a07850', fontWeight: 500 }}>
            {symbol}{amount?.toLocaleString()}
          </p>
          <button
            className="bh-wish"
            onClick={(e) => {
              e.stopPropagation();
              setWishlisted(v => !v);
            }}
            style={{
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: wishlisted ? '#1a1a1a' : '#f5f3f0',
              border: `1px solid ${wishlisted ? '#1a1a1a' : '#e8e2da'}`,
              cursor: 'pointer', borderRadius: '50%',
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={wishlisted ? '#fff' : 'none'}
              stroke={wishlisted ? '#fff' : '#9b8f82'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'fill 200ms, stroke 200ms' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── loading skeleton ── */
const Skeleton = () => (
  <div style={{ background: '#fff', border: '1px solid #e8e2da' }}>
    <div style={{ height: '260px', background: 'linear-gradient(90deg,#f0ece6 25%,#e8e2da 50%,#f0ece6 75%)', backgroundSize: '200% 100%', animation: 'bh-shimmer 1.4s linear infinite' }}/>
    <div style={{ padding: '16px 18px' }}>
      <div style={{ height: '12px', background: '#f0ece6', marginBottom: '8px', borderRadius: '2px', width: '70%' }}/>
      <div style={{ height: '10px', background: '#f0ece6', marginBottom: '4px', borderRadius: '2px', width: '90%' }}/>
      <div style={{ height: '10px', background: '#f0ece6', borderRadius: '2px', width: '60%' }}/>
    </div>
  </div>
);

const UserHomePage = () => {
  const navigate  = useNavigate();
  const user      = useSelector((s) => s.auth?.user);
  const products  = useSelector((s) => s.product?.getAllProducts || []);
  const loading   = useSelector((s) => s.product?.loading);
  const firstName = user?.firstName || 'Guest';

  const { handleGetAllProducts } = useProduct();
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { handleGetAllProducts(); }, []);

  /* filtered list */
  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );
  const visible = filtered.slice(0, visibleCount);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3f0', fontFamily: 'Montserrat, sans-serif', overflowX: 'hidden' }}>

      {/* ══ HERO ══ */}
      <section style={{
        position: 'relative', minHeight: '82vh', display: 'flex', alignItems: 'center',
        padding: '80px 5vw', overflow: 'hidden', background: '#faf9f7',
      }}>
        {/* grain */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: '-50%', width: '200%', height: '200%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          animation: 'bh-grain 8s steps(10) infinite', pointerEvents: 'none', zIndex: 0, opacity: 0.4,
        }}/>
        <div aria-hidden="true" style={{ position: 'absolute', top: '10%', right: '8%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(160,120,80,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'bh-float 7s ease-in-out infinite' }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#a07850', marginBottom: '20px', animation: 'bh-fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both' }}>
            Autumn / Winter 2026 — New Arrivals
          </p>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", Cormorant, Georgia, serif',
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 300, lineHeight: 1.08,
            color: '#1a1a1a', marginBottom: '24px',
            animation: 'bh-fade-up 700ms cubic-bezier(0.16,1,0.3,1) 220ms both',
          }}>
            Welcome back,<br />
            <em style={{ fontStyle: 'italic', color: '#a07850' }}>{firstName}.</em>
          </h1>
          <p style={{ fontSize: '14px', color: '#6b6057', lineHeight: 1.75, maxWidth: '440px', marginBottom: '40px', animation: 'bh-fade-up 700ms cubic-bezier(0.16,1,0.3,1) 340ms both' }}>
            {products.length > 0
              ? `${products.length} curated pieces waiting for you — from emerging designers to established labels.`
              : `Discover this season's finest pieces — curated for those who value craft and understated elegance.`}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', animation: 'bh-fade-up 700ms cubic-bezier(0.16,1,0.3,1) 460ms both' }}>
            <button className="bh-btn-primary"
              onClick={() => document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '13px 32px', background: '#a07850', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
              Shop Now
            </button>
            <button style={{ padding: '13px 32px', background: 'transparent', color: '#1a1a1a', border: '1px solid #c8bfb5', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', transition: 'border-color 200ms ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#c8bfb5'}>
              View Lookbook
            </button>
          </div>
        </div>

        {/* decorative vertical line */}
        <div style={{ position: 'absolute', right: '5vw', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.2 }} className="hidden lg:flex">
          <div style={{ width: '1px', height: '80px', background: '#1a1a1a' }}/>
          <p style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a1a1a', writingMode: 'vertical-rl' }}>Autumn Winter 2026</p>
          <div style={{ width: '1px', height: '80px', background: '#1a1a1a' }}/>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <Section style={{ borderTop: '1px solid #e8e2da', borderBottom: '1px solid #e8e2da', background: '#fff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: `${products.length || 0}`, label: 'Products', icon: '✦' },
            { value: 'Free',   label: 'Returns',  icon: '⟳' },
            { value: '4.9★',  label: 'Rated',    icon: '✧' },
            { value: '2–4d',  label: 'Delivery',  icon: '◇' },
          ].map((s, i, arr) => (
            <div key={i} className="bh-stat-card" style={{
              flex: '1 1 130px', minWidth: '110px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '26px 20px',
              borderRight: i < arr.length - 1 ? '1px solid #e8e2da' : 'none', cursor: 'default',
            }}>
              <span style={{ fontSize: '10px', color: '#a07850', marginBottom: '6px' }}>{s.icon}</span>
              <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '26px', fontWeight: 600, color: '#1a1a1a', lineHeight: 1, marginBottom: '4px' }}>{s.value}</p>
              <span style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9b8f82' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ CATEGORIES ══ */}
      <section style={{ padding: '72px 5vw 60px' }}>
        <Section>
          <div style={{ marginBottom: '36px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#a07850', marginBottom: '8px' }}>Explore</p>
            <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, color: '#1a1a1a' }}>
              Shop by Category
            </h2>
          </div>
        </Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {CATEGORIES.map((cat, i) => (
            <Section key={cat.label} delay={i * 70}>
              <div className="bh-category" style={{
                background: cat.bg, padding: '44px 24px', minHeight: '170px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <span style={{ fontSize: '18px', color: cat.accent, opacity: 0.7 }}>✦</span>
                <div>
                  <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '19px', fontWeight: 500, color: cat.color, marginBottom: '4px' }}>{cat.label}</p>
                  <p style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: cat.accent }}>Explore →</p>
                </div>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* ══ ALL PRODUCTS ══ */}
      <section id="all-products" style={{ padding: '0 5vw 80px' }}>
        <Section>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#a07850', marginBottom: '8px' }}>Live Catalogue</p>
              <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, color: '#1a1a1a' }}>
                All Products
                {!loading && products.length > 0 && (
                  <span style={{ fontSize: '14px', color: '#9b8f82', fontFamily: 'Montserrat, sans-serif', fontWeight: 400, marginLeft: '12px' }}>
                    ({products.length})
                  </span>
                )}
              </h2>
            </div>

            {/* search */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e8e2da', background: '#fff', padding: '0 14px', gap: '10px', maxWidth: '280px', width: '100%' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b8f82" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text" placeholder="Search products…" value={search}
                onChange={e => { setSearch(e.target.value); setVisibleCount(8); }}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '12px', padding: '12px 0', background: 'transparent', color: '#1a1a1a', fontFamily: 'Montserrat, sans-serif' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b8f82', lineHeight: 1 }}>✕</button>
              )}
            </div>
          </div>
        </Section>

        {/* grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '28px', color: '#9b8f82', fontWeight: 300, marginBottom: '8px' }}>
              {search ? 'No results found' : 'No products yet'}
            </p>
            <p style={{ fontSize: '12px', color: '#b0a898' }}>
              {search ? `Try a different search term` : 'Check back soon for new arrivals.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {visible.map((product, i) => (
                <Section key={product._id} delay={i % 4 * 70}>
                  <ProductCard product={product} index={i} />
                </Section>
              ))}
            </div>

            {/* load more */}
            {visibleCount < filtered.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
                <button
                  className="bh-btn-primary"
                  onClick={() => setVisibleCount(v => v + 8)}
                  style={{ padding: '13px 40px', background: '#a07850', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
                >
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ══ EMAIL BANNER ══ */}
      <Section>
        <section style={{ margin: '0 5vw 80px', background: '#1a1a1a', padding: 'clamp(48px, 8vw, 72px) 5vw', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '28px' }}>
          <div>
            <p style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#a07850', marginBottom: '12px' }}>Members Only</p>
            <h3 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 300, color: '#f5f3f0', lineHeight: 1.2, maxWidth: '400px' }}>
              Get early access to new collections & exclusive offers.
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 0, maxWidth: '420px', width: '100%' }}>
            <input type="email" placeholder="Your email address" style={{ flex: 1, minWidth: '160px', padding: '13px 16px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#f5f3f0', fontSize: '12px', fontFamily: 'Montserrat, sans-serif', outline: 'none' }} />
            <button className="bh-btn-primary" style={{ padding: '13px 22px', background: '#a07850', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </div>
        </section>
      </Section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid #e8e2da', padding: '28px 5vw', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: '#fff' }}>
        <p style={{ fontWeight: 700, letterSpacing: '0.35em', fontSize: '13px', color: '#1a1a1a' }}>CLOTHINGG</p>
        <p style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#9b8f82', textTransform: 'uppercase' }}>
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default UserHomePage;