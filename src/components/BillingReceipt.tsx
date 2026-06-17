import { useState, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, Minus, Plus, Trash2, MessageCircleCode, 
  Phone, HelpCircle, UtensilsCrossed, Truck, MapPin
} from 'lucide-react';
import { MENU_ITEMS, BUSINESS_DETAILS } from '../data';
import { MenuItem } from '../types';

interface BillingReceiptProps {
  menuItems?: MenuItem[];
  cart: Record<string, number>;
  setCart: Dispatch<SetStateAction<Record<string, number>>>;
  selectedPortions: Record<string, 'half' | 'full'>;
  setSelectedPortions: Dispatch<SetStateAction<Record<string, 'half' | 'full'>>>;
  onGoToMenu: () => void;
}

export default function BillingReceipt({
  menuItems = MENU_ITEMS,
  cart,
  setCart,
  selectedPortions,
  setSelectedPortions,
  onGoToMenu
}: BillingReceiptProps) {
  const [orderMethod, setOrderMethod] = useState<'takeaway' | 'delivery'>('takeaway');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Compile active bill list
  const getBillingItems = () => {
    const list: Array<{
      item: MenuItem;
      portion: 'half' | 'full';
      quantity: number;
      pricePerUnit: number;
      total: number;
      key: string;
    }> = [];

    Object.entries(cart).forEach(([key, val]) => {
      const qty = val as number;
      if (qty <= 0) return;
      const [itemId, portion] = key.split('-') as [string, 'half' | 'full'];
      const item = menuItems.find(m => m.id === itemId);
      if (!item) return;

      const pricePerUnit = portion === 'half' && item.priceHalf ? item.priceHalf : item.priceFull;
      list.push({
        item,
        portion,
        quantity: qty,
        pricePerUnit,
        total: pricePerUnit * qty,
        key
      });
    });

    return list;
  };

  const updateQuantity = (item: MenuItem, portion: 'half' | 'full', delta: number) => {
    const cartKey = `${item.id}-${portion}`;
    const qty = cart[cartKey] || 0;
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

  const clearSlip = () => {
    setCart({});
  };

  const invoiceItems = getBillingItems();
  const subtotal = invoiceItems.reduce((acc, current) => acc + current.total, 0);
  const packagingFee = subtotal > 0 ? 30 : 0; // standard Eco-Safe container fee
  const deliveryFee = orderMethod === 'delivery' && subtotal > 0 ? 100 : 0; // Wapda Town Multan special rider charge
  const grandTotal = subtotal + packagingFee + deliveryFee;

  // Compile WhatsApp text message beautifully
  const getOrderTextMessage = () => {
    let text = `Assalam-o-Alaikum Shahi Khana Nashta Point & Milk Shop!\n`;
    text += `I would like to place a new breakfast order:\n\n`;
    text += `*Order Mode:* ${orderMethod === 'delivery' ? '🚗 Home Delivery' : '🥡 Takeaway (Self Pickup)'}\n`;
    if (orderMethod === 'delivery' && deliveryAddress.trim()) {
      text += `*Delivery Address:* ${deliveryAddress.trim()}\n`;
    }
    text += `\n--------------------------\n`;
    
    invoiceItems.forEach((order, idx) => {
      const portionText = order.item.hasHalfOption ? ` (${order.portion.toUpperCase()})` : '';
      text += `${idx + 1}. ${order.item.name}${portionText} x ${order.quantity} = Rs. ${order.total}\n`;
    });

    text += `\n--------------------------\n`;
    text += `Subtotal: Rs. ${subtotal}\n`;
    text += `Eco-Packaging Box: Rs. ${packagingFee}\n`;
    if (orderMethod === 'delivery') {
      text += `Wapda Town Delivery Charge: Rs. ${deliveryFee}\n`;
    }
    text += `*Estimated Grand Total: Rs. ${grandTotal}*\n`;
    text += `--------------------------\n\n`;
    text += `Please process my order. Thank you!`;

    return text;
  };

  const whatsappOrderUrl = `https://wa.me/923223399774?text=${encodeURIComponent(getOrderTextMessage())}`;

  return (
    <section id="billing-slip-section" className="py-20 bg-[#FAF6F0] border-t border-[#58111A]/10 relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#58111A_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-[0.02] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-sans text-xs font-bold tracking-widest text-[#D4AF37] uppercase block">
            Royal Instatake Order Handler
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#58111A] tracking-tight mt-1">
            Calculated Billing Receipt
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-3" />
        </div>

        {/* The Receipt container layout */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#58111A]/20 shadow-xl p-5 sm:p-8 relative overflow-hidden">
          {/* Visual decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#58111A]" />
          
          {/* Receipt Header details */}
          <div className="text-center pb-6 border-b border-[#58111A]/10 mt-2">
            <div className="inline-flex p-3 bg-[#58111A]/5 text-[#58111A] rounded-full mb-3">
              <Receipt className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h3 className="font-sans text-xl font-bold text-[#58111A]">
              Shahi Khana Nashta Point & Milk Shop
            </h3>
            <p className="font-sans text-xs text-[#58111A]/60 font-semibold uppercase tracking-widest mt-1">
              Shop #6, M-Block, Wapda Town Phase 2, Multan
            </p>
          </div>

          {/* Delivery or Takeaway selection switcher */}
          <div className="py-6 border-b border-[#58111A]/10">
            <label className="font-sans text-xs font-bold uppercase tracking-widest text-[#58111A]/50 block text-center mb-3">
              Select Your Preferred Delivery Code
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button
                id="select-takeaway-btn"
                type="button"
                onClick={() => setOrderMethod('takeaway')}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  orderMethod === 'takeaway'
                    ? 'bg-[#58111A] text-white border-[#58111A] shadow-md scale-102'
                    : 'bg-white text-[#58111A]/70 border-[#58111A]/15 hover:bg-[#58111A]/5'
                }`}
              >
                <UtensilsCrossed className="h-4 w-4 text-[#D4AF37]" />
                <span>Self Pickup (Takeaway)</span>
              </button>

              <button
                id="select-delivery-btn"
                type="button"
                onClick={() => setOrderMethod('delivery')}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  orderMethod === 'delivery'
                    ? 'bg-[#58111A] text-white border-[#58111A] shadow-md scale-102'
                    : 'bg-white text-[#58111A]/70 border-[#58111A]/15 hover:bg-[#58111A]/5'
                }`}
              >
                <Truck className="h-4 w-4 text-[#D4AF37]" />
                <span>Home Delivery</span>
              </button>
            </div>

            {/* Address input block if Home Delivery is selected */}
            {orderMethod === 'delivery' && (
              <div className="mt-5 max-w-md mx-auto space-y-2 animate-fade-in">
                <label className="font-sans text-xs font-semibold text-[#58111A]/70 block flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Enter Delivery Location: (Wapda Town Phase 2 Area Only)</span>
                </label>
                <input
                  id="delivery-address-input"
                  type="text"
                  placeholder="Street / House Number, Bloc, Wapda Town Phase 2"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#58111A]/15 rounded-xl px-4 py-3 placeholder-[#58111A]/40 text-sm text-[#58111A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            )}
          </div>

          {/* Purchased Items lists */}
          <div className="py-6 space-y-4">
            {invoiceItems.length > 0 ? (
              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] uppercase font-black text-[#58111A]/40 tracking-widest pb-1 border-b border-[#58111A]/5">
                  <span className="col-span-6">Item Selection</span>
                  <span className="col-span-2 text-center">Unit Price</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Row Total</span>
                </div>

                <AnimatePresence>
                  {invoiceItems.map((order) => (
                    <motion.div
                      key={order.key}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-12 gap-2 py-2 items-center text-sm font-sans border-b border-[#58111A]/5 text-[#58111A]"
                    >
                      {/* Name and portion */}
                      <div className="col-span-12 sm:col-span-6 flex items-start space-x-2">
                        <span className="p-1 px-1.5 bg-[#58111A]/5 text-[#58111A] text-[10px] font-extrabold rounded mt-0.5">
                          {order.item.category === 'breakfast' ? 'N' : order.item.category === 'bread' ? 'B' : 'D'}
                        </span>
                        <div>
                          <span className="font-semibold block sm:inline">{order.item.name}</span>
                          {order.item.hasHalfOption && (
                            <span className="sm:ml-1.5 px-1.5 py-0.5 bg-amber-50 text-[10px] font-bold text-amber-800 rounded border border-amber-100 uppercase inline-block sm:inline">
                              {order.portion}
                            </span>
                          )}
                          <span className="block text-[10px] text-amber-700/80 font-semibold font-serif leading-none mt-1">
                            {order.item.nameUrdu}
                          </span>
                        </div>
                      </div>

                      {/* Calculations parameters */}
                      <div className="col-span-4 sm:col-span-2 text-left sm:text-center text-xs text-[#58111A]/60">
                        <span className="sm:hidden font-semibold mr-1">Unit Price:</span>Rs. {order.pricePerUnit}
                      </div>
                      
                      <div className="col-span-4 sm:col-span-2 text-center">
                        <div className="flex items-center justify-center space-x-1.5 bg-[#58111A]/5 rounded-lg py-1 px-2.5 max-w-[80px] mx-auto">
                          <button
                            id={`qty-decrease-${order.key}`}
                            onClick={() => updateQuantity(order.item, order.portion, -1)}
                            className="p-0.5 hover:bg-[#58111A]/10 text-[#58111A]/70 rounded transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-sm min-w-[12px]">{order.quantity}</span>
                          <button
                            id={`qty-increase-${order.key}`}
                            onClick={() => updateQuantity(order.item, order.portion, 1)}
                            className="p-0.5 hover:bg-[#58111A]/10 text-[#58111A]/70 rounded transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-4 sm:col-span-2 text-right font-bold text-sm text-[#58111A]">
                        Rs. {order.total}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Summary Rows */}
                <div className="pt-4 space-y-2 border-t border-[#58111A]/10 text-sm font-sans">
                  <div className="flex justify-between text-[#58111A]/75">
                    <span>Subtotal Items Selection:</span>
                    <span className="font-semibold">Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#58111A]/75">
                    <span className="flex items-center space-x-1">
                      <span>Premium Packaging Box:</span>
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-bold uppercase">Eco-Safe</span>
                    </span>
                    <span className="font-semibold">Rs. {packagingFee}</span>
                  </div>
                  {orderMethod === 'delivery' && (
                    <div className="flex justify-between text-[#58111A]/75 animate-fade-in">
                      <span>Rider Delivery Service (Wapda Town):</span>
                      <span className="font-semibold">Rs. {deliveryFee}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#58111A]/10 flex justify-between items-center text-lg text-[#58111A] font-extrabold">
                    <span>Estimated Total Bill:</span>
                    <span className="text-xl text-[#58111A] bg-amber-400/20 px-3 py-1.5 rounded-lg border border-amber-400/35">
                      Rs. {grandTotal}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <HelpCircle className="h-10 w-10 text-amber-500/35 mx-auto" />
                <p className="font-sans text-xs sm:text-sm text-[#58111A]/60 font-semibold uppercase tracking-wider">
                  No Delicacies Selected Yet
                </p>
                <p className="font-sans text-xs text-[#58111A]/50 max-w-sm mx-auto">
                  Click the button below to open our royal breakfast menu, configure your favorite items with custom portion sizes, and view your instantly calculated bill!
                </p>
                <div className="pt-2">
                  <button
                    id="receipt-go-menu-btn"
                    onClick={onGoToMenu}
                    className="inline-flex items-center space-x-1 px-6 py-2.5 bg-[#58111A] text-white rounded-lg text-xs font-bold hover:bg-[#D4AF37] hover:text-[#58111A] transition-colors cursor-pointer"
                  >
                    <span>Browse Dishes & Prices</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action footer triggers for sending or canceling orders */}
          {invoiceItems.length > 0 && (
            <div className="mt-4 pt-6 border-t border-[#58111A]/10 space-y-3">
              <div className="flex flex-col gap-4">
                
                {/* Send via WhatsApp */}
                <a
                  id="final-receipt-order-whatsapp"
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex justify-center items-center space-x-2 py-4 bg-[#25D366] hover:bg-[#1ebd50] text-white rounded-xl font-bold font-sans text-sm shadow-md transition-all cursor-pointer"
                >
                  <MessageCircleCode className="h-5 w-5" />
                  <span>Send Bill & Place Order via WhatsApp</span>
                </a>

              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  id="final-clear-receipt-slip"
                  onClick={clearSlip}
                  className="inline-flex items-center space-x-1.5 text-xs text-red-500 hover:text-red-700 font-bold uppercase transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Selection</span>
                </button>
                <span className="font-sans text-[10px] text-[#58111A]/40 font-bold uppercase tracking-widest block">
                  Quick Deliveries in Multan
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
