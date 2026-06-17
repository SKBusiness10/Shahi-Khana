import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, MapPin, Star } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data';
import logoImg from '../assets/images/shahi_khana_monogram_1780834945266.png';

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  onTrackOrder: () => void;
}

export default function Navbar({ onNavigate, activeSection, onTrackOrder }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const whatsappUrl = `https://wa.me/923223399774?text=${encodeURIComponent(
    "Assalam-o-Alaikum! I'd like to place an order or inquire about breakfast on WhatsApp."
  )}`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Royal Menu', id: 'menu' },
    { name: 'Reviews', id: 'reviews' },
  ];

  const handleLinkClick = (id: string) => {
    setIsOpen(false);
    onNavigate(id);
  };

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#58111A]/85 backdrop-blur-md shadow-lg border-b border-[#D4AF37]/20 py-2'
          : 'bg-[#58111A]/75 backdrop-blur-sm border-b border-[#D4AF37]/10 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Desktop Left-aligned Nav Items */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-start">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`navlink-${link.id}`}
                onClick={() => handleLinkClick(link.id)}
                className={`font-sans text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer ${
                  activeSection === link.id
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1'
                    : 'text-[#FAF6F0]/80 hover:text-[#D4AF37] hover:border-b-2 hover:border-[#D4AF37]/40 pb-1'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Centered Monogram & Brand ID (Clicking navigates to Our Story) */}
          <div
            id="brand-logo-container"
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer absolute left-1/2 -translate-x-1/2 z-10 hover:opacity-90 active:scale-95 transition-all duration-200"
            onClick={() => handleLinkClick('story')}
          >
            <img
              src={logoImg}
              alt="Shahi Khana Nashta Point Monogram"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-[#D4AF37]/45 shadow-md transform group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col text-left">
              <span className="font-sans text-sm sm:text-lg font-black tracking-tight text-[#FAF6F0] leading-none">
                SHAHI KHANA
              </span>
              <span className="font-sans text-[8px] sm:text-[9px] uppercase tracking-widest text-[#D4AF37] mt-0.5 leading-none">
                NASHTA & MILK SHOP
              </span>
            </div>
          </div>

          {/* Desktop Right-aligned Essential Action Buttons */}
          <div className="hidden lg:flex items-center justify-end space-x-3 flex-1">
            {/* Quick Map Button */}
            <a
              id="desktop-maps-button"
              href={BUSINESS_DETAILS.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium tracking-wide text-[#FAF6F0] bg-transparent border border-[#FAF6F0]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-md transition-all duration-300"
            >
              <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Directions</span>
            </a>

            {/* Live Status Tracker Button */}
            <button
              id="desktop-status-tracker-btn"
              onClick={() => {
                setIsOpen(false);
                onTrackOrder();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black tracking-wide bg-[#D4AF37] hover:bg-[#FAF6F0] text-[#58111A] rounded-md transition-all duration-300 cursor-pointer shadow-xs border border-[#D4AF37]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#58111A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#58111A]"></span>
              </span>
              <span>🔍 Track Order</span>
            </button>

            {/* Calling trigger */}
            <a
              id="desktop-call-button"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#58111A] bg-[#D4AF37] hover:bg-[#FAF6F0] rounded-md transition-all duration-300 shadow-sm"
            >
              <Phone className="h-3.5 w-3.5 animate-pulse" />
              <span>WhatsApp Call</span>
            </a>
          </div>

          {/* Medium and Tablet View Right Side Links */}
          <div className="hidden md:flex lg:hidden items-center justify-end space-x-2.5 flex-1">
            <button
              id="tablet-status-tracker-btn"
              onClick={onTrackOrder}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-black bg-[#D4AF37] text-[#58111A] rounded-md hover:bg-white transition-all cursor-pointer border border-[#D4AF37]"
            >
              <span>🔍 Track Status</span>
            </button>
            <a
              id="desktop-tablet-call-button"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#58111A] bg-[#D4AF37] rounded-md"
            >
              <Phone className="h-3 w-3 mr-1" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center justify-between w-full">
            {/* Mobile call shortcut (left hand side on mobile, sandwich is right) */}
            <a
              id="mobile-nav-call"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-[#D4AF37] text-[#58111A] rounded-full hover:bg-white transition-colors"
              title="WhatsApp Call"
            >
              <Phone className="h-4 w-4" />
            </a>

            {/* Invisible spacer so absolute Centered branding does not overlay standard buttons */}
            <div className="w-12 h-1 block sm:hidden" />

            <button
              id="mobile-menu-hamburger"
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#FAF6F0] p-2 rounded-md hover:bg-white/10 outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer-overlay"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#58111A] border-b border-[#D4AF37]/20 shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  id={`moblink-${link.id}`}
                  onClick={() => handleLinkClick(link.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-md font-sans text-base font-medium tracking-wide ${
                    activeSection === link.id
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-semibold'
                      : 'text-[#FAF6F0] hover:bg-white/5 hover:text-[#D4AF37]'
                  }`}
                >
                  {link.name}
                </button>
              ))}

              {/* Order Status Checker Trigger Mobile */}
              <button
                id="moblink-status-tracker"
                onClick={() => {
                  setIsOpen(false);
                  onTrackOrder();
                }}
                className="block w-full text-left px-3 py-2.5 rounded-md font-sans text-base font-extrabold tracking-wide text-[#D4AF37] hover:bg-white/5"
              >
                🔍 Live Order Tracker Status
              </button>

              <div className="pt-4 border-t border-[#D4AF37]/10 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <a
                  id="mob-action-directions"
                  href={BUSINESS_DETAILS.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex justify-center items-center space-x-2 py-3 border border-[#D4AF37]/55 text-[#FAF6F0] rounded-md font-medium text-sm transition-colors"
                >
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  <span>Get Google Maps Directions</span>
                </a>
                <a
                  id="mob-action-call"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex justify-center items-center space-x-2 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-[#58111A] font-semibold rounded-md text-sm transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>WhatsApp Call to Order</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
