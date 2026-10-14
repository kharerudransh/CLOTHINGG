import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { ScrollReveal } from '@/components/core/scroll-reveal';
import toast from 'react-hot-toast';

/* ── Currency Formatter ── */
const formatPrice = (priceObj) => {
  if (!priceObj) return '—';
  const { amount, currency } = priceObj;
  const sym = currency === 'USD' ? '$' : '₹';
  const formatted = Number(amount || 0).toLocaleString(
    currency === 'USD' ? 'en-US' : 'en-IN',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );
  return `${sym} ${formatted}`;
};

const SUGGESTED_ATTRS = ['Size', 'Color', 'Material', 'Fit', 'Pattern', 'Length'];
const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
const MAX_VARIANT_IMAGES = 7;
const MAX_FILE_SIZE_MB = 5;

const SellerProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handleGetDetailedProduct, handleDeleteProduct, handleAddProductVariant } = useProduct();
  const currentUser = useSelector((state) => state.auth?.user);

  /* ── Core State ── */
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  /* ── Delete Modal State ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── Variant Form Modal / Drawer State ── */
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [submittingVariant, setSubmittingVariant] = useState(false);
  const [variantForm, setVariantForm] = useState({
    stock: '',
    priceAmount: '',
    priceCurrency: 'INR',
    attributes: [{ key: 'Size', value: 'M' }],
  });
  const [variantImages, setVariantImages] = useState([]); // array of { file, preview }
  const fileInputRef = useRef(null);
  const [expandedVariantIndex, setExpandedVariantIndex] = useState(null);

  /* ── Fetch Product & Check Ownership ── */
  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isSeller = currentUser?.role === 'Seller' || currentUser?.isSeller === true;
      if (currentUser && !isSeller) {
        setError('Access restricted. This section is exclusively reserved for verified sellers.');
        return;
      }

      const data = await handleGetDetailedProduct(productId);
      if (!data) {
        setError('Product not found or has been removed.');
        return;
      }

      // Check ownership
      const sellerId = data.seller?._id || data.seller;
      const myId = currentUser?._id;
      if (sellerId && myId && String(sellerId) !== String(myId)) {
        setError('Access restricted. This product belongs to another verified seller account. You can only view your own products.');
        return;
      }

      setProduct(data);
      // default currency match product
      if (data.price?.currency) {
        setVariantForm((prev) => ({ ...prev, priceCurrency: data.price.currency }));
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Unable to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId, currentUser?._id, currentUser?.role]);

  /* ── Attribute Row Handlers ── */
  const handleAddAttributeRow = () => {
    setVariantForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }],
    }));
  };

  const handleRemoveAttributeRow = (index) => {
    setVariantForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    setVariantForm((prev) => {
      const updated = [...prev.attributes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, attributes: updated };
    });
  };

  /* ── Variant Image Handling ── */
  const handleVariantImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (variantImages.length + files.length > MAX_VARIANT_IMAGES) {
      toast.error(`Maximum ${MAX_VARIANT_IMAGES} images permitted per variant.`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB size limit.`);
        continue;
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setVariantImages((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveVariantImage = (index) => {
    setVariantImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Submit Variant ── */
  const handleSubmitVariant = async (e) => {
    e.preventDefault();

    const stockNum = Number(variantForm.stock);
    if (!variantForm.stock || isNaN(stockNum) || stockNum <= 0) {
      toast.error('Please enter a valid stock quantity greater than 0.');
      return;
    }

    const priceNum = Number(variantForm.priceAmount);
    if (!variantForm.priceAmount || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price amount greater than 0.');
      return;
    }

    if (variantImages.length === 0) {
      toast.error('Please upload at least one image showcasing this variant.');
      return;
    }

    // Convert attributes array to object map
    const attributesMap = {};
    for (const attr of variantForm.attributes) {
      const k = attr.key?.trim();
      const v = attr.value?.trim();
      if (k && v) {
        attributesMap[k] = v;
      }
    }

    // Match the exact shape expected by addProductVariant in product.api.service.js:
    // newVariantData.images: Array<{ file }>
    // newVariantData.price: { amount, currency }
    // newVariantData.stock: number
    // newVariantData.attributes: Object
    const payload = {
      images: variantImages,
      price: {
        amount: priceNum,
        currency: variantForm.priceCurrency,
      },
      stock: stockNum,
      attributes: attributesMap,
    };

    setSubmittingVariant(true);
    try {
      const added = await handleAddProductVariant(productId, payload);
      if (added) {
        setProduct((prev) => ({
          ...prev,
          variants: [...(prev.variants || []), added],
        }));
        setIsAddVariantOpen(false);
        setVariantForm({
          stock: '',
          priceAmount: '',
          priceCurrency: product?.price?.currency || 'INR',
          attributes: [{ key: 'Size', value: 'M' }],
        });
        setVariantImages([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingVariant(false);
    }
  };

  /* ── Delete Listing ── */
  const handleDelete = async () => {
    if (!product?._id) return;
    setIsDeleting(true);
    try {
      await handleDeleteProduct(product._id);
      navigate('/see-products');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  /* ── Total Variants Stock Calculation ── */
  const totalVariantsStock = useMemo(() => {
    if (!product?.variants || !product.variants.length) return 0;
    return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [product?.variants]);

  /* ── SKELETON LOADING ── */
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#f5f3f0] py-12 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#c8a882]/30 border-t-[#c8a882] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-[Cormorant_Garamond] text-2xl text-[#1a1a1a] tracking-wide">
            Retrieving Curated Piece…
          </p>
          <p className="text-xs text-[#7a7269] tracking-wider uppercase mt-1">
            Clothingg Seller Atelier
          </p>
        </div>
      </div>
    );
  }

  /* ── ERROR / ACCESS DENIED STATE ── */
  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#f5f3f0] py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
        <div className="bg-[#ffffff] border border-[#e8e2da] max-w-lg w-full p-8 sm:p-10 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="font-[Cormorant_Garamond] text-3xl font-medium text-[#1a1a1a] mb-2">
            Restricted Atelier View
          </h2>
          <p className="text-xs sm:text-sm text-[#7a7269] mb-6 leading-relaxed">
            {error || 'This product detail page is exclusively accessible by the verified seller who curated it.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/see-products"
              className="px-6 py-3 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#a07850] hover:text-[#1a1a1a] transition-colors"
            >
              Return to Your Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── STRICT SELLER & OWNERSHIP GUARD ── */
  const isSeller = currentUser?.role === 'Seller' || currentUser?.isSeller === true;
  const sellerId = product?.seller?._id || product?.seller;
  const isOwner = Boolean(sellerId && currentUser?._id && String(sellerId) === String(currentUser._id));

  if (!isSeller || !isOwner) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#f5f3f0] py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
        <div className="bg-[#ffffff] border border-[#e8e2da] max-w-lg w-full p-8 sm:p-10 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="font-[Cormorant_Garamond] text-3xl font-medium text-[#1a1a1a] mb-2">
            Restricted Atelier View
          </h2>
          <p className="text-xs sm:text-sm text-[#7a7269] mb-6 leading-relaxed">
            {!isSeller
              ? 'This product page is exclusively accessible to verified sellers.'
              : 'You do not have permission to view or manage variants for this product. You can only view products that belong to your seller account.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={isSeller ? "/see-products" : "/buyer-home"}
              className="px-6 py-3 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#a07850] hover:text-[#1a1a1a] transition-colors"
            >
              {isSeller ? "Return to Your Collection" : "Go to Buyer Home"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const variants = product.variants || [];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f5f3f0] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ══ BREADCRUMBS & TOP BAR ══ */}
        <ScrollReveal delay={0.05} y={15}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e8e2da]">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#7a7269]">
              <Link to="/seller-home" className="hover:text-[#1a1a1a] transition-colors">
                Seller Portal
              </Link>
              <span>/</span>
              <Link to="/see-products" className="hover:text-[#1a1a1a] transition-colors">
                Collection
              </Link>
              <span>/</span>
              <span className="text-[#a07850] font-medium truncate max-w-xs sm:max-w-sm">
                {product.title}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Buyer View Preview Link */}
              <Link
                to={`/product/${product._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#ffffff] border border-[#e8e2da] text-xs font-bold uppercase tracking-wider text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Preview public buyer experience"
              >
                <span>Buyer View</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </Link>

              {/* Add Variant CTA */}
              <button
                onClick={() => setIsAddVariantOpen(true)}
                className="px-5 py-2 bg-[#c8a882] text-[#1a1a1a] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#a07850] hover:text-[#ffffff] transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Variant</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 transition-colors cursor-pointer"
                title="Delete this listing"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* ══ PRODUCT HERO CARD: GALLERY + SPECS ══ */}
        <ScrollReveal delay={0.1} y={20}>
          <div className="bg-[#ffffff] border border-[#e8e2da] shadow-2xs overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">

              {/* Left Column: Gallery */}
              <div className="lg:col-span-6 p-6 sm:p-8 bg-[#faf8f5] border-b lg:border-b-0 lg:border-r border-[#e8e2da] flex flex-col justify-between">
                <div>
                  {/* Active Image Stage with Contain Fit */}
                  <div className="relative aspect-[3/4] w-full bg-[#f0ece6] overflow-hidden mb-4 border border-[#e8e2da] flex items-center justify-center">
                    {images[activeImageIndex] ? (
                      <img
                        src={images[activeImageIndex]}
                        alt={product.title}
                        className="w-full h-full object-contain p-3 transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="text-xs text-[#9b8f82] uppercase tracking-wider">
                        No product photography
                      </div>
                    )}

                    <span className="absolute top-3 left-3 px-3 py-1 bg-[#1a1a1a]/90 text-[#c8a882] text-[10px] font-bold tracking-widest uppercase backdrop-blur-xs border border-[#c8a882]/40">
                      Photo {activeImageIndex + 1} of {images.length || 1}
                    </span>

                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#ffffff]/90 text-[#1a1a1a] text-[9.5px] font-bold tracking-wider uppercase border border-[#e8e2da]">
                      Seller Archive
                    </span>
                  </div>

                  {/* Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {images.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-16 h-20 shrink-0 border-2 overflow-hidden transition-all bg-[#ffffff] p-1 cursor-pointer ${
                            activeImageIndex === i
                              ? 'border-[#a07850] shadow-sm'
                              : 'border-[#e8e2da] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-[#e8e2da] flex items-center justify-between text-xs text-[#7a7269]">
                  <span>Total Garment Photos: <strong className="text-[#1a1a1a]">{images.length}</strong></span>
                  <span className="text-[10px] uppercase tracking-widest text-[#a07850]">Curated Product Record</span>
                </div>
              </div>

              {/* Right Column: Information & Metadata */}
              <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  {/* Category / Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-[#1a1a1a] text-[#c8a882] text-[10px] font-bold tracking-widest uppercase">
                      Verified Seller Item
                    </span>
                    <span className="text-[11px] text-[#9b8f82] uppercase tracking-wider font-semibold">
                      Currency: {product.price?.currency || 'INR'}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="font-[Cormorant_Garamond] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#1a1a1a] mb-4">
                    {product.title}
                  </h1>

                  {/* Price Tag */}
                  <div className="mb-6 pb-6 border-b border-[#e8e2da]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b8f82] mb-1">
                      Base Listing Price
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] font-[Cormorant_Garamond]">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#9b8f82] mb-2">
                      Product Narrative & Specifications
                    </p>
                    <p className="text-xs sm:text-sm text-[#7a7269] leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Quick Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#e8e2da]">
                    <div className="bg-[#faf8f5] p-3 border border-[#e8e2da]">
                      <span className="text-[9px] uppercase tracking-widest text-[#9b8f82] block font-bold">
                        Variants
                      </span>
                      <span className="text-base font-bold text-[#1a1a1a]">
                        {variants.length}
                      </span>
                    </div>

                    <div className="bg-[#faf8f5] p-3 border border-[#e8e2da]">
                      <span className="text-[9px] uppercase tracking-widest text-[#9b8f82] block font-bold">
                        Total Units
                      </span>
                      <span className="text-base font-bold text-[#1a1a1a]">
                        {totalVariantsStock}
                      </span>
                    </div>

                    <div className="bg-[#faf8f5] p-3 border border-[#e8e2da]">
                      <span className="text-[9px] uppercase tracking-widest text-[#9b8f82] block font-bold">
                        Listed Date
                      </span>
                      <span className="text-xs font-bold text-[#1a1a1a] block truncate">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </div>

                    <div className="bg-[#faf8f5] p-3 border border-[#e8e2da]">
                      <span className="text-[9px] uppercase tracking-widest text-[#9b8f82] block font-bold">
                        Item ID
                      </span>
                      <span className="text-xs font-bold text-[#1a1a1a] block truncate" title={product._id}>
                        {product._id ? product._id.slice(-6).toUpperCase() : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Quick CTA */}
                <div className="pt-6 mt-6 border-t border-[#e8e2da] flex items-center justify-between">
                  <div className="text-xs text-[#7a7269]">
                    <span>Seller Account: <strong className="text-[#1a1a1a]">{currentUser?.email || 'Verified Seller'}</strong></span>
                  </div>
                  <button
                    onClick={() => setIsAddVariantOpen(true)}
                    className="text-xs font-bold uppercase tracking-wider text-[#a07850] hover:text-[#1a1a1a] transition-colors underline"
                  >
                    + Add New Variant Breakdown
                  </button>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>

        {/* ══ PRODUCT VARIANTS SECTION ══ */}
        <ScrollReveal delay={0.15} y={20}>
          <div className="bg-[#ffffff] border border-[#e8e2da] shadow-2xs p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#e8e2da]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#a07850] uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a07850]" />
                  Inventory Breakdown
                </div>
                <h2 className="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-medium text-[#1a1a1a]">
                  Product Variants ({variants.length})
                </h2>
                <p className="text-xs text-[#7a7269] mt-0.5">
                  Manage individual sizes, colors, stock allocations, and pricing for this design.
                </p>
              </div>

              <button
                onClick={() => setIsAddVariantOpen(true)}
                className="px-5 py-2.5 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#a07850] hover:text-[#ffffff] transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Variant</span>
              </button>
            </div>

            {/* Variants Empty State */}
            {variants.length === 0 ? (
              <div className="py-12 sm:py-16 text-center max-w-md mx-auto">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#faf8f5] border border-[#e8e2da] flex items-center justify-center text-[#c8a882]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <h3 className="font-[Cormorant_Garamond] text-2xl font-medium text-[#1a1a1a] mb-1">
                  No Variants Configured
                </h3>
                <p className="text-xs text-[#7a7269] leading-relaxed mb-6">
                  Add custom sizes, colors, and stock configurations to let buyers purchase specific editions of this product.
                </p>
                <button
                  onClick={() => setIsAddVariantOpen(true)}
                  className="px-6 py-2.5 bg-[#c8a882] text-[#1a1a1a] text-xs font-bold uppercase tracking-widest hover:bg-[#a07850] hover:text-[#ffffff] transition-colors cursor-pointer"
                >
                  + Add First Variant
                </button>
              </div>
            ) : (
              /* Variants Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {variants.map((v, idx) => {
                  const firstImg = v.images?.[0]?.url || (typeof v.images?.[0] === 'string' ? v.images[0] : null) || images[0];
                  const isExpanded = expandedVariantIndex === idx;

                  // Parse attributes
                  let attrEntries = [];
                  if (v.attributes) {
                    if (v.attributes instanceof Map) {
                      attrEntries = Array.from(v.attributes.entries());
                    } else if (typeof v.attributes === 'object') {
                      attrEntries = Object.entries(v.attributes);
                    }
                  }

                  const stockNumber = Number(v.stock) || 0;
                  const stockStatus =
                    stockNumber > 10
                      ? { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                      : stockNumber > 0
                      ? { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-200' }
                      : { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' };

                  return (
                    <div
                      key={v._id || idx}
                      className="border border-[#e8e2da] bg-[#ffffff] hover:border-[#1a1a1a] transition-all duration-300 shadow-2xs flex flex-col justify-between"
                    >
                      {/* Top Header */}
                      <div className="p-4 border-b border-[#e8e2da] flex items-center justify-between bg-[#faf8f5]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-[#c8a882] text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                            Variant #{idx + 1}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border ${stockStatus.color}`}>
                          {stockStatus.label} ({stockNumber})
                        </span>
                      </div>

                      {/* Variant Main View */}
                      <div className="p-4 flex gap-4">
                        {/* Variant Thumbnail */}
                        <div className="w-20 h-24 bg-[#f0ece6] border border-[#e8e2da] overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {firstImg ? (
                            <img src={firstImg} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-[#9b8f82]">No photo</span>
                          )}
                        </div>

                        {/* Variant Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            {/* Attributes badges */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {attrEntries.length > 0 ? (
                                attrEntries.map(([k, val], aIdx) => (
                                  <span
                                    key={aIdx}
                                    className="px-2 py-0.5 bg-[#f5f3f0] border border-[#e8e2da] text-[10px] font-bold text-[#1a1a1a] tracking-wide"
                                  >
                                    {k}: <span className="text-[#a07850]">{val}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-[#9b8f82] italic">
                                  Standard configuration
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-[#9b8f82] uppercase tracking-wider">
                              Photos: {v.images?.length || 0}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] uppercase font-bold text-[#9b8f82] tracking-widest">
                              Variant Price
                            </p>
                            <p className="text-lg font-bold text-[#1a1a1a] font-[Cormorant_Garamond]">
                              {formatPrice(v.price)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expand Photos Gallery Toggle */}
                      {v.images?.length > 1 && (
                        <div className="px-4 pb-3">
                          <button
                            onClick={() => setExpandedVariantIndex(isExpanded ? null : idx)}
                            className="text-[10px] uppercase font-bold tracking-wider text-[#a07850] hover:text-[#1a1a1a] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide photos' : `View all ${v.images.length} photos`}</span>
                            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                          </button>

                          {isExpanded && (
                            <div className="flex gap-2 overflow-x-auto pt-2 pb-1 border-t border-[#f0ece6] mt-2">
                              {v.images.map((img, imgIdx) => {
                                const url = img?.url || img;
                                return (
                                  <div key={imgIdx} className="w-12 h-14 bg-[#f0ece6] border border-[#e8e2da] p-0.5 shrink-0">
                                    <img src={url} alt="" className="w-full h-full object-contain" />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

      </div>

      {/* ═══════════════ ADD VARIANT MODAL ═══════════════ */}
      {isAddVariantOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => !submittingVariant && setIsAddVariantOpen(false)}
        >
          <div
            className="bg-[#ffffff] border border-[#e8e2da] max-w-2xl w-full shadow-2xl relative my-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#e8e2da] flex items-center justify-between bg-[#faf8f5]">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#a07850] uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a07850]" />
                  Curate Edition
                </div>
                <h3 className="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-medium text-[#1a1a1a]">
                  Add Product Variant
                </h3>
                <p className="text-xs text-[#7a7269]">
                  Specify inventory stock, pricing adjustments, attributes, and photos for this variant.
                </p>
              </div>

              <button
                onClick={() => !submittingVariant && setIsAddVariantOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#a07850] transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitVariant} className="p-6 sm:p-8 space-y-6">

              {/* Row 1: Stock and Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stock Quantity */}
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                    Stock Allocation *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, stock: e.target.value }))}
                    className="w-full bg-[#faf8f5] border border-[#e8e2da] px-3.5 py-2.5 text-xs text-[#1a1a1a] focus:outline-hidden focus:border-[#1a1a1a] transition-colors"
                    required
                  />
                  <p className="text-[9.5px] text-[#9b8f82] mt-1">Available physical units ready for dispatch</p>
                </div>

                {/* Price and Currency */}
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                    Variant Price *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="e.g. 2999"
                      value={variantForm.priceAmount}
                      onChange={(e) => setVariantForm((prev) => ({ ...prev, priceAmount: e.target.value }))}
                      className="flex-1 bg-[#faf8f5] border border-[#e8e2da] px-3.5 py-2.5 text-xs text-[#1a1a1a] focus:outline-hidden focus:border-[#1a1a1a] transition-colors"
                      required
                    />
                    <select
                      value={variantForm.priceCurrency}
                      onChange={(e) => setVariantForm((prev) => ({ ...prev, priceCurrency: e.target.value }))}
                      className="bg-[#faf8f5] border border-[#e8e2da] px-3 py-2.5 text-xs font-bold text-[#1a1a1a] focus:outline-hidden focus:border-[#1a1a1a] cursor-pointer"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <p className="text-[9.5px] text-[#9b8f82] mt-1">Can match base price or have custom valuation</p>
                </div>
              </div>

              {/* Attributes Section */}
              <div className="border-t border-[#e8e2da] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#1a1a1a] block">
                      Variant Attributes
                    </label>
                    <span className="text-[10px] text-[#7a7269]">
                      E.g. Size: M, Color: Crimson Red, Fabric: 100% Raw Silk
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAttributeRow}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#a07850] hover:text-[#1a1a1a] underline transition-colors cursor-pointer"
                  >
                    + Add Attribute
                  </button>
                </div>

                {/* Pre-fill Helper Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <span className="text-[9.5px] uppercase font-bold text-[#9b8f82]">Quick Keys:</span>
                  {SUGGESTED_ATTRS.map((keyName) => (
                    <button
                      key={keyName}
                      type="button"
                      onClick={() => {
                        const exists = variantForm.attributes.some((a) => a.key.toLowerCase() === keyName.toLowerCase());
                        if (!exists) {
                          setVariantForm((prev) => ({
                            ...prev,
                            attributes: [...prev.attributes, { key: keyName, value: '' }],
                          }));
                        }
                      }}
                      className="px-2 py-0.5 bg-[#f5f3f0] hover:bg-[#e8e2da] text-[9.5px] font-semibold text-[#1a1a1a] border border-[#e8e2da] transition-colors cursor-pointer"
                    >
                      + {keyName}
                    </button>
                  ))}
                </div>

                {/* Attribute Rows */}
                <div className="space-y-2.5">
                  {variantForm.attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Attribute (e.g. Size)"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(idx, 'key', e.target.value)}
                        className="w-1/3 bg-[#faf8f5] border border-[#e8e2da] px-3 py-2 text-xs text-[#1a1a1a] focus:outline-hidden focus:border-[#1a1a1a]"
                        required
                      />
                      <span className="text-xs text-[#9b8f82] font-bold">:</span>
                      <input
                        type="text"
                        placeholder="Value (e.g. XL or Onyx Black)"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(idx, 'value', e.target.value)}
                        className="flex-1 bg-[#faf8f5] border border-[#e8e2da] px-3 py-2 text-xs text-[#1a1a1a] focus:outline-hidden focus:border-[#1a1a1a]"
                        required
                      />

                      {variantForm.attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttributeRow(idx)}
                          className="w-8 h-8 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shrink-0 border border-red-200 text-xs"
                          title="Remove attribute"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variant Images Upload */}
              <div className="border-t border-[#e8e2da] pt-5">
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                  Variant Photography *
                </label>
                <p className="text-[10px] text-[#7a7269] mb-3">
                  Upload up to {MAX_VARIANT_IMAGES} photos demonstrating this specific variant angle and colorway.
                </p>

                {/* Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e8e2da] hover:border-[#a07850] bg-[#faf8f5] p-6 text-center cursor-pointer transition-colors"
                >
                  <svg className="w-8 h-8 mx-auto mb-2 text-[#a07850]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                    Click to select variant images
                  </p>
                  <p className="text-[10px] text-[#7a7269] mt-0.5">
                    Supports JPG, PNG, WEBP up to {MAX_FILE_SIZE_MB}MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleVariantImagesSelect}
                    className="hidden"
                  />
                </div>

                {/* Previews Strip */}
                {variantImages.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {variantImages.map((imgObj, i) => (
                      <div key={i} className="relative w-16 h-20 bg-[#f0ece6] border border-[#e8e2da] overflow-hidden p-1">
                        <img src={imgObj.preview} alt="" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantImage(i)}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center cursor-pointer hover:bg-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-[#e8e2da] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddVariantOpen(false)}
                  disabled={submittingVariant}
                  className="px-5 py-2.5 border border-[#e8e2da] text-xs font-bold uppercase tracking-wider text-[#7a7269] hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingVariant}
                  className="px-6 py-2.5 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#a07850] hover:text-[#ffffff] transition-all cursor-pointer flex items-center gap-2"
                >
                  {submittingVariant ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#c8a882] border-t-transparent rounded-full animate-spin" />
                      <span>Saving Variant…</span>
                    </>
                  ) : (
                    <span>Add to Listing</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRMATION MODAL ═══════════════ */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-[#ffffff] border border-[#e8e2da] max-w-md w-full p-6 sm:p-8 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 className="font-[Cormorant_Garamond] text-2xl font-bold text-center text-[#1a1a1a] mb-2">
              Delete Product Listing?
            </h3>
            <p className="text-xs text-[#7a7269] text-center mb-6 leading-relaxed">
              Are you sure you wish to permanently withdraw <strong>"{product.title}"</strong> and all associated variants from the Clothingg platform?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-[#e8e2da] text-xs font-bold uppercase tracking-wider text-[#7a7269] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                Keep Listing
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerProductDetail;