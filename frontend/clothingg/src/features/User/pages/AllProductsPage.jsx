import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../../products/hooks/useProduct';

/* ── styles injected once ── */
const injectStyles = () => {
  if (document.getElementById('ap-styles')) return;
  const s = document.createElement('style');
  s.id = 'ap-styles';
  s.textContent = `
    @keyframes ap-fade-up {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes ap-shimmer {
      0%   { background-position:-300% center; }
      100% { background-position: 300% center; }
    }
    @keyframes ap-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
    .ap-card { transition: transform 300ms cubic-bezier(.16,1,.3,1), box-shadow 300ms ease; }
    .ap-card:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,.13)!important; }
    .ap-card:hover .ap-img { transform:scale(1.05); }
    .ap-img { transition:transform 420ms cubic-bezier(.16,1,.3,1); }
    .ap-wish:hover { background:#1a1a1a!important; border-color:#1a1a1a!important; }
    .ap-sort-btn.active { background:#1a1a1a; color:#fff; }
    .ap-sort-btn { transition:background 180ms ease,color 180ms ease; }
    .ap-chip.active { background:#1a1a1a!important; color:#fff!important; border-color:#1a1a1a!important; }
    .ap-chip { transition:background 180ms ease,color 180ms ease,border-color 180ms ease; }
    .ap-recent-card:hover .ap-recent-img { transform:scale(1.06); }
    .ap-recent-img { transition:transform 420ms cubic-bezier(.16,1,.3,1); }
  `;
  document.head.appendChild(s);
};

/* ── helpers ── */
const sym = (c) => c === 'USD' ? '$' : '₹';
const placeholder = (i) => `hsl(${32+(i%6)*18},${16-(i%3)*2}%,${88+(i%4)*2}%)`;

const isRecent = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return (now - d) < 7 * 24 * 60 * 60 * 1000; // within 7 days
};

/* ── Skeleton ── */
const Skeleton = () => (
  <div style={{ background:'#fff', border:'1px solid #e8e2da', borderRadius:'2px' }}>
    <div style={{ height:'240px', background:'linear-gradient(90deg,#f0ece6 25%,#e8e2da 50%,#f0ece6 75%)', backgroundSize:'200% 100%', animation:'ap-shimmer 1.4s linear infinite' }}/>
    <div style={{ padding:'16px 18px' }}>
      {[70,90,55].map((w,i) => (
        <div key={i} style={{ height:'10px', background:'#f0ece6', borderRadius:'2px', width:`${w}%`, marginBottom:'8px', animation:'ap-shimmer 1.4s linear infinite', backgroundSize:'200% 100%' }}/>
      ))}
    </div>
  </div>
);

/* ── Product Card ── */
const ProductCard = ({ product, index, showNewBadge }) => {
  const [wished, setWished] = useState(false);
  const img = product.images?.[0];
  const price = product.price;

  return (
    <div className="ap-card" style={{ background:'#fff', border:'1px solid #e8e2da', overflow:'hidden', position:'relative' }}>
      {/* NEW badge */}
      {showNewBadge && (
        <span style={{ position:'absolute', top:'12px', left:'12px', zIndex:2, fontSize:'8px', letterSpacing:'0.22em', textTransform:'uppercase', background:'#a07850', color:'#fff', padding:'4px 9px' }}>
          NEW
        </span>
      )}
      {/* extra images badge */}
      {product.images?.length > 1 && (
        <span style={{ position:'absolute', top:'12px', right:'12px', zIndex:2, fontSize:'9px', background:'rgba(0,0,0,0.5)', color:'#fff', padding:'3px 8px', borderRadius:'2px' }}>
          +{product.images.length - 1}
        </span>
      )}

      {/* image */}
      <div style={{ height:'240px', overflow:'hidden', background: placeholder(index) }}>
        {img
          ? <img className="ap-img" src={img} alt={product.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e => e.currentTarget.style.display='none'}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
        }
      </div>

      {/* info */}
      <div style={{ padding:'15px 18px' }}>
        <p style={{ fontSize:'12.5px', fontWeight:600, color:'#1a1a1a', letterSpacing:'0.03em', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {product.title}
        </p>
        {product.description && (
          <p style={{ fontSize:'10.5px', color:'#9b8f82', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', marginBottom:'10px' }}>
            {product.description}
          </p>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'8px' }}>
          <p style={{ fontFamily:'"Cormorant Garamond",Georgia,serif', fontSize:'19px', color:'#a07850', fontWeight:500 }}>
            {sym(price?.currency)}{price?.amount?.toLocaleString()}
          </p>
          <button className="ap-wish" onClick={() => setWished(v => !v)} style={{
            width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center',
            background: wished ? '#1a1a1a' : '#f5f3f0',
            border:`1px solid ${wished ? '#1a1a1a' : '#e8e2da'}`,
            cursor:'pointer', borderRadius:'50%', transition:'background 200ms,border-color 200ms',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={wished ? '#fff' : 'none'} stroke={wished ? '#fff' : '#9b8f82'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition:'fill 200ms,stroke 200ms' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
const SORT_OPTIONS = [
  { key: 'newest',    label: 'Newest' },
  { key: 'oldest',   label: 'Oldest' },
  { key: 'price_asc',  label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
];

const PRICE_RANGES = [
  { label: 'All',       min: 0,    max: Infinity },
  { label: 'Under ₹1k', min: 0,    max: 1000 },
  { label: '₹1k–₹5k',  min: 1000, max: 5000 },
  { label: '₹5k–₹10k', min: 5000, max: 10000 },
  { label: 'Above ₹10k',min: 10000,max: Infinity },
];

const AllProductsPage = () => {
  const products = useSelector(s => s.product?.getAllProducts || []);
  const loading  = useSelector(s => s.product?.loading);
  const { handleGetAllProducts } = useProduct();

  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState('newest');
  const [priceIdx,  setPriceIdx]  = useState(0);
  const [visible,   setVisible]   = useState(12);
  const [view,      setView]      = useState('grid'); // 'grid' | 'list'
  const searchRef = useRef(null);

  useEffect(() => { injectStyles(); handleGetAllProducts(); }, []);

  /* ── recent: last 4 items by createdAt (or last 4 if no date) ── */
  const recent = useMemo(() => {
    const sorted = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted.slice(0, 4);
  }, [products]);

  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceIdx];
    let list = products.filter(p => {
      const amt = p.price?.amount || 0;
      const matchSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchPrice  = amt >= range.min && amt < range.max;
      return matchSearch && matchPrice;
    });

    if (sort === 'newest')     list = [...list].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'oldest')     list = [...list].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'price_asc')  list = [...list].sort((a,b) => (a.price?.amount||0) - (b.price?.amount||0));
    if (sort === 'price_desc') list = [...list].sort((a,b) => (b.price?.amount||0) - (a.price?.amount||0));
    return list;
  }, [products, search, sort, priceIdx]);

  const recentIds = new Set(recent.map(p => p._id));

  return (
    <div style={{ minHeight:'100vh', background:'#f5f3f0', fontFamily:'Montserrat,sans-serif', paddingBottom:'80px' }}>

      {/* ══ PAGE HEADER ══ */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e8e2da', padding:'40px 5vw 36px' }}>
        <p style={{ fontSize:'9px', letterSpacing:'0.35em', textTransform:'uppercase', color:'#a07850', marginBottom:'10px', animation:'ap-fade-up 600ms both' }}>
          Catalogue
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:'20px' }}>
          <h1 style={{ fontFamily:'"Cormorant Garamond",Georgia,serif', fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:300, color:'#1a1a1a', letterSpacing:'-0.01em', animation:'ap-fade-up 600ms 80ms both' }}>
            All Products
            {!loading && (
              <span style={{ fontSize:'14px', fontFamily:'Montserrat,sans-serif', fontWeight:400, color:'#9b8f82', marginLeft:'14px' }}>
                ({products.length})
              </span>
            )}
          </h1>

          {/* search bar */}
          <div style={{ display:'flex', alignItems:'center', border:'1px solid #e8e2da', background:'#faf9f7', padding:'0 14px', gap:'10px', width:'clamp(220px,35%,360px)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b8f82" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisible(12); }}
              style={{ flex:1, border:'none', outline:'none', fontSize:'12px', padding:'12px 0', background:'transparent', color:'#1a1a1a', fontFamily:'Montserrat,sans-serif' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#9b8f82', fontSize:'13px', lineHeight:1, padding:0 }}>✕</button>
            )}
          </div>
        </div>

        {/* ── filters row ── */}
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'10px', marginTop:'24px' }}>
          {/* sort */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.key} className={`ap-sort-btn${sort===opt.key?' active':''}`}
                onClick={() => setSort(opt.key)}
                style={{ padding:'7px 14px', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', border:'1px solid #e8e2da', background: sort===opt.key ? '#1a1a1a' : '#fff', color: sort===opt.key ? '#fff' : '#1a1a1a', cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* divider */}
          <div style={{ width:'1px', height:'24px', background:'#e8e2da' }}/>

          {/* price chips */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {PRICE_RANGES.map((r, i) => (
              <button key={i} className={`ap-chip${priceIdx===i?' active':''}`}
                onClick={() => { setPriceIdx(i); setVisible(12); }}
                style={{ padding:'7px 14px', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', border:'1px solid #e8e2da', background: priceIdx===i ? '#1a1a1a' : '#fff', color: priceIdx===i ? '#fff' : '#6b6057', cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* view toggle */}
          <div style={{ marginLeft:'auto', display:'flex', gap:'4px' }}>
            {[['grid','M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z'], ['list','M3 12h18 M3 6h18 M3 18h18']].map(([v, d]) => (
              <button key={v} onClick={() => setView(v)} style={{ width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${view===v?'#1a1a1a':'#e8e2da'}`, background: view===v?'#1a1a1a':'#fff', cursor:'pointer', transition:'all 180ms ease' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={view===v?'#fff':'#9b8f82'} strokeWidth="2" strokeLinecap="round"><path d={d}/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'0 5vw' }}>

        {/* ══ RECENTLY ADDED ══ */}
        {!loading && recent.length > 0 && !search && (
          <div style={{ marginTop:'48px', marginBottom:'48px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' }}>
              <div>
                <p style={{ fontSize:'9px', letterSpacing:'0.32em', textTransform:'uppercase', color:'#a07850', marginBottom:'4px' }}>Just In</p>
                <h2 style={{ fontFamily:'"Cormorant Garamond",Georgia,serif', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:300, color:'#1a1a1a' }}>
                  Recently Added
                </h2>
              </div>
              <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'#a07850', background:'rgba(160,120,80,0.08)', padding:'5px 10px', border:'1px solid rgba(160,120,80,0.2)', marginLeft:'4px' }}>
                <span style={{ display:'inline-block', width:'6px', height:'6px', borderRadius:'50%', background:'#a07850', animation:'ap-pulse 1.5s ease-in-out infinite' }}/>
                Live
              </span>
            </div>

            {/* horizontal recent strip */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'16px' }}>
              {recent.map((product, i) => (
                <div key={product._id} className="ap-card" style={{ background:'#fff', border:'1px solid #e8e2da', overflow:'hidden', position:'relative', cursor:'pointer' }}>
                  {/* "NEW" ribbon */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#a07850,#c8a882)' }}/>
                  <div style={{ height:'180px', overflow:'hidden', background: placeholder(i) }}>
                    {product.images?.[0]
                      ? <img className="ap-recent-img" src={product.images[0]} alt={product.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e => e.currentTarget.style.display='none'}/>
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                    }
                  </div>
                  <div style={{ padding:'13px 16px' }}>
                    <p style={{ fontSize:'11.5px', fontWeight:600, color:'#1a1a1a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'4px' }}>{product.title}</p>
                    <p style={{ fontFamily:'"Cormorant Garamond",Georgia,serif', fontSize:'16px', color:'#a07850', fontWeight:500 }}>
                      {sym(product.price?.currency)}{product.price?.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ DIVIDER ══ */}
        {!search && recent.length > 0 && !loading && (
          <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'40px' }}>
            <div style={{ flex:1, height:'1px', background:'#e8e2da' }}/>
            <p style={{ fontSize:'9px', letterSpacing:'0.28em', textTransform:'uppercase', color:'#9b8f82', whiteSpace:'nowrap' }}>Full Catalogue</p>
            <div style={{ flex:1, height:'1px', background:'#e8e2da' }}/>
          </div>
        )}

        {/* ══ PRODUCT GRID / LIST ══ */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns: view==='list' ? '1fr' : 'repeat(auto-fill,minmax(220px,1fr))', gap:'18px' }}>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <p style={{ fontFamily:'"Cormorant Garamond",Georgia,serif', fontSize:'28px', color:'#9b8f82', fontWeight:300, marginBottom:'8px' }}>
              {search ? 'No results found' : 'No products available'}
            </p>
            <p style={{ fontSize:'12px', color:'#b0a898' }}>
              {search ? `Try a different search term` : 'Check back soon for new arrivals.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} style={{ marginTop:'20px', padding:'10px 24px', background:'transparent', border:'1px solid #c8bfb5', fontSize:'11px', letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer', fontFamily:'Montserrat,sans-serif', color:'#1a1a1a', transition:'border-color 200ms ease' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#1a1a1a'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#c8bfb5'}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* result count */}
            <p style={{ fontSize:'10px', color:'#9b8f82', letterSpacing:'0.12em', marginBottom:'20px' }}>
              Showing <strong style={{ color:'#1a1a1a' }}>{Math.min(visible, filtered.length)}</strong> of <strong style={{ color:'#1a1a1a' }}>{filtered.length}</strong> products
            </p>

            {view === 'grid' ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'18px' }}>
                {filtered.slice(0, visible).map((product, i) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={i}
                    showNewBadge={recentIds.has(product._id)}
                  />
                ))}
              </div>
            ) : (
              /* list view */
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {filtered.slice(0, visible).map((product, i) => (
                  <div key={product._id} className="ap-card" style={{ background:'#fff', border:'1px solid #e8e2da', display:'flex', alignItems:'center', gap:'0', overflow:'hidden', cursor:'pointer', position:'relative' }}>
                    {recentIds.has(product._id) && (
                      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(180deg,#a07850,#c8a882)' }}/>
                    )}
                    <div style={{ width:'100px', minWidth:'100px', height:'90px', background: placeholder(i), overflow:'hidden', flexShrink:0 }}>
                      {product.images?.[0] && <img className="ap-img" src={product.images[0]} alt={product.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.currentTarget.style.display='none'}/>}
                    </div>
                    <div style={{ flex:1, padding:'14px 20px', minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:'13px', fontWeight:600, color:'#1a1a1a', letterSpacing:'0.03em', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.title}</p>
                          {product.description && <p style={{ fontSize:'11px', color:'#9b8f82', lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.description}</p>}
                        </div>
                        <p style={{ fontFamily:'"Cormorant Garamond",Georgia,serif', fontSize:'20px', color:'#a07850', fontWeight:500, whiteSpace:'nowrap', flexShrink:0 }}>
                          {sym(product.price?.currency)}{product.price?.amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* load more */}
            {visible < filtered.length && (
              <div style={{ display:'flex', justifyContent:'center', marginTop:'48px' }}>
                <button onClick={() => setVisible(v => v + 12)} style={{
                  padding:'13px 44px', background:'transparent', color:'#1a1a1a',
                  border:'1px solid #c8bfb5', cursor:'pointer', fontSize:'11px',
                  letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Montserrat,sans-serif',
                  transition:'border-color 200ms ease, background 200ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='#1a1a1a'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#1a1a1a'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#1a1a1a'; e.currentTarget.style.borderColor='#c8bfb5'; }}>
                  Load More · {filtered.length - visible} remaining
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;
