import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, CheckCircle, Clock, XCircle, AlertCircle, 
  ShoppingBag, Calendar, User, MapPin, X, HelpCircle, ClipboardCheck
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

interface OrderItem {
  name: string;
  portion: 'half' | 'full';
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  customerName: string;
  customerAddress: string;
  orderMethod: 'takeaway' | 'delivery';
  items: OrderItem[];
  subtotal: number;
  packagingFee: number;
  deliveryFee: number;
  grandTotal: number;
  status: 'pending' | 'confirmed' | 'rejected';
  orderDate: string;
}

export default function OrderStatusModal({ isOpen, onClose, initialOrderId = '' }: OrderStatusModalProps) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [errorText, setErrorText] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      handleSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = async (idToSearch?: string) => {
    const id = (idToSearch || orderIdInput).trim().toUpperCase();
    if (!id) {
      setErrorText('Please enter a valid Order ID key.');
      setSearchedOrder(null);
      setHasSearched(false);
      return;
    }

    try {
      // 1. Query Firestore DB
      const docRef = doc(db, 'orders', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as Order;
        setSearchedOrder(data);
        setErrorText('');
      } else {
        // 2. Query Fallback Local Storage
        const savedOrdersStr = localStorage.getItem('shahi_khana_orders');
        if (savedOrdersStr) {
          const orders: Order[] = JSON.parse(savedOrdersStr);
          const found = orders.find(ord => ord.id.toUpperCase() === id);
          if (found) {
            setSearchedOrder(found);
            setErrorText('');
          } else {
            setSearchedOrder(null);
            setErrorText(`Order ID "${id}" was not found in our records. Please verify the code.`);
          }
        } else {
          setSearchedOrder(null);
          setErrorText(`Order ID "${id}" was not found in our records. Please verify the code.`);
        }
      }
    } catch (e) {
      console.error('Firestore query failed, searching local storage:', e);
      try {
        const savedOrdersStr = localStorage.getItem('shahi_khana_orders');
        if (savedOrdersStr) {
          const orders: Order[] = JSON.parse(savedOrdersStr);
          const found = orders.find(ord => ord.id.toUpperCase() === id);
          if (found) {
            setSearchedOrder(found);
            setErrorText('');
          } else {
            setSearchedOrder(null);
            setErrorText(`Order ID "${id}" was not found. Please try again.`);
          }
        } else {
          setSearchedOrder(null);
          setErrorText('Error retrieving orders. Please try again.');
        }
      } catch (err) {
        setSearchedOrder(null);
        setErrorText('Error retrieving orders database. Please check your network.');
      }
    }
    setHasSearched(true);
  };

  const clearForm = () => {
    setOrderIdInput('');
    setSearchedOrder(null);
    setHasSearched(false);
    setErrorText('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Dark glassy backdrop backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#3a060a]/70 backdrop-blur-md"
        />

        {/* Modal content viewport */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white rounded-2xl border border-[#D4AF37]/35 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top aesthetic gold and crimson bars */}
          <div className="h-2 w-full bg-gradient-to-r from-[#58111A] via-[#D4AF37] to-[#58111A]" />

          {/* Close Action top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 hover:bg-[#58111A] text-stone-500 hover:text-white transition-all cursor-pointer"
            title="Close trackers"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Main Body with scrolling support if needed */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Header / Brand stamp */}
            <div className="text-center space-y-1.5 pt-2">
              <span className="font-sans text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block">
                Shahi Khana Nashta Point & Milk Shop
              </span>
              <h3 className="font-sans text-2xl font-black text-[#58111A] tracking-tight">
                🔍 Live Order Tracker
              </h3>
              <p className="font-sans text-xs text-[#58111A]/60 max-w-sm mx-auto leading-relaxed">
                Check status of digital bookings, takeaway approvals, and home delivery shipments in real-time.
              </p>
            </div>

            {/* Input Search Form Area */}
            <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#58111A]/10 space-y-3">
              <label className="font-sans text-[11px] font-black text-[#58111A]/85 uppercase tracking-wider block">
                Enter your unique Order ID key:
              </label>
              
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#58111A]/40 font-mono text-xs font-bold">
                    ID:
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-12345"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#58111A]/15 text-sm text-[#58111A] font-mono font-bold focus:outline-none focus:border-[#D4AF37] bg-white transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal"
                  />
                </div>
                {searchedOrder && orderIdInput.trim().toUpperCase() === searchedOrder.id.toUpperCase() ? (
                  searchedOrder.status === 'confirmed' ? (
                    <button
                      onClick={() => handleSearch()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Order Approved"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>✔ Approved</span>
                    </button>
                  ) : searchedOrder.status === 'rejected' ? (
                    <button
                      onClick={() => handleSearch()}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Order Rejected"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>✘ Rejected</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSearch()}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Order Pending"
                    >
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Pending</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleSearch()}
                    className="px-5 py-2.5 bg-[#58111A] hover:bg-[#D4AF37] text-white hover:text-[#58111A] text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Search className="h-4 w-4" />
                    <span>Verify</span>
                  </button>
                )}
              </div>

              {!hasSearched && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#58111A]/50 font-medium">
                    Order IDs look like <span className="font-mono font-bold text-amber-800 bg-[#5d111a]/5 px-1 py-0.5 rounded">ORD-XXXXX</span>
                  </span>
                  <button
                    onClick={onClose}
                    className="text-[11px] font-bold text-[#58111A] hover:text-[#D4AF37] transition-all underline shrink-0"
                  >
                    Yet to Order &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Error notifications */}
            {errorText && (
              <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2.5 text-xs font-sans">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{errorText}</p>
                </div>
                <div className="pt-1.5 flex gap-2">
                  <button
                    onClick={clearForm}
                    className="text-[10px] font-black uppercase text-[#58111A] hover:text-[#D4AF37] transition-colors"
                  >
                    Clear Search
                  </button>
                  <span className="text-[#5a111a]/20 text-[10px]">&bull;</span>
                  <button
                    onClick={onClose}
                    className="text-[10px] font-black uppercase text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    I want to Order Now
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Search Results Container */}
            <AnimatePresence mode="wait">
              {searchedOrder && (
                <motion.div
                  key={searchedOrder.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-[#58111A]/10 rounded-xl overflow-hidden shadow-sm space-y-4 pt-1"
                >
                  {/* Status Visual Banner */}
                  <div className={`p-4 text-center rounded-lg ${
                    searchedOrder.status === 'confirmed' 
                      ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300/40' 
                      : searchedOrder.status === 'rejected'
                        ? 'bg-red-50 text-red-800 border-2 border-red-300/40'
                        : 'bg-amber-50 text-amber-800 border-2 border-amber-300/40'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      {searchedOrder.status === 'confirmed' && (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      )}
                      {searchedOrder.status === 'rejected' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {searchedOrder.status === 'pending' && (
                        <Clock className="h-5 w-5 text-amber-600 animate-pulse" />
                      )}
                      <span className="text-sm font-black uppercase tracking-wider font-sans">
                        {searchedOrder.status === 'confirmed' && 'Confirmed & Approved'}
                        {searchedOrder.status === 'rejected' && 'Order Rejected'}
                        {searchedOrder.status === 'pending' && 'Pending Approval'}
                      </span>
                    </div>
                    <p className="font-sans text-[11px] opacity-90 max-w-sm mx-auto leading-relaxed">
                      {searchedOrder.status === 'confirmed' && 'Your breakfast order has been reviewed and approved by Shahi Khana.'}
                      {searchedOrder.status === 'rejected' && 'We are unable to process this order. Please contact our support team on WhatsApp.'}
                      {searchedOrder.status === 'pending' && 'Our team has received your order request and is currently verifying the details.'}
                    </p>
                  </div>

                  {/* Customer Meta Row info */}
                  <div className="px-1.5 space-y-2.5 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-2.5 bg-[#FAF6F0] rounded-lg border border-[#58111A]/5 space-y-0.5">
                        <span className="text-[10px] text-[#58111A]/40 uppercase tracking-widest font-bold block">Customer Name</span>
                        <span className="font-bold text-[#58111A] flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#D4AF37]" />
                          {searchedOrder.customerName}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#FAF6F0] rounded-lg border border-[#58111A]/5 space-y-0.5">
                        <span className="text-[10px] text-[#58111A]/40 uppercase tracking-widest font-bold block">Date & Time</span>
                        <span className="font-medium text-[#58111A]/85 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
                          {searchedOrder.orderDate}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#FAF6F0] rounded-lg border border-[#58111A]/5 space-y-1">
                      <span className="text-[10px] text-[#58111A]/40 uppercase tracking-widest font-bold block">Delivery Method & Shipping</span>
                      <span className="font-bold text-[#58111A] block">
                        {searchedOrder.orderMethod === 'delivery' ? '🚗 Home Delivery' : '🥡 Takeaway (Self Pickup)'}
                      </span>
                      <p className="text-[11px] text-[#58111A]/70 leading-relaxed bg-white p-1.5 rounded border border-[#58111a]/8">
                        <MapPin className="h-3 w-3 inline mr-1 text-[#D4AF37]" />
                        {searchedOrder.customerAddress}
                      </p>
                    </div>

                    {/* Ordered Items loop */}
                    <div className="border border-[#58111a]/10 rounded-lg p-3 space-y-2">
                      <span className="text-[10px] text-[#58111A]/40 uppercase tracking-widest font-black block border-b border-[#58111a]/5 pb-1 select-none">
                        Ordered Delicacies
                      </span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {searchedOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[#5a111a]">
                              {it.name} <span className="text-[9px] uppercase font-semibold text-[#D4AF37]">({it.portion})</span>
                            </span>
                            <span className="font-mono text-[#58111A] font-semibold">
                              {it.quantity} qty = Rs. {it.total}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#58111a]/10 flex justify-between items-center text-sm font-black text-[#58111A]">
                        <span>Grand Total Paid/Due</span>
                        <span className="text-[#D4AF37] bg-[#58111A] px-2.5 py-1 rounded text-xs select-all">
                          Rs. {searchedOrder.grandTotal}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Direct Ping options on Status checker */}
                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => {
                        let urduText = `Assalam-o-Alaikum Shahi Khana! I'm checking status on my Web Order (ID: ${searchedOrder.id}) total Rs. ${searchedOrder.grandTotal}.\n`;
                        urduText += `Current status: *${searchedOrder.status.toUpperCase()}*.\n`;
                        urduText += `Please update me. JazakAllah!`;
                        window.open(`https://wa.me/923223399774?text=${encodeURIComponent(urduText)}`, '_blank');
                      }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-all text-center flex items-center justify-center gap-1"
                    >
                      <span>Ping on WhatsApp</span>
                    </button>
                    <button
                      onClick={clearForm}
                      className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-[#58111A] font-bold rounded-xl text-xs uppercase tracking-wide transition-colors"
                    >
                      Trace Another ID
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Footer of Modal */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 text-center text-[10px] font-sans text-stone-400 select-none">
            Thank you for choosing Shahi Khana. Pure Desi Taste Authenticated.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
