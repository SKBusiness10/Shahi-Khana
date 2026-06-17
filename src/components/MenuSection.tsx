import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Milk, Award, Sparkles, Plus, Minus } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { MENU_ITEMS } from '../data';
import { MenuItem } from '../types';

interface MenuSectionProps {
  menuItems?: MenuItem[];
  cart: Record<string, number>;
  setCart: Dispatch<SetStateAction<Record<string, number>>>;
  selectedPortions: Record<string, 'half' | 'full'>;
  setSelectedPortions: Dispatch<SetStateAction<Record<string, 'half' | 'full'>>>;
  isLiveDatabase?: boolean;
}

export default function MenuSection({
  menuItems = MENU_ITEMS,
  cart,
  setCart,
  selectedPortions,
  setSelectedPortions,
  isLiveDatabase = false
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'breakfast' | 'bread' | 'dairy' | 'beverages'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderMethod, setOrderMethod] = useState<'takeaway' | 'delivery'>('takeaway');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  // States for backend pricing calculation
  const [billingSummary, setBillingSummary] = useState<{
    subtotal: number;
    packagingFee: number;
    deliveryFee: number;
    grandTotal: number;
    billingItems: Array<{
      id: string;
      portion: 'half' | 'full';
      quantity: number;
      pricePerUnit: number;
      total: number;
    }>;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const totalItemsInCart = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Dynamic backend price calculations syncing effect
  useEffect(() => {
    if (totalItemsInCart === 0) {
      setBillingSummary(null);
      return;
    }

    const calculateBillOnBackend = async () => {
      setIsCalculating(true);
      try {
        const response = await fetch('/api/calculate-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart,
            orderMethod,
            menuItems
          })
        });
        const data = await response.json();
        if (data.success) {
          setBillingSummary({
            subtotal: data.subtotal,
            packagingFee: data.packagingFee,
            deliveryFee: data.deliveryFee,
            grandTotal: data.grandTotal,
            billingItems: data.billingItems
          });
        }
      } catch (err) {
        console.error('Error calculating bill on backend:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    const timer = setTimeout(() => {
      calculateBillOnBackend();
    }, 200); // 200ms debounce to prevent firing too many updates while clicking increment buttons

    return () => clearTimeout(timer);
  }, [cart, orderMethod, menuItems, totalItemsInCart]);

  const categories = [
    { id: 'all', label: 'Full Menu', icon: Sparkles },
    { id: 'breakfast', label: 'Morning Nashta', icon: Coffee },
    { id: 'bread', label: 'Naan & Parathas', icon: Coffee },
    { id: 'dairy', label: 'Pure Dairy', icon: Milk },
    { id: 'beverages', label: 'Beverages', icon: Coffee },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameUrdu.includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getBillingItems = () => {
    const list: Array<{
      item: MenuItem;
      portion: 'half' | 'full';
      quantity: number;
      pricePerUnit: number;
      total: number;
    }> = [];

    Object.entries(cart).forEach(([key, val]) => {
      const qty = val as number;
      if (qty <= 0) return;
      
      const parts = key.split('-');
      const portion = parts[parts.length - 1] as 'half' | 'full';
      const itemId = parts.slice(0, parts.length - 1).join('-');
      
      const item = menuItems.find(m => m.id === itemId);
      if (!item) return;

      const pricePerUnit = portion === 'half' && item.priceHalf ? item.priceHalf : item.priceFull;
      list.push({
        item,
        portion,
        quantity: qty,
        pricePerUnit,
        total: pricePerUnit * qty
      });
    });

    return list;
  };

  const invoiceItems = getBillingItems();

  // Calculate current item parameters
  const getItemDetails = (item: MenuItem) => {
    const portionChoice = selectedPortions[item.id] || 'full';
    const price = portionChoice === 'half' && item.priceHalf ? item.priceHalf : item.priceFull;
    const cartKey = `${item.id}-${portionChoice}`;
    const qty = cart[cartKey] || 0;
    return { portionChoice, price, cartKey, qty };
  };

  // Alter quantities
  const updateQuantity = (item: MenuItem, delta: number) => {
    const { cartKey, qty } = getItemDetails(item);
    const newQty = Math.max(0, qty + delta);
    setCart(prev => {
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[cartKey];
      } else {
        updated[cartKey] = newQty;
      }
      return updated;
    });
  };

  // Directly set quantities
  const setQuantityManual = (item: MenuItem, val: number) => {
    const { cartKey } = getItemDetails(item);
    const newQty = Math.max(0, val);
    setCart(prev => {
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[cartKey];
      } else {
        updated[cartKey] = newQty;
      }
      return updated;
    });
  };

  return (
    <section id="menu" className="py-20 bg-[#FAF6F0] border-t border-[#D4AF37]/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-sans text-xs font-bold tracking-widest text-[#D4AF37] uppercase block">
             صبح کا بہترین اور لذیذ ترین ناشتہ
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#58111A] tracking-tight mt-2 mb-2">
            Shahi Khana Nashta Menu
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            {isLiveDatabase ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#58111A]/5 text-[#58111A] border border-[#D4AF37]/35 text-[9px] font-black uppercase tracking-widest rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Live Menu Database</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#58111A]/5 text-[#58111A]/60 border border-[#58111A]/10 text-[9px] font-black uppercase tracking-widest rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                <span>Heritage Default Catalogue</span>
              </span>
            )}
          </div>

          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-6" />
          <p className="font-sans text-[#58111A]/80 text-sm sm:text-base tracking-wide leading-relaxed">
            Select items directly from the digital menu card. You can configure portions (Half or Full), customize quantities, and view your calculated billing slip at any time on the main landing page to submit your order instantly!
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          {/* Tabs Container */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`tab-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#58111A] text-[#FAF6F0] shadow-md border border-[#D4AF37]/35 transform scale-102'
                      : 'bg-white text-[#58111A]/70 hover:bg-[#58111A]/5 border border-dashed border-[#58111A]/20 hover:text-[#58111A]'
                  }`}
                >
                  <IconComp className={`h-4 w-4 ${isSelected ? 'text-[#D4AF37]' : 'text-[#58111A]/50'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80 group">
            <input
              id="menu-search-input"
              type="text"
              placeholder="Search (e.g. Halwa Pori, Naan, Lassi)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-full bg-white border border-[#58111A]/15 text-sm text-[#58111A] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#58111A]/40 group-focus-within:text-[#D4AF37] transition-colors font-sans text-xs font-semibold">
              FIND
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const { portionChoice, price, qty } = getItemDetails(item);
              
              return (
                <motion.div
                  key={item.id}
                  id={`menu-card-${item.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-[#58111A]/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Top Aesthetic Line */}
                    <div className="h-1.5 w-full bg-[#58111A] group-hover:bg-[#D4AF37] transition-all" />

                    {/* Card Content body */}
                    <div className="p-6">
                      
                      {/* Brand Specialty stamp */}
                      <div className="flex items-center justify-between mb-3">
                        {item.isSpecialty ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-50 rounded text-[9px] font-extrabold uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30">
                            <Award className="h-3 w-3" />
                            <span>Popular Specialty</span>
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Fresh Daily
                          </span>
                        )}
                        <span className="font-serif text-sm font-bold text-amber-800 tracking-wide">
                          {item.nameUrdu}
                        </span>
                      </div>

                      {/* Header Section */}
                      <div className="mb-2">
                        <h3 className="font-sans text-lg font-bold text-[#58111A] group-hover:text-[#D4AF37] transition-colors leading-tight">
                          {item.name}
                        </h3>
                        
                        {item.rating && (
                          <div className="flex items-center space-x-1.5 mt-1.5 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-[11px] leading-none ${
                                    i < Math.floor(item.rating)
                                      ? 'text-[#D4AF37]'
                                      : 'text-[#58111A]/15'
                                  }`}
                                >
                                  &#9733;
                                </span>
                              ))}
                            </div>
                            <span className="font-sans text-[10px] text-[#58111A]/60 font-bold uppercase tracking-wide">
                              {item.rating} &bull; {item.reviewCount} Reviews
                            </span>
                          </div>
                        )}

                        <p className="font-sans text-[#58111A]/70 text-xs sm:text-sm mt-1 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Portion Sizes Toggles (for items with customizable half/full prices) */}
                      {item.hasHalfOption ? (
                        <div className="bg-[#FAF6F0] p-1 rounded-lg flex items-center space-x-1 mb-4 border border-[#58111A]/5">
                          <button
                            id={`portion-half-${item.id}`}
                            onClick={() => setSelectedPortions(prev => ({ ...prev, [item.id]: 'half' }))}
                            className={`flex-1 py-1 text-center rounded text-xs font-bold transition-all ${
                              portionChoice === 'half'
                                ? 'bg-[#58111A] text-white shadow-sm'
                                : 'text-[#58111A]/60 hover:text-[#58111A]'
                            }`}
                          >
                            Half (Rs. {item.priceHalf})
                          </button>
                          <button
                            id={`portion-full-${item.id}`}
                            onClick={() => setSelectedPortions(prev => ({ ...prev, [item.id]: 'full' }))}
                            className={`flex-1 py-1 text-center rounded text-xs font-bold transition-all ${
                              portionChoice === 'full'
                                ? 'bg-[#58111A] text-white shadow-sm'
                                : 'text-[#58111A]/60 hover:text-[#58111A]'
                            }`}
                          >
                            Full (Rs. {item.priceFull})
                          </button>
                        </div>
                      ) : (
                        <div className="py-2.5 px-3 bg-amber-50/40 rounded-lg text-xs font-bold text-[#58111A]/60 border border-dashed border-amber-200/50 mb-4 flex items-center justify-between">
                          <span>Standard Portion Serving</span>
                          <span className="text-[#58111A] text-sm font-extrabold">Rs. {item.priceFull}</span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Pricing / Custom Quantity Controls bar */}
                  <div className="px-6 pb-6 pt-3 border-t border-[#58111A]/5 flex items-center justify-between bg-white text-left">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-[#58111A]/40 font-bold block leading-none">
                        Current Price
                      </span>
                      <span className="font-sans text-xl font-extrabold text-[#58111A] mt-1">
                        Rs. {price}
                      </span>
                    </div>

                    {/* Highly Interactive Quantitative adjustment */}
                    {qty > 0 ? (
                      <div className="flex items-center space-x-2 bg-[#58111A] text-white rounded-lg p-1 shadow-sm border border-[#D4AF37]/30">
                        <button
                          id={`qty-minus-${item.id}`}
                          onClick={() => updateQuantity(item, -1)}
                          className="p-1 px-2 hover:bg-white/10 rounded font-semibold text-sm transition-colors text-white"
                          title="Reduce quantity by 1"
                        >
                          <Minus className="h-3.5 w-3.5 text-[#D4AF37]" />
                        </button>
                        
                        {/* Instant input to write custom value */}
                        <input
                          id={`qty-input-${item.id}`}
                          type="number"
                          value={qty}
                          onChange={(e) => setQuantityManual(item, parseInt(e.target.value) || 0)}
                          className="w-10 text-center font-sans text-sm font-extrabold bg-transparent text-white border-none outline-none focus:ring-0 select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          id={`qty-plus-${item.id}`}
                          onClick={() => updateQuantity(item, 1)}
                          className="p-1 px-2 hover:bg-white/10 rounded font-semibold text-sm transition-colors text-white"
                          title="Increase quantity by 1"
                        >
                          <Plus className="h-3.5 w-3.5 text-[#D4AF37]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`add-to-slip-${item.id}`}
                        onClick={() => updateQuantity(item, 1)}
                        className="inline-flex items-center space-x-1 px-4.5 py-2.5 bg-[#FAF6F0] hover:bg-[#58111A] text-[#58111A] hover:text-[#FAF6F0] border border-[#58111A]/20 hover:border-[#D4AF37]/35 text-xs font-bold rounded-lg transition-all duration-300 shadow-xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>Select Qty</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dynamic Calculate Receipt Action Trigger & Customer Checkout Section */}
        <div className="mt-16 border-t border-[#D4AF37]/10 pt-16">
          <div className="max-w-xl mx-auto">
            <AnimatePresence mode="wait">
              {isOrdered ? (
                <motion.div
                  key="order-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border-2 border-dashed border-emerald-500/30 p-8 sm:p-10 rounded-2xl shadow-xl text-center space-y-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sans text-2xl font-black text-[#58111A]">Shukriya! Order Placed!</h3>
                    
                    {/* Copyable Order ID Block */}
                    <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#D4AF37]/35 inline-flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-sm mx-auto mt-2">
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] text-[#58111A]/50 uppercase tracking-widest font-black block">YOUR ORDER ID KEY</span>
                        <span className="font-mono text-lg font-black text-amber-800 select-all tracking-wider">
                          {lastOrder?.id}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (lastOrder?.id) {
                            navigator.clipboard.writeText(lastOrder.id);
                            alert(`Order ID ${lastOrder.id} copied to clipboard! Remember to use this to check approval status.`);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#58111A] hover:bg-[#D4AF37] text-white hover:text-[#58111A] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap shadow-xs"
                      >
                        Copy ID Key
                      </button>
                    </div>

                    <p className="font-sans text-xs text-[#58111A]/60 font-semibold bg-amber-50/70 p-3 rounded-lg border border-dashed border-amber-300 max-w-md mx-auto leading-relaxed mt-2.5">
                      📢 <strong>Please Copy & Remember your Order ID!</strong> You will use this key at the top of our website to check real-time status of your breakfast approval.
                    </p>

                    <p className="font-sans text-sm text-[#58111A]/80 leading-relaxed pt-2">
                      Assalam-o-Alaikum, <span className="font-bold">{lastOrder?.customerName}</span>! Your traditional breakfast request is submitted successfully to our live dashboard.
                    </p>
                    <p className="font-sans text-xs text-amber-800 font-semibold bg-amber-50 px-4 py-2 rounded-lg border border-amber-200/50 inline-block mt-3">
                      OrderStatus: Pending Approval by Shahi Khana Admin
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        // Open WhatsApp for original instant contact functionality
                        const getUrduTextMessage = () => {
                          let text = `Assalam-o-Alaikum Shahi Khana Nashta Point & Milk Shop!\n`;
                          text += `I have placed a new order on your system (ID: ${lastOrder?.id}):\n\n`;
                          text += `*Customer:* ${lastOrder?.customerName}\n`;
                          text += `*Method:* ${lastOrder?.orderMethod === 'delivery' ? '🚗 Home Delivery' : '🥡 Takeaway (Self Pickup)'}\n`;
                          if (lastOrder?.orderMethod === 'delivery') {
                            text += `*Address:* ${lastOrder?.customerAddress}\n`;
                          }
                          text += `\n*Order Items:*\n`;
                          lastOrder?.items.forEach((item: any, idx: number) => {
                            text += `${idx + 1}. ${item.name} (${item.portion.toUpperCase()}) x ${item.quantity} = Rs. ${item.total}\n`;
                          });
                          text += `\n*Grand Total: Rs. ${lastOrder?.grandTotal}*\n\n`;
                          text += `Please confirm my order immediately. JazakAllah!`;
                          return text;
                        };
                        window.open(`https://wa.me/923223399774?text=${encodeURIComponent(getUrduTextMessage())}`, '_blank');
                      }}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
                    >
                      Instant Confirm on WhatsApp
                    </button>
                    <button
                      onClick={() => setIsOrdered(false)}
                      className="flex-1 py-3 px-4 bg-[#FAF6F0] hover:bg-[#58111A]/10 text-[#58111A] border border-[#58111A]/20 font-bold rounded-xl text-sm transition-all cursor-pointer"
                    >
                      Order Something Else
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="checkout-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {/* Total Amount Trigger Button */}
                  <div className="text-center">
                    <button
                      id="calculate-bill-anchor-btn"
                      type="button"
                      onClick={() => {
                        if (totalItemsInCart > 0) {
                          setTimeout(() => {
                            const formElement = document.getElementById('checkout-submission-form');
                            if (formElement) {
                              formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              // Optionally focus first input
                              const inputEl = document.querySelector('#checkout-submission-form input');
                              if (inputEl) (inputEl as HTMLInputElement).focus();
                            }
                          }, 100);
                        }
                      }}
                      disabled={totalItemsInCart === 0}
                      className={`w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-10 py-5 rounded-full font-black text-sm sm:text-lg tracking-wide transition-all duration-300 shadow-lg border border-[#D4AF37]/35 ${
                        totalItemsInCart > 0
                          ? 'bg-[#58111A] text-white hover:text-[#58111A] hover:bg-[#D4AF37] hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer'
                          : 'bg-stone-200 text-stone-400 border-stone-300 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {totalItemsInCart > 0 ? (
                        <>
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </span>
                          <span>TOTAL AMOUNT: {isCalculating ? 'Rs. ... (calculating)' : `Rs. ${billingSummary ? billingSummary.grandTotal : 0}`}</span>
                          <span className="ml-2 px-3 py-0.5 bg-[#FAF6F0] text-[#58111A] font-extrabold text-xs rounded-full">
                            {totalItemsInCart} items
                          </span>
                        </>
                      ) : (
                        <span>Total Amount: Rs. 0 (Add items to menu)</span>
                      )}
                    </button>
                    <p className="font-sans text-[#58111A]/50 text-xs mt-3">
                      {totalItemsInCart > 0 
                        ? 'Includes packaging (Rs. 30) & delivery options. Enter your billing details below to place order.'
                        : 'Select your favorite traditional nashta items from the menu card above to enable online checkouts.'}
                    </p>
                  </div>

                  {/* Customer Information inputs - always visible for active order placement */}
                  {totalItemsInCart > 0 && (
                    <form
                      id="checkout-submission-form"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        
                        // Use calculated server-side values primarily
                        let subtotalVal = billingSummary ? billingSummary.subtotal : 0;
                        let pkgVal = billingSummary ? billingSummary.packagingFee : 0;
                        let delVal = billingSummary ? billingSummary.deliveryFee : 0;
                        let grandTotalVal = billingSummary ? billingSummary.grandTotal : 0;
                        let customItems = billingSummary 
                          ? billingSummary.billingItems.map(bi => {
                              const match = menuItems.find(mi => mi.id === bi.id);
                              return {
                                name: match ? match.name : bi.id,
                                portion: bi.portion,
                                quantity: bi.quantity,
                                priceByUnit: bi.pricePerUnit,
                                total: bi.total
                              };
                            })
                          : invoiceItems.map(oi => ({
                              name: oi.item.name,
                              portion: oi.portion,
                              quantity: oi.quantity,
                              priceByUnit: oi.pricePerUnit,
                              total: oi.total
                            }));

                        // If billing summary is not fetched yet for some reason, calculate/fetch it
                        if (!billingSummary || billingSummary.grandTotal <= 0) {
                          try {
                            const res = await fetch('/api/calculate-bill', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ cart, orderMethod, menuItems })
                            });
                            const data = await res.json();
                            if (data.success) {
                              subtotalVal = data.subtotal;
                              pkgVal = data.packagingFee;
                              delVal = data.deliveryFee;
                              grandTotalVal = data.grandTotal;
                              customItems = data.billingItems.map((bi: any) => {
                                const match = menuItems.find(mi => mi.id === bi.id);
                                return {
                                  name: match ? match.name : bi.id,
                                  portion: bi.portion,
                                  quantity: bi.quantity,
                                  priceByUnit: bi.pricePerUnit,
                                  total: bi.total
                                };
                              });
                            }
                          } catch (err) {
                            console.error("Failed fallback backend bill response:", err);
                            // complete fallback to local calculations just as a failsafe
                            subtotalVal = invoiceItems.reduce((acc, curr) => acc + curr.total, 0);
                            pkgVal = subtotalVal > 0 ? 30 : 0;
                            delVal = orderMethod === 'delivery' && subtotalVal > 0 ? 100 : 0;
                            grandTotalVal = subtotalVal + pkgVal + delVal;
                          }
                        }

                        const orderId = `ORD-${Date.now().toString().slice(-5)}`;
                        const newOrder = {
                          id: orderId,
                          customerName: customerName.trim(),
                          customerAddress: orderMethod === 'delivery' ? customerAddress.trim() : 'Takeaway (Self Pick-up)',
                          orderMethod,
                          items: customItems,
                          subtotal: subtotalVal,
                          packagingFee: pkgVal,
                          deliveryFee: delVal,
                          grandTotal: grandTotalVal,
                          status: 'pending' as const,
                          orderDate: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ')',
                        };

                        // Save order state locally
                        const savedStr = localStorage.getItem('shahi_khana_orders');
                        const savedList = savedStr ? JSON.parse(savedStr) : [];
                        localStorage.setItem('shahi_khana_orders', JSON.stringify([newOrder, ...savedList]));

                        // Save order state to Firebase Firestore 
                        try {
                          await setDoc(doc(db, 'orders', orderId), newOrder);
                          console.log('Firebase Order Saved Successfully:', orderId);
                        } catch (err) {
                          console.error('Firebase Order Error:', err);
                          handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
                        }

                        setLastOrder(newOrder);
                        setIsOrdered(true);
                        setCart({});
                        setCustomerName('');
                        setCustomerAddress('');
                      }}
                      className="bg-white border border-[#58111A]/10 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden"
                    >
                      {/* Form top aesthetic */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#58111A]" />
                      
                      <div className="font-sans text-[#58111A] border-b border-[#58111A]/10 pb-4">
                        <h4 className="text-base font-black tracking-tight">Enter Delivery & Contact Information</h4>
                        <p className="text-xs text-[#58111A]/60 mt-1">Please provide accurate verification details for home delivery or takeoff.</p>
                      </div>

                      {/* Order Method Selector */}
                      <div className="space-y-2">
                        <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70">
                          Select Delivery Mode
                        </label>
                        <div className="bg-[#FAF6F0] p-1 rounded-xl flex items-center space-x-1.5 border border-[#58111A]/15">
                          <button
                            type="button"
                            onClick={() => setOrderMethod('takeaway')}
                            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all ${
                              orderMethod === 'takeaway'
                                ? 'bg-[#58111A] text-white shadow-sm font-black'
                                : 'text-[#58111A]/60 hover:text-[#58111A]'
                            }`}
                          >
                            🥡 Takeaway (Self Pickup)
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderMethod('delivery')}
                            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all ${
                              orderMethod === 'delivery'
                                ? 'bg-[#58111A] text-white shadow-sm font-black'
                                : 'text-[#58111A]/60 hover:text-[#58111A]'
                            }`}
                          >
                            🚗 Home Delivery (+Rs. 100)
                          </button>
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="space-y-1.5">
                        <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70 block">
                          Your Name (آپ کا نام) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Asif Chaudhary"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-[#FAF6F0] border border-[#58111A]/15 text-[#58111A] text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white focus:ring-1 focus:ring-[#D4AF37] transition-all"
                        />
                      </div>

                      {/* Customer Address */}
                      <AnimatePresence>
                        {orderMethod === 'delivery' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70 block">
                              Delivery Address (گھر کا پتہ) *
                            </label>
                            <textarea
                              required
                              rows={3}
                              placeholder="House Number, Street address, Wapda Town Phase 2, Multan"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-[#FAF6F0] border border-[#58111A]/15 text-[#58111A] text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center py-4 bg-[#58111A] hover:bg-[#D4AF37] text-[#FAF6F0] hover:text-[#58111A] font-extrabold rounded-xl text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#D4AF37]/35"
                      >
                        Submit Traditional Order ({isCalculating ? "Rs. ..." : `Rs. ${billingSummary ? billingSummary.grandTotal : 0}`})
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty Search State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="font-sans text-base text-[#58111A]/60">
              No Traditional breakfast items match your search. Click "Reset Filters" below.
            </p>
            <button
              id="reset-search"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 inline-flex items-center px-5 py-3.5 bg-[#58111A] text-white rounded-full font-bold text-xs tracking-wider uppercase cursor-pointer hover:bg-[#D4AF37] hover:text-[#58111A] transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
