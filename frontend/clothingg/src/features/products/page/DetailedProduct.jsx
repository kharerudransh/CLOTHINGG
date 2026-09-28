import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import toast from 'react-hot-toast';

/* ── Currency Symbol Helper ── */
const getCurrencySymbol = (currency) => (currency === 'USD' ? '$' : '₹');

/* ── Format Price ── */
const formatPrice = (priceObj) => {
  if (!priceObj) return '—';
  const { amount, currency } = priceObj;
  const sym = getCurrencySymbol(currency);
  const formatted = Number(amount || 0).toLocaleString(
    currency === 'USD' ? 'en-US' : 'en-IN',
    { minimumFractionDigits: 0, maximumFractionDigits: 2 }
  );
  return `${sym} ${formatted}`;
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const DetailedProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleGetDetailedProduct, handleDeleteProduct, handleGetAllProducts } = useProduct();

  const currentUser = useSelector((state) => state.auth?.user);
  const allProducts = useSelector((state) => state.product?.getAllProducts || []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [fitMode, setFitMode] = useState('contain'); // 'contain' so images show full garment without default zoom/cropping

  // Purchase/Selection states
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToBag, setIsAddedToBag] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'care' | 'shipping' | 'authenticity'
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Shipping estimator
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Delete modal state for seller
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check roles & ownership
  const isSeller = currentUser?.role === 'Seller';
  const isBuyer = currentUser?.role === 'Buyer';
  
  const isOwner = useMemo(() => {
    if (!currentUser || !product?.seller) return false;
    if (typeof product.seller === 'string') {
      return product.seller === currentUser._id;
    }
    if (typeof product.seller === 'object' && product.seller._id) {
      return product.seller._id === currentUser._id;
    }
    return false;
  }, [currentUser, product]);

  // Pre-fill delivery pincode if user has address saved
  useEffect(() => {
    if (currentUser?.address?.pincode) {
      setPincode(String(currentUser.address.pincode));
    }
  }, [currentUser]);

  // Fetch detailed product
  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const data = await handleGetDetailedProduct(productId);
        if (isMounted) {
          if (data) {
            setProduct(data);
            setActiveImageIndex(0);
          } else {
            setError('Product not found or has been removed by the seller.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to retrieve product details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Load other products for "You May Also Like"
  useEffect(() => {
    if (allProducts.length === 0) {
      handleGetAllProducts();
    }
  }, []);

  // Filter recommendations (excluding current product)
  const recommendations = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return allProducts
      .filter((p) => p._id !== productId)
      .slice(0, 4);
  }, [allProducts, productId]);

  // Image Zoom on Hover
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Back navigation helper
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (isSeller) {
      navigate('/see-products');
    } else {
      navigate('/buyer-products');
    }
  };

  // Share link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  // Add to Bag handler
  const handleAddToBag = () => {
    setIsAddedToBag(true);
    toast.success(`Added ${product?.title} (Size ${selectedSize}) to your bag!`, {
      style: {
        background: '#1a1a1a',
        color: '#f5f3f0',
        border: '1px solid #c8a882',
        fontSize: '12.5px',
      },
      icon: '🛍️',
    });
    setTimeout(() => setIsAddedToBag(false), 2400);
  };

  // Wishlist toggle
  const handleToggleWishlist = () => {
    setIsWishlisted((prev) => {
      const next = !prev;
      if (next) {
        toast.success('Saved to your private Wishlist', {
          style: { background: '#1a1a1a', color: '#fff', fontSize: '12px' },
        });
      }
      return next;
    });
  };

  // Check pincode delivery
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length < 5) {
      toast.error('Please enter a valid postal code');
      return;
    }
    const days = Math.floor(Math.random() * 2) + 2; // 2-4 days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    const dateFormatted = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    setPincodeStatus({
      available: true,
      text: `Complimentary Express Insured Delivery by ${dateFormatted}`,
      city: currentUser?.address?.city || 'Your Area',
    });
  };

  // Seller Delete Handler
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await handleDeleteProduct(product._id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Images array fallback
  const images = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    return ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&fit=crop'];
  }, [product]);

  const activeImage = images[activeImageIndex] || images[0];

  /* ══════════════════════════════════════════
     LOADING STATE (LUXURY SKELETON)
  ══════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] font-[Montserrat] text-[#1a1a1a]">
        {/* Top bar skeleton */}
        <div className="h-16 border-b border-[#e8e2da] bg-white flex items-center justify-between px-6 sm:px-12 animate-pulse">
          <div className="w-28 h-4 bg-[#e8e2da] rounded" />
          <div className="w-32 h-5 bg-[#e8e2da] rounded" />
          <div className="w-20 h-4 bg-[#e8e2da] rounded" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Gallery Skeleton */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
              <div className="hidden sm:flex flex-col gap-3 w-20 shrink-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-[#e8e2da] animate-pulse" />
                ))}
              </div>
              <div className="flex-1 aspect-[3/4] bg-[#e8e2da] animate-pulse" />
            </div>

            {/* Info Skeleton */}
            <div className="lg:col-span-5 space-y-6">
              <div className="w-24 h-3 bg-[#e8e2da] rounded" />
              <div className="w-3/4 h-8 bg-[#e8e2da] rounded" />
              <div className="w-32 h-6 bg-[#e8e2da] rounded" />
              <div className="w-full h-24 bg-[#e8e2da] rounded" />
              <div className="w-full h-12 bg-[#e8e2da] rounded" />
              <div className="w-full h-12 bg-[#e8e2da] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     ERROR STATE
  ══════════════════════════════════════════ */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] font-[Montserrat] flex flex-col justify-center items-center px-4 text-center">
        <div className="max-w-md bg-white border border-[#e8e2da] p-10 sm:p-14 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#f5f3f0] border border-[#e8e2da] flex items-center justify-center text-[#a07850]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="font-[Cormorant_Garamond] text-3xl font-medium text-[#1a1a1a] mb-2">
            Piece Not Found
          </h2>
          <p className="text-xs text-[#7a7269] leading-relaxed mb-6">
            {error || "The requested item could not be retrieved from the atelier collection. It may have been archived or removed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-[#1a1a1a] text-[#c8a882] text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#a07850] hover:text-white transition-colors cursor-pointer"
            >
              Go Back
            </button>
            <Link
              to={isSeller ? '/see-products' : '/buyer-products'}
              className="px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1a1a1a] hover:text-white transition-colors text-center"
            >
              Browse Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MAIN COMPONENT VIEW
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f5f3f0] font-[Montserrat] text-[#1a1a1a] selection:bg-[#a07850] selection:text-white">
      
      {/* ── TOP LUXURY NAVIGATION HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e2da] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          
          {/* Back Action & Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1a1a1a] hover:text-[#a07850] transition-colors py-2 cursor-pointer group"
              title="Return to previous page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform group-hover:-translate-x-1 transition-transform"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>

            <span className="hidden md:inline text-[#e8e2da]">|</span>

            <nav className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#9b8f82]">
              <Link to="/" className="hover:text-[#1a1a1a] transition-colors">Atelier</Link>
              <span>/</span>
              <Link
                to={isSeller ? '/see-products' : '/buyer-products'}
                className="hover:text-[#1a1a1a] transition-colors"
              >
                Catalogue
              </Link>
              <span>/</span>
              <span className="text-[#1a1a1a] truncate max-w-[200px]">{product.title}</span>
            </nav>
          </div>

          {/* Centered Brand Mark */}
          <Link
            to={isSeller ? '/seller-home' : '/buyer-home'}
            className="font-[Cormorant_Garamond] text-2xl tracking-[0.22em] font-medium text-[#1a1a1a] hover:text-[#a07850] transition-colors"
          >
            CLOTHINGG
          </Link>

          {/* Right Action Icons / Badges */}
          <div className="flex items-center gap-3">
            {/* Share button */}
            <button
              onClick={handleShare}
              title="Share piece"
              className="w-9 h-9 rounded-full border border-[#e8e2da] bg-white flex items-center justify-center text-[#7a7269] hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>

            {/* If seller owns this product, direct link to see-products */}
            {isOwner ? (
              <Link
                to="/see-products"
                className="px-3 py-1.5 bg-[#1a1a1a] text-[#c8a882] text-[10px] font-bold tracking-widest uppercase hover:bg-[#a07850] hover:text-white transition-colors"
              >
                My Inventory
              </Link>
            ) : (
              <button
                onClick={handleToggleWishlist}
                title="Save to Wishlist"
                className={`w-9 h-9 rounded-full border transition-colors flex items-center justify-center cursor-pointer ${
                  isWishlisted
                    ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white'
                    : 'border-[#e8e2da] bg-white text-[#7a7269] hover:text-[#1a1a1a] hover:border-[#1a1a1a]'
                }`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill={isWishlisted ? '#c8a882' : 'none'}
                  stroke={isWishlisted ? '#c8a882' : 'currentColor'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── SELLER MANAGEMENT STRIP (Only visible to product owner / seller) ── */}
      {isOwner && (
        <div className="bg-[#1a1a1a] text-[#c8a882] border-b border-[#c8a882]/30 px-4 sm:px-8 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                You are viewing your active listing
              </span>
              <span className="text-[#9b8f82] hidden md:inline">
                · ID: {product._id?.slice(-8)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/see-products"
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Manage in Catalogue
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1 bg-red-950/80 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Delete Piece
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ════════════════════════════════════════
              LEFT COLUMN: LUXURY INTERACTIVE GALLERY
          ════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 sticky lg:top-24">
            
            {/* Thumbnail Strip (Left side on desktop, bottom on mobile) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] pb-2 sm:pb-0 scrollbar-none shrink-0">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 sm:w-20 h-20 sm:h-24 bg-[#faf8f5] overflow-hidden border transition-all cursor-pointer flex items-center justify-center p-1 ${
                      activeImageIndex === idx
                        ? 'border-[#1a1a1a] ring-2 ring-[#c8a882] scale-[1.02]'
                        : 'border-[#e8e2da] opacity-75 hover:opacity-100 hover:border-[#9b8f82]'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.title} thumb ${idx + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                    {activeImageIndex === idx && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#a07850]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Display Image */}
            <div className="flex-1 relative bg-[#ffffff] overflow-hidden border border-[#e8e2da] shadow-xs group">
              
              {/* Image Viewport with Hover Zoom */}
              <div
                className="relative w-full h-[440px] sm:h-[520px] lg:h-[580px] bg-[#faf8f5] flex items-center justify-center overflow-hidden cursor-crosshair"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={activeImage}
                  alt={product.title}
                  className={`transition-transform duration-200 ${
                    fitMode === 'cover'
                      ? 'w-full h-full object-cover'
                      : 'w-full h-full object-contain p-4 sm:p-6'
                  }`}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZoomed ? 'scale(1.35)' : 'scale(1)',
                  }}
                  loading="eager"
                />

                {/* Badges on Main Image */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                  <span className="px-3 py-1 bg-[#1a1a1a]/90 text-[#c8a882] text-[10px] font-bold tracking-widest uppercase backdrop-blur-xs border border-[#c8a882]/40">
                    {product.price?.currency || 'INR'}
                  </span>
                  <span className="px-3 py-0.5 bg-white/95 text-[#1a1a1a] text-[9px] font-semibold tracking-wider uppercase border border-[#e8e2da] shadow-2xs">
                    Artisanal Piece
                  </span>
                </div>

                {/* Fit Mode Toggle & Lightbox Buttons */}
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFitMode((m) => (m === 'contain' ? 'cover' : 'contain'));
                    }}
                    className="px-2.5 py-1.5 bg-black/75 hover:bg-black text-white text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm transition-colors cursor-pointer border border-white/20 flex items-center gap-1.5"
                    title={fitMode === 'contain' ? 'Switch to Fill View' : 'Switch to Uncropped Fit View'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 3v18" />
                    </svg>
                    <span>{fitMode === 'contain' ? 'Fit View' : 'Fill View'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="p-2 bg-black/75 hover:bg-black text-white text-xs backdrop-blur-sm transition-colors cursor-pointer border border-white/20"
                    title="Expand fullscreen lightbox"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>

                {/* Photo indicator */}
                <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 bg-black/60 text-white text-[10px] tracking-widest font-mono backdrop-blur-xs pointer-events-none">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Hover Zoom Prompt */}
              <div className="hidden sm:flex items-center justify-center gap-2 py-2.5 bg-[#fbf9f7] border-t border-[#e8e2da] text-[10px] tracking-wider uppercase text-[#9b8f82]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span>Hover to magnify details · Click for fullscreen</span>
              </div>
            </div>

          </div>


          {/* ════════════════════════════════════════
              RIGHT COLUMN: PRODUCT DETAILS & COMMERCE
          ════════════════════════════════════════ */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Atelier / Collection Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2da]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a07850]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a07850]">
                  Haute Couture · Collection 2026
                </span>
              </div>
              <span className="text-[10.5px] uppercase tracking-wider text-emerald-800 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                In Stock & Ready
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="font-[Cormorant_Garamond] text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#1a1a1a] leading-[1.15] mb-3">
                {product.title}
              </h1>

              {/* Price & Currency Display */}
              <div className="flex items-baseline gap-3">
                <span className="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-medium text-[#1a1a1a]">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#9b8f82]">
                  Inclusive of all artisanal luxury taxes
                </span>
              </div>
            </div>

            {/* Description Summary */}
            <div className="bg-white border border-[#e8e2da] p-5 sm:p-6 shadow-2xs">
              <p className="text-xs sm:text-[13px] text-[#554d45] leading-relaxed whitespace-pre-line font-light">
                {product.description}
              </p>
            </div>

            {/* ── BUYER CONTROLS & SELECTION (Only when not seller-only preview) ── */}
            <div className="space-y-6 pt-2">
              
              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1a1a1a]">
                    Select Size: <strong className="text-[#a07850]">{selectedSize}</strong>
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[10.5px] text-[#a07850] hover:text-[#1a1a1a] underline uppercase tracking-wider cursor-pointer font-medium"
                  >
                    Size Guide & Fit
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 border text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-xs'
                          : 'bg-white border-[#e8e2da] text-[#1a1a1a] hover:border-[#1a1a1a]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between py-2 border-y border-[#e8e2da]">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1a1a1a]">
                  Quantity
                </span>
                <div className="flex items-center border border-[#e8e2da] bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-sm font-semibold hover:bg-[#f5f3f0] disabled:opacity-30 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    className="w-10 h-10 flex items-center justify-center text-sm font-semibold hover:bg-[#f5f3f0] disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToBag}
                  className={`flex-1 py-4 px-6 text-xs font-bold uppercase tracking-[0.22em] transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
                    isAddedToBag
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#1a1a1a] text-[#c8a882] hover:bg-[#a07850] hover:text-white shadow-md'
                  }`}
                >
                  {isAddedToBag ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Piece Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>Add to Shopping Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`px-5 py-4 border transition-colors flex items-center justify-center cursor-pointer ${
                    isWishlisted
                      ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#c8a882]'
                      : 'border-[#1a1a1a] bg-transparent text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#c8a882]'
                  }`}
                  title="Save to Wishlist"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill={isWishlisted ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Express Checkout Button */}
              <button
                onClick={() => {
                  toast('Proceeding to instant secured checkout…', {
                    icon: '🔒',
                    style: { background: '#1a1a1a', color: '#c8a882' },
                  });
                }}
                className="w-full py-3.5 border border-[#a07850] bg-transparent text-[#a07850] hover:bg-[#a07850] hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
              >
                Instant Buy with Express Checkout
              </button>

            </div>

            {/* ── ESTIMATED DELIVERY & POSTAL CHECKER ── */}
            <div className="bg-white border border-[#e8e2da] p-4 sm:p-5 mt-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1a1a1a] mb-2 flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a07850" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Delivery & Availability
              </p>
              
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter postal pincode (e.g. 110001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={10}
                  className="flex-1 bg-[#f5f3f0] border border-[#e8e2da] px-3 py-2 text-xs text-[#1a1a1a] placeholder:text-[#9b8f82] focus:outline-none focus:border-[#1a1a1a]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#a07850] transition-colors cursor-pointer shrink-0"
                >
                  Check
                </button>
              </form>

              {pincodeStatus && (
                <div className="mt-3 pt-3 border-t border-[#f5f3f0] flex items-center gap-2 text-xs text-emerald-800">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{pincodeStatus.text}</span>
                </div>
              )}
            </div>

            {/* ── ATELIER / SELLER PROFILE CARD ── */}
            <div className="bg-[#fbf9f7] border border-[#e8e2da] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] text-[#c8a882] flex items-center justify-center font-[Cormorant_Garamond] text-xl font-bold border border-[#c8a882]/40 shrink-0">
                  {product.seller?.firstName ? product.seller.firstName[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b8f82]">
                    Curated Atelier
                  </p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {product.seller?.firstName
                      ? `${product.seller.firstName} ${product.seller.lastName || ''}`
                      : 'Verified Independent Designer'}
                  </p>
                  <p className="text-[10.5px] text-[#7a7269]">
                    100% Certified Authentic · Official Clothingg Atelier
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-block px-3 py-1 bg-white border border-[#e8e2da] text-[9.5px] font-bold uppercase tracking-widest text-[#a07850]">
                Verified
              </span>
            </div>

            {/* ── LUXURY ACCORDION TABS ── */}
            <div className="border-t border-[#e8e2da] pt-4">
              <div className="flex border-b border-[#e8e2da]">
                {[
                  { key: 'details', label: 'Story & Fit' },
                  { key: 'care', label: 'Care & Fabric' },
                  { key: 'shipping', label: 'Insured Shipping' },
                  { key: 'authenticity', label: 'Guarantee' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-3 px-3 text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                      activeTab === tab.key
                        ? 'border-[#a07850] text-[#1a1a1a]'
                        : 'border-transparent text-[#9b8f82] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="py-4 text-xs text-[#554d45] leading-relaxed">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <p>
                      Each garment from Clothingg is engineered with tailored precision, blending traditional craftsmanship with avant-garde silhouettes. Designed for effortless elegance and timeless allure.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-[#7a7269]">
                      <li>Bespoke structural fit tailored for modern comfort</li>
                      <li>Hand-inspected before shipment from the artisan workshop</li>
                      <li>Complimentary garment dust bag and branded hangers included</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-[#1a1a1a]">Care & Preservation Instructions:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[#7a7269]">
                      <li>Professional specialist dry clean only</li>
                      <li>Do not tumble dry; steam at gentle temperatures</li>
                      <li>Store in provided breathable garment dust bag</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>
                      Every order is shipped via priority insured courier with real-time tracking and signature upon delivery.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-[#7a7269]">
                      <li>Complimentary express delivery on all orders</li>
                      <li>Dispatched within 24 to 48 hours</li>
                      <li>14-day discretionary luxury exchange policy</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'authenticity' && (
                  <div className="space-y-2">
                    <p>
                      This piece is accompanied by a unique atelier certificate verifying its provenance, fabric source, and genuine exclusivity.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>


        {/* ════════════════════════════════════════
            CURATED RECOMMENDATIONS STRIP
        ════════════════════════════════════════ */}
        {recommendations.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#e8e2da]">
            <div className="text-center mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a07850] mb-2">
                Curated Recommendations
              </p>
              <h2 className="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-normal text-[#1a1a1a]">
                More Pieces You May Admire
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((item) => {
                const cover = item.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&fit=crop';
                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      navigate(`/product/${item._id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white border border-[#e8e2da] overflow-hidden hover:border-[#1a1a1a] transition-all duration-300 flex flex-col cursor-pointer shadow-2xs hover:shadow-md"
                  >
                    <div className="relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden">
                      <img
                        src={cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#1a1a1a]/85 text-[#c8a882] text-[9px] font-bold uppercase tracking-widest backdrop-blur-xs">
                        {item.price?.currency || 'INR'}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-[Cormorant_Garamond] text-lg font-medium text-[#1a1a1a] line-clamp-1 group-hover:text-[#a07850] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#7a7269] line-clamp-1 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#f5f3f0] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1a1a1a]">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#a07850] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          View Piece →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>


      {/* ════════════════════════════════════════
          FULLSCREEN LIGHTBOX MODAL
      ════════════════════════════════════════ */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer text-lg"
          >
            ✕
          </button>

          {/* Previous / Next Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer"
              >
                ›
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={product.title}
              className="max-h-[75vh] max-w-full object-contain shadow-2xl"
            />
            <div className="mt-4 flex items-center gap-2 text-white/80 text-xs font-mono">
              <span>Photo {activeImageIndex + 1} of {images.length}</span>
              <span>·</span>
              <span className="font-[Cormorant_Garamond] text-sm text-[#c8a882]">{product.title}</span>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          SIZE GUIDE MODAL
      ════════════════════════════════════════ */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="bg-white border border-[#e8e2da] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-[#9b8f82] hover:text-[#1a1a1a] text-lg cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-[Cormorant_Garamond] text-2xl font-medium text-[#1a1a1a] mb-1">
              Atelier Size Dimensions
            </h3>
            <p className="text-xs text-[#7a7269] mb-4">
              All measurements are in inches. Designed for an elegant tailored fit.
            </p>

            <div className="overflow-x-auto border border-[#e8e2da]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f3f0] uppercase tracking-wider text-[10px] text-[#7a7269]">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest (in)</th>
                    <th className="py-2.5 px-3">Waist (in)</th>
                    <th className="py-2.5 px-3">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e2da]">
                  {[
                    { s: 'XS', c: '34 - 36', w: '28 - 30', l: '27.5' },
                    { s: 'S',  c: '36 - 38', w: '30 - 32', l: '28.0' },
                    { s: 'M',  c: '38 - 40', w: '32 - 34', l: '28.5' },
                    { s: 'L',  c: '40 - 42', w: '34 - 36', l: '29.0' },
                    { s: 'XL', c: '42 - 44', w: '36 - 38', l: '29.5' },
                    { s: 'XXL',c: '44 - 46', w: '38 - 40', l: '30.0' },
                  ].map((row) => (
                    <tr
                      key={row.s}
                      className={selectedSize === row.s ? 'bg-[#c8a882]/15 font-bold' : ''}
                    >
                      <td className="py-2 px-3">{row.s}</td>
                      <td className="py-2 px-3">{row.c}</td>
                      <td className="py-2 px-3">{row.w}</td>
                      <td className="py-2 px-3">{row.l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="px-6 py-2.5 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-widest hover:bg-[#a07850] transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          SELLER DELETE CONFIRMATION MODAL
      ════════════════════════════════════════ */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-white border border-[#e8e2da] max-w-md w-full p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 className="font-[Cormorant_Garamond] text-2xl font-medium text-[#1a1a1a] mb-2">
              Remove Listing Permanently?
            </h3>
            <p className="text-xs text-[#7a7269] leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-[#1a1a1a]">"{product.title}"</strong> from your store? This action cannot be reversed and all catalog listings for this item will be removed immediately.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 border border-[#e8e2da] text-xs font-bold uppercase tracking-wider text-[#7a7269] hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetailedProduct;