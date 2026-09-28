import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { ScrollReveal } from '@/components/core/scroll-reveal';

const SeeAllProducts = () => {
  const navigate = useNavigate();
  const { handleGetsellerProduct, handleDeleteProduct } = useProduct();
  const sellerProducts = useSelector((state) => state.product?.sellerProducts || []);
  const loading = useSelector((state) => state.product?.loading || false);

  // Search, Filter, View & Modal States
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('ALL'); // 'ALL' | 'INR' | 'USD'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-asc' | 'price-desc' | 'title'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedProduct, setSelectedProduct] = useState(null); // For inspect detail modal
  const [productToDelete, setProductToDelete] = useState(null); // For delete confirmation modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Initial Fetch
  useEffect(() => {
    handleGetsellerProduct();
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...sellerProducts];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Currency filter
    if (currencyFilter !== 'ALL') {
      result = result.filter((p) => p.price?.currency === currencyFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'price-asc') {
        return (a.price?.amount || 0) - (b.price?.amount || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.price?.amount || 0) - (a.price?.amount || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [sellerProducts, searchTerm, currencyFilter, sortBy]);

  // Valuation summary calculation
  const totalValuation = useMemo(() => {
    const totalINR = sellerProducts
      .filter((p) => p.price?.currency === 'INR')
      .reduce((sum, p) => sum + (Number(p.price?.amount) || 0), 0);

    const totalUSD = sellerProducts
      .filter((p) => p.price?.currency === 'USD')
      .reduce((sum, p) => sum + (Number(p.price?.amount) || 0), 0);

    return { totalINR, totalUSD };
  }, [sellerProducts]);

  // Price formatting helper
  const formatPrice = (priceObj) => {
    if (!priceObj) return 'N/A';
    const { amount, currency } = priceObj;
    const symbol = currency === 'USD' ? '$' : '₹';
    const formattedNum = Number(amount || 0).toLocaleString(
      currency === 'USD' ? 'en-US' : 'en-IN',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );
    return `${symbol} ${formattedNum}`;
  };

  // Delete Action Handler
  const confirmDelete = async () => {
    if (!productToDelete?._id) return;
    setIsDeleting(true);
    await handleDeleteProduct(productToDelete._id);
    setIsDeleting(false);

    // If deleting the currently viewed product in modal, close it
    if (selectedProduct?._id === productToDelete._id) {
      setSelectedProduct(null);
    }
    setProductToDelete(null);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f5f3f0] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 font-[Montserrat] text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">

        {/* ══ TOP BAR & CATALOG STATS ══ */}
        <ScrollReveal delay={0.05} y={15}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-[#e8e2da]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#a07850] uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a07850]" />
                Curated Inventory
              </div>
              <h1 className="font-[Cormorant_Garamond] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#1a1a1a]">
                Seller Collection
              </h1>
              <p className="text-xs sm:text-sm text-[#7a7269] mt-1 max-w-xl">
                Inspect, manage and monitor your luxury product portfolio listed on Clothingg.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Valuation Badges */}
              <div className="flex items-center gap-2 bg-[#ffffff] border border-[#e8e2da] px-4 py-2.5 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9b8f82]">
                  Valuation:
                </div>
                <div className="text-xs font-bold text-[#1a1a1a] flex gap-3">
                  {totalValuation.totalINR > 0 && (
                    <span>₹{totalValuation.totalINR.toLocaleString('en-IN')}</span>
                  )}
                  {totalValuation.totalUSD > 0 && (
                    <span>${totalValuation.totalUSD.toLocaleString('en-US')}</span>
                  )}
                  {totalValuation.totalINR === 0 && totalValuation.totalUSD === 0 && (
                    <span>₹0.00</span>
                  )}
                </div>
              </div>

              {/* Total Count Badge */}
              <div className="bg-[#1a1a1a] text-[#c8a882] px-4 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#1a1a1a]">
                {sellerProducts.length} {sellerProducts.length === 1 ? 'Piece' : 'Pieces'}
              </div>

              {/* Add Product Button */}
              <Link
                to="/add-product"
                className="px-5 py-2.5 bg-[#c8a882] text-[#1a1a1a] text-xs font-bold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#a07850] hover:text-[#ffffff] flex items-center gap-2 shadow-2xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>


        {/* ══ CONTROLS: SEARCH, FILTERS, VIEW MODE ══ */}
        <ScrollReveal delay={0.1} y={15}>
          <div className="bg-[#ffffff] border border-[#e8e2da] p-4 sm:p-5 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-2xs">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b8f82]"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search collection by title or description..."
                className="w-full bg-[#f9f8f6] border border-[#e8e2da] pl-10 pr-4 py-2.5 text-xs text-[#1a1a1a] placeholder:text-[#b0a898] focus:outline-hidden focus:border-[#a07850] focus:bg-[#ffffff] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9b8f82] hover:text-[#1a1a1a]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Currency Filter */}
              <div className="flex items-center gap-1 bg-[#f5f3f0] p-1 border border-[#e8e2da]">
                {['ALL', 'INR', 'USD'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrencyFilter(curr)}
                    className={`px-3 py-1.5 text-[10.5px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      currencyFilter === curr
                        ? 'bg-[#1a1a1a] text-[#c8a882]'
                        : 'text-[#7a7269] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              {/* Sorting Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#f9f8f6] border border-[#e8e2da] px-3 py-2 text-xs font-semibold text-[#1a1a1a] focus:outline-hidden focus:border-[#a07850] cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title">Title: A – Z</option>
              </select>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-[#f5f3f0] border border-[#e8e2da] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#1a1a1a] text-[#c8a882]' : 'text-[#7a7269] hover:text-[#1a1a1a]'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-1.5 transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#1a1a1a] text-[#c8a882]' : 'text-[#7a7269] hover:text-[#1a1a1a]'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </ScrollReveal>


        {/* ══ LOADING STATE (SKELETON) ══ */}
        {loading && sellerProducts.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#ffffff] border border-[#e8e2da] p-4 animate-pulse">
                <div className="aspect-[3/4] bg-[#e8e2da] mb-4" />
                <div className="h-4 bg-[#e8e2da] w-3/4 mb-2" />
                <div className="h-3 bg-[#e8e2da] w-1/2 mb-4" />
                <div className="h-4 bg-[#e8e2da] w-1/3" />
              </div>
            ))}
          </div>
        )}


        {/* ══ EMPTY STATE ══ */}
        {!loading && sellerProducts.length === 0 && (
          <ScrollReveal delay={0.1} y={20}>
            <div className="bg-[#ffffff] border border-[#e8e2da] p-12 sm:p-16 text-center max-w-2xl mx-auto my-12 shadow-xs">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5f3f0] border border-[#e8e2da] flex items-center justify-center text-[#c8a882]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h3 className="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-medium text-[#1a1a1a] mb-2">
                Your Catalogue is Empty
              </h3>
              <p className="text-xs sm:text-sm text-[#7a7269] max-w-md mx-auto mb-6 leading-relaxed">
                You haven't added any products to your seller account yet. List your luxury pieces to showcase them to refined buyers.
              </p>
              <Link
                to="/add-product"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#a07850] hover:text-[#1a1a1a] transition-colors"
              >
                <span>+ List Your First Piece</span>
              </Link>
            </div>
          </ScrollReveal>
        )}


        {/* ══ NO SEARCH RESULTS STATE ══ */}
        {!loading && sellerProducts.length > 0 && filteredProducts.length === 0 && (
          <div className="bg-[#ffffff] border border-[#e8e2da] p-12 text-center my-8">
            <p className="text-sm font-semibold text-[#1a1a1a] mb-1">No products match your criteria</p>
            <p className="text-xs text-[#7a7269] mb-4">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrencyFilter('ALL');
              }}
              className="text-xs font-bold uppercase tracking-wider text-[#a07850] underline hover:text-[#1a1a1a]"
            >
              Reset Filters
            </button>
          </div>
        )}


        {/* ══ PRODUCT GRID VIEW ══ */}
        {!loading && viewMode === 'grid' && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const coverImg = product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&fit=crop';
              const imageCount = product.images?.length || 0;

              return (
                <ScrollReveal key={product._id || index} delay={index * 0.05} y={20}>
                  <div
                    onClick={() => {
                      navigate(`/product/${product._id}`);
                    }}
                    className="group bg-[#ffffff] border border-[#e8e2da] overflow-hidden hover:border-[#1a1a1a] transition-all duration-300 flex flex-col h-full cursor-pointer shadow-2xs hover:shadow-md relative"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] bg-[#faf8f5] overflow-hidden flex items-center justify-center">
                      <img
                        src={coverImg}
                        alt={product.title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />

                      {/* Top Overlay Badges & Delete Icon */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
                        <span className="px-2.5 py-1 bg-[#1a1a1a]/90 text-[#c8a882] text-[9.5px] font-bold tracking-widest uppercase backdrop-blur-xs border border-[#c8a882]/40">
                          {product.price?.currency || 'INR'}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(product);
                          }}
                          title="Delete listing"
                          className="w-8 h-8 rounded-full bg-red-950/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>

                      {/* Photo count indicator */}
                      {imageCount > 1 && (
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-[9.5px] font-medium backdrop-blur-xs pointer-events-none">
                          +{imageCount - 1} photos
                        </span>
                      )}

                      {/* Quick Inspect Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <span className="px-4 py-2 bg-[#ffffff] text-[#1a1a1a] text-[10px] font-bold tracking-widest uppercase transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Details Container */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-[#ffffff]">
                      <div>
                        <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#1a1a1a] line-clamp-1 group-hover:text-[#a07850] transition-colors mb-1">
                          {product.title}
                        </h3>
                        <p className="text-xs text-[#7a7269] line-clamp-2 leading-relaxed mb-4">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#f5f3f0] flex items-center justify-between">
                        <div>
                          <p className="text-[9.5px] uppercase font-bold text-[#9b8f82] tracking-wider">
                            Price
                          </p>
                          <p className="text-sm font-bold text-[#1a1a1a]">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#9b8f82] tracking-wider">
                          {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Listed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}


        {/* ══ PRODUCT LIST VIEW ══ */}
        {!loading && viewMode === 'list' && filteredProducts.length > 0 && (
          <div className="space-y-4">
            {filteredProducts.map((product, index) => {
              const coverImg = product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&fit=crop';
              const imageCount = product.images?.length || 0;

              return (
                <ScrollReveal key={product._id || index} delay={index * 0.04} y={15}>
                  <div
                    onClick={() => {
                      navigate(`/product/${product._id}`);
                    }}
                    className="group bg-[#ffffff] border border-[#e8e2da] hover:border-[#1a1a1a] p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-6 cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-md"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-full sm:w-28 h-36 bg-[#faf8f5] shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={coverImg}
                        alt={product.title}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      {imageCount > 1 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-medium">
                          {imageCount} photos
                        </span>
                      )}
                    </div>

                    {/* Product Metadata */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                        <span className="text-[9.5px] font-bold tracking-widest text-[#a07850] uppercase px-2 py-0.5 bg-[#f5f3f0] border border-[#e8e2da]">
                          {product.price?.currency || 'INR'}
                        </span>
                        <span className="text-[10px] text-[#9b8f82]">
                          ID: {product._id ? product._id.substring(0, 10) : `#${index + 1}`}
                        </span>
                      </div>

                      <h3 className="font-[Cormorant_Garamond] text-2xl font-medium text-[#1a1a1a] group-hover:text-[#a07850] transition-colors mb-1 truncate">
                        {product.title}
                      </h3>
                      <p className="text-xs text-[#7a7269] line-clamp-2 leading-relaxed mb-2 max-w-2xl">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-[#e8e2da] pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto flex flex-row sm:flex-col items-center justify-between sm:items-end gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#9b8f82] tracking-wider mb-0.5">
                          Listing Valuation
                        </p>
                        <p className="text-xl font-bold text-[#1a1a1a]">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(product);
                          }}
                          title="Delete Listing"
                          className="p-2 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 transition-colors cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          className="px-4 py-1.5 bg-[#f5f3f0] text-[#1a1a1a] border border-[#e8e2da] text-[10.5px] font-bold uppercase tracking-wider group-hover:bg-[#1a1a1a] group-hover:text-[#c8a882] transition-colors"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

      </div>


      {/* ══ PRODUCT LIGHTBOX / DETAIL MODAL ══ */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#ffffff] border border-[#e8e2da] max-w-4xl w-full overflow-hidden shadow-2xl relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#a07850] transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Column: Image Viewer */}
              <div className="md:col-span-7 bg-[#1a1a1a] p-6 flex flex-col justify-between">
                {/* Main Active Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden mb-4 bg-black">
                  <img
                    src={selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0]}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#1a1a1a]/90 text-[#c8a882] text-[9.5px] font-bold tracking-widest uppercase border border-[#c8a882]">
                    Photo {activeImageIndex + 1} of {selectedProduct.images?.length || 1}
                  </span>
                </div>

                {/* Thumbnail Strip */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedProduct.images.map((imgUrl, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-14 h-16 shrink-0 border-2 overflow-hidden transition-all cursor-pointer ${
                          activeImageIndex === i ? 'border-[#c8a882] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Product Info & Actions */}
              <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#ffffff]">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-[#f5f3f0] border border-[#e8e2da] text-[10px] font-bold tracking-widest uppercase text-[#a07850]">
                      {selectedProduct.price?.currency || 'INR'}
                    </span>
                    <span className="text-[10.5px] text-[#9b8f82] uppercase font-medium">
                      Status: Active Listing
                    </span>
                  </div>

                  <h2 className="font-[Cormorant_Garamond] text-3xl font-medium text-[#1a1a1a] mb-3 leading-snug">
                    {selectedProduct.title}
                  </h2>

                  <div className="mb-6 pb-4 border-b border-[#e8e2da]">
                    <p className="text-[10px] uppercase font-bold text-[#9b8f82] tracking-wider">
                      Price Tag
                    </p>
                    <p className="text-2xl font-bold text-[#1a1a1a]">
                      {formatPrice(selectedProduct.price)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#9b8f82] mb-1">
                        Detailed Description
                      </p>
                      <p className="text-xs text-[#7a7269] leading-relaxed max-h-48 overflow-y-auto pr-2">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {selectedProduct.createdAt && (
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#9b8f82] mb-0.5">
                          Date Listed
                        </p>
                        <p className="text-xs text-[#1a1a1a] font-medium">
                          {new Date(selectedProduct.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Action Footer */}
                <div className="pt-6 border-t border-[#e8e2da] mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setProductToDelete(selectedProduct);
                    }}
                    className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate(`/product/${selectedProduct._id}`);
                    }}
                    className="flex-1 py-3 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#a07850] hover:text-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    View Full Product Page →
                  </button>

                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-4 py-3 border border-[#e8e2da] text-[#7a7269] text-xs font-bold uppercase tracking-wider hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* ══ DELETE CONFIRMATION MODAL ══ */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isDeleting && setProductToDelete(null)}
        >
          <div
            className="bg-[#ffffff] border border-[#e8e2da] max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Title & Warning Text */}
            <h3 className="font-[Cormorant_Garamond] text-2xl font-bold text-[#1a1a1a] mb-2">
              Delete Product Listing?
            </h3>
            <p className="text-xs text-[#7a7269] leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong className="text-[#1a1a1a]">"{productToDelete.title}"</strong>? This action cannot be undone and will remove the item from your catalog.
            </p>

            {/* Item Thumbnail Preview */}
            <div className="flex items-center gap-3 p-3 bg-[#f5f3f0] border border-[#e8e2da] mb-6">
              <img
                src={productToDelete.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&fit=crop'}
                alt={productToDelete.title}
                className="w-12 h-16 object-cover bg-black border border-[#e8e2da]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1a1a1a] truncate">{productToDelete.title}</p>
                <p className="text-[11px] text-[#a07850] font-bold">{formatPrice(productToDelete.price)}</p>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#7a7269] hover:text-[#1a1a1a] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SeeAllProducts;