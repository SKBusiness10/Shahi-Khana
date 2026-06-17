import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import MenuSection from './components/MenuSection';
import ReviewsSection from './components/ReviewsSection';
import ContactSection from './components/ContactSection';
import AdminDashboard from './components/AdminDashboard';
import OrderStatusModal from './components/OrderStatusModal';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { MENU_ITEMS, BUSINESS_DETAILS } from './data';
import { MenuItem } from './types';
import logoImg from './assets/images/shahi_khana_monogram_1780834945266.png';
import { Milk, Award, MapPin, Phone, Instagram, Facebook, Lock, Search } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'menu' | 'inquiry' | 'admin'>('home');
  const [activeSection, setActiveSection] = useState('home');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedPortions, setSelectedPortions] = useState<Record<string, 'half' | 'full'>>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [isLiveMenu, setIsLiveMenu] = useState<boolean>(false);

  // Synchronize menu items dynamically from Firestore, with graceful fallback
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
        if (!snapshot.empty) {
          const items: MenuItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push({ ...docSnap.data() as MenuItem, id: docSnap.id });
          });
          // Preserve relative ordering
          items.sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, '')) || 999;
            const numB = parseInt(b.id.replace(/\D/g, '')) || 999;
            return numA - numB;
          });
          setMenuItems(items);
          setIsLiveMenu(true);
        } else {
          setMenuItems(MENU_ITEMS);
          setIsLiveMenu(false);
        }
      }, (error) => {
        console.error('Firestore dynamic menu query error:', error);
        setIsLiveMenu(false);
      });
    } catch (err) {
      console.error('Firestore subscription startup error:', err);
      setIsLiveMenu(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
  // High fidelity Tracking Portal automatically triggered at startup, checking sessionStorage
  const [showStatusPopup, setShowStatusPopup] = useState(() => {
    try {
      const dismissed = sessionStorage.getItem('shahi_khana_status_dismissed');
      return dismissed ? false : true;
    } catch (e) {
      return true;
    }
  });

  // Unified scroll monitor to find active section depending on vertical position
  useEffect(() => {
    if (currentPage !== 'home') return;

    const handleScroll = () => {
      const sections = ['home', 'story', 'reviews'];
      const scrollPosition = window.scrollY + 180; // Offset for navbar

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'admin') {
      setCurrentPage('admin');
      setActiveSection('admin');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else if (sectionId === 'menu') {
      setCurrentPage('menu');
      setActiveSection('menu');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else if (sectionId === 'inquiry' || sectionId === 'contact') {
      setCurrentPage('inquiry');
      setActiveSection('inquiry');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      setCurrentPage('home');
      setActiveSection(sectionId);
      // Wait a tiny bit for state render before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop - 80; // Margin offset below fixed navbar
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
  };

  return (
    <div className="bg-[#FAF6F0] min-h-screen text-[#58111A] selection:bg-[#D4AF37] selection:text-[#58111A]">
      {/* 25% Transparent Elegant Glassy Navbar */}
      <Navbar 
        onNavigate={handleNavigate} 
        activeSection={activeSection} 
        onTrackOrder={() => setShowStatusPopup(true)}
      />

      {/* Main Single Page Web Sections */}
      <main>
        {currentPage === 'home' ? (
          <>
            {/* Interactive Hero Banner with call triggers */}
            <HeroSection onExploreMenu={() => handleNavigate('menu')} />

            {/* Narrative Story describing Shahi Khana */}
            <AboutSection />

            {/* Teaser Section directing to Menu Page */}
            <section className="py-20 bg-[#FAF6F0] border-t border-[#D4AF37]/15 relative overflow-hidden">
              <div className="absolute inset-0 z-0 bg-[radial-gradient(#58111A_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />
              <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
                <span className="font-sans text-xs font-bold tracking-widest text-[#D4AF37] uppercase block">
                  Royal Culinary Heritage
                </span>
                <h3 className="font-sans text-3xl sm:text-4xl font-extrabold text-[#58111A] tracking-tight">
                  Craving Traditional Parathas, Halwa Puri, or Fresh Creamy Milk?
                </h3>
                <p className="font-sans text-[#58111A]/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                  We prepare our breakfast daily using 100% organic Desi Ghee & pure thick buffalo milk with standard Punjabi hospitality. View our interactive digital menu page for complete delicacies, categories and prices.
                </p>
                <div className="pt-4">
                  <button
                    id="direct-to-menu-btn"
                    onClick={() => handleNavigate('menu')}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-[#58111A] hover:bg-[#D4AF37] hover:text-[#58111A] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span className="font-sans text-sm sm:text-base">Explore Entire Menu & Prices &rarr;</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Guest Star Feedback Metrics */}
            <ReviewsSection />
          </>
        ) : currentPage === 'inquiry' ? (
          <div className="animate-fade-in block">
            {/* Elegant Header for dedicated Inquiry View */}
            <div className="bg-[#58111A] pt-36 pb-16 text-center text-white border-b border-[#D4AF37]/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3a060a]/90 via-[#58111a]/95 to-transparent z-0" />
              <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
                <button
                  id="inquiry-back-home-btn"
                  onClick={() => handleNavigate('home')}
                  className="inline-flex items-center space-x-1.5 text-xs text-[#D4AF37] font-semibold tracking-widest uppercase hover:text-white transition-colors cursor-pointer"
                >
                  <span>&larr; Back to Main Website</span>
                </button>
                <h1 className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
                  Traditional Guest Inquiries
                </h1>
                <p className="font-sans text-[#FAF6F0]/80 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                  Have a custom catering plan, morning event booking, dairy supply query, or customized group breakfast order? Leave your details below.
                </p>
              </div>
            </div>

            {/* Standalone Guest Inquiry Page render */}
            <ContactSection />
          </div>
        ) : currentPage === 'admin' ? (
          <div className="animate-fade-in bg-stone-100">
            <AdminDashboard onClose={() => handleNavigate('home')} />
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Elegant Header for dedicated Menu View */}
            <div className="bg-[#58111A] pt-36 pb-16 text-center text-white border-b border-[#D4AF37]/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3a060a]/90 via-[#58111a]/95 to-transparent z-0" />
              <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
                <button
                  id="go-back-home-btn"
                  onClick={() => handleNavigate('home')}
                  className="inline-flex items-center space-x-1.5 text-xs text-[#D4AF37] font-semibold tracking-widest uppercase hover:text-white transition-colors cursor-pointer"
                >
                  <span>&larr; Back to Main Website</span>
                </button>
                <h1 className="font-sans text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  Royal Breakfast & Fresh Dairy
                </h1>
                <p className="font-sans text-[#FAF6F0]/80 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                  Lineage recipes served fresh in Multan. Direct call us at <span className="text-[#D4AF37] font-bold">{BUSINESS_DETAILS.phone}</span> to order instant takeaway or home delivery.
                </p>
              </div>
            </div>

            {/* The Full Display of the entire Menu */}
            <MenuSection
              menuItems={menuItems}
              cart={cart}
              setCart={setCart}
              selectedPortions={selectedPortions}
              setSelectedPortions={setSelectedPortions}
              isLiveDatabase={isLiveMenu}
            />

          </div>
        )}
      </main>

      {/* Classy & Colorful Minimalist Footer */}
      <footer id="footer-branding" className="bg-[#58111A] border-t border-[#D4AF37]/35 text-[#FAF6F0]/80 py-16 relative overflow-hidden">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch">
            
            {/* Branding Column - 5 Cols */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center space-x-3">
                <img
                  src={logoImg}
                  alt="Shahi Khana Nashta Point Branding"
                  className="h-14 w-14 rounded-full border border-[#D4AF37]/45"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <span className="font-sans text-2xl font-extrabold text-[#FAF6F0] tracking-tight leading-none">
                    SHAHI KHANA
                  </span>
                  <span className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mt-0.5">
                    NASHTA & MILK SHOP
                  </span>
                </div>
              </div>
              <p className="font-sans text-sm text-[#FAF6F0]/70 leading-relaxed max-w-sm">
                Serving Multan with unparalleled traditional purity since inception. Our food represents direct culinary integrity, cooking morning delicacies with standard Punjabi hospitality.
              </p>
              
              {/* Social Channels (Essential Contacts) */}
              <div className="flex items-center space-x-4 pt-2">
                <a
                  href="https://www.facebook.com/share/18ks9PQxpr/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 ml-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-[#D4AF37]/50 text-white transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/shahikhanamultan?igsh=MW4yd3czZTRseXJuZg=="
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-[#D4AF37]/50 text-white transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <div className="w-12 h-1 bg-[#D4AF37]/30 rounded-full" />
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                  Multani Legacy
                </span>
              </div>
            </div>

            {/* Quick Links Column - 3 Cols */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Quick Navigation
              </h4>
              <ul className="space-y-2.5">
                {['home', 'story', 'menu', 'reviews', 'inquiry'].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => handleNavigate(link)}
                      className="font-sans text-sm text-[#FAF6F0]/70 hover:text-[#D4AF37] transition-colors capitalize text-left cursor-pointer"
                    >
                      {link === 'story' ? 'Our Story' : link === 'menu' ? 'Royal Menu' : link === 'inquiry' ? 'Guest Inquiry' : link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Locate Us & Info - 4 Cols */}
            <div className="md:col-span-4 space-y-5">
              <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Our Location & Info
              </h4>
              <div className="space-y-3.5 text-sm font-sans text-[#FAF6F0]/75">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4.5 w-4.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Shop#6, M-block, Wapda Town Phase 2, Multan</span>
                </div>
                <a
                  href={`https://wa.me/923223399774?text=${encodeURIComponent("Assalam-o-Alaikum! I want to order delicious breakfast from Shahi Khana Nashta Point.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start space-x-3 hover:text-[#D4AF37] transition-colors"
                >
                  <Phone className="h-4.5 w-4.5 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
                  <span>{BUSINESS_DETAILS.phone} (WhatsApp Order Line)</span>
                </a>
                <div className="flex items-start space-x-3">
                  <Milk className="h-4.5 w-4.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>Fresh Buffalo Milk Delivery available</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright bar */}
          <div className="pt-12 mt-12 border-t border-[#D4AF37]/15 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-sans text-xs text-[#FAF6F0]/50 tracking-wide font-normal">
              &copy; {new Date().getFullYear()} Shahi Khana Nashta Point & Milk Shop. All Rights Reserved.
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-[#FAF6F0]/40">
              <button 
                id="footer-track-order-btn"
                className="hover:text-[#D4AF37] text-[#D4AF37] hover:underline transition-colors cursor-pointer flex items-center gap-1.5 font-black uppercase tracking-wider text-[11px] bg-transparent border-none text-left"
                onClick={() => setShowStatusPopup(true)}
              >
                <Search className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>🔍 Track My Order Status</span>
              </button>
              <span>&bull;</span>
              <button 
                id="login-as-admin-footer-btn"
                className="hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] bg-transparent border-none text-left" 
                onClick={() => handleNavigate('admin')}
              >
                <Lock className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>Login as Admin</span>
              </button>
              <span>&bull;</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNavigate('story')}>Authentic</span>
              <span>&bull;</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNavigate('story')}>Purity Sealed</span>
              <span>&bull;</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => handleNavigate('story')}>Traditional</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Royal Live Order Checker Popup */}
      <OrderStatusModal 
        isOpen={showStatusPopup} 
        onClose={() => {
          setShowStatusPopup(false);
          try {
            sessionStorage.setItem('shahi_khana_status_dismissed', 'true');
          } catch (e) {}
        }} 
      />
    </div>
  );
}
