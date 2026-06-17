import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircleCode, CheckCircle2 } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phoneNumber) return;
    
    // Simulate beautiful form submission response with true local React state
    setSubmitted(true);
    setName('');
    setPhoneNumber('');
    setMessage('');
  };

  // Pre-compiled high-class WhatsApp text
  const whatsappUrl = `https://wa.me/923223399774?text=${encodeURIComponent(
    "Assalam-o-Alaikum! I want to inquire about ordering delicious breakfast / dairy products from Shahi Khana Nashta Point."
  )}`;

  return (
    <section id="contact" className="py-24 bg-white border-t border-[#D4AF37]/10 relative">
      {/* Visual background grid texture */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#58111A_0.6px,transparent_0.6px)] [background-size:24px_24px] opacity-2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Contact Heading Container */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-sans text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
            Let Us Serve You Royalty
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#58111A] tracking-tight mt-2 mb-4">
            Locate Us & Order Today
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-6" />
          <p className="font-sans text-[#58111A]/80 text-sm sm:text-base tracking-wide leading-relaxed">
            Placing an order is simple. Give us a direct call, message us on WhatsApp for assistance, or visit our premium outlet in Wapda Town Multan.
          </p>
        </div>

        {/* Form and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Block - Quick Info Cards (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              
              {/* Phone Direct (Convert to interactive WhatsApp call/message) */}
              <a
                id="contact-info-phone"
                href={`https://wa.me/923223399774?text=${encodeURIComponent("Assalam-o-Alaikum! I want to contact you on WhatsApp regarding catering/orders.")}`}
                target="_blank"
                rel="noreferrer"
                className="block p-6 rounded-xl border border-[#58111A]/10 bg-[#FAF6F0] hover:border-[#D4AF37]/50 shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-[#58111A] text-[#D4AF37] rounded-lg group-hover:scale-105 transition-transform">
                    <Phone className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#58111A]/50 block">
                      WhatsApp Call & Chat
                    </span>
                    <h4 className="font-sans text-lg font-bold text-[#58111A] group-hover:text-[#D4AF37] transition-colors">
                      {BUSINESS_DETAILS.phone}
                    </h4>
                    <span className="font-sans text-xs text-[#58111A]/70 block">
                      Send a message or call on WhatsApp instantly
                    </span>
                  </div>
                </div>
              </a>

              {/* Exact Location */}
              <a
                id="contact-info-maps"
                href={BUSINESS_DETAILS.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="block p-6 rounded-xl border border-[#58111A]/10 bg-[#FAF6F0] hover:border-[#D4AF37]/50 shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-[#58111A] text-[#D4AF37] rounded-lg group-hover:scale-105 transition-transform">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#58111A]/50 block">
                      Premium Multan Outlet
                    </span>
                    <h4 className="font-sans text-base font-bold text-[#58111A] leading-snug">
                      Shop #6, M-Block, Wapda Town Phase 2, Multan
                    </h4>
                    <span className="font-sans text-xs text-amber-600 block font-semibold mt-1">
                      Open in Google Maps &rarr;
                    </span>
                  </div>
                </div>
              </a>

              {/* Business Hours */}
              <div
                id="contact-info-hours"
                className="p-6 rounded-xl border border-[#58111A]/10 bg-[#FAF6F0] shadow-sm"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-[#58111A] text-[#D4AF37] rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#58111A]/50 block">
                      Operating Hours
                    </span>
                    <h4 className="font-sans text-base font-bold text-[#58111A]">
                      {BUSINESS_DETAILS.hours}
                    </h4>
                    <span className="font-sans text-xs text-[#58111A]/70 block">
                      Cooking authentic breakfast from dawn to dusk
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Premium WhatsApp Assistant Instant Button */}
            <a
              id="whatsapp-chat-button"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex justify-center items-center space-x-2.5 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-[#FAF6F0] font-sans font-bold rounded-xl shadow-md transition-all duration-300 cursor-pointer text-base"
            >
              <MessageCircleCode className="h-5.5 w-5.5" />
              <span>Inquire via Instant WhatsApp</span>
            </a>
          </div>

          {/* Right Block - Classy Message Form (7 Columns) */}
          <div className="lg:col-span-1" /> {/* Simple negative spacing column */}
          
          <div className="lg:col-span-6 bg-[#FAF6F0] border border-[#58111A]/10 p-8 sm:p-10 rounded-2xl shadow-sm flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  id="contact-submit-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <h3 className="font-sans text-xl font-bold text-[#58111A] tracking-tight">
                    Submit a Guest Inquiry
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70">
                      Your Full Name *
                    </label>
                    <input
                      id="input-guest-name"
                      type="text"
                      required
                      placeholder="e.g. Hammad Khan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#58111A]/15 text-[#58111A] focus:outline-none focus:border-[#D4AF37] text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70">
                      Phone Number (For Callback) *
                    </label>
                    <input
                      id="input-guest-phone"
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#58111A]/15 text-[#58111A] focus:outline-none focus:border-[#D4AF37] text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#58111A]/70">
                      Your Request or Message (Optional)
                    </label>
                    <textarea
                      id="input-guest-msg"
                      rows={4}
                      placeholder="What traditional items are you looking to order?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-[#58111A]/15 text-[#58111A] focus:outline-none focus:border-[#D4AF37] text-sm resize-none"
                    />
                  </div>

                  <button
                    id="btn-submit-inquiry"
                    type="submit"
                    className="w-full inline-flex justify-center items-center space-x-2 py-3.5 bg-[#58111A] hover:bg-[#340b10] text-[#FAF6F0] font-bold rounded-lg text-sm tracking-wide transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4 text-[#D4AF37]" />
                    <span>Send Royal Inquiry</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  id="form-success-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="inline-flex p-4 bg-[#D4AF37]/10 text-amber-500 rounded-full border border-[#D4AF37]/35 mb-2 scale-105">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-[#58111A] tracking-tight">
                    Inquiry Received Successfully!
                  </h3>
                  <p className="font-sans text-[#58111A]/80 text-sm max-w-sm mx-auto leading-relaxed">
                    Thank you for contacting Shahi Khana Nashta Point. Our manager will call you back shortly within the next 15 minutes to take your traditional order!
                  </p>
                  <button
                    id="btn-back-form"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 inline-flex px-6 py-2.5 bg-[#58111A] text-white font-semibold rounded-md text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Send Another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
