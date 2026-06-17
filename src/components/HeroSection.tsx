import { motion } from 'motion/react';
import { Phone, MapPin, ChevronDown, Clock, Search } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data';
import heroImg from '../assets/images/shahi_khana_hero_1780212909259.png';

interface HeroSectionProps {
  onExploreMenu: () => void;
}

export default function HeroSection({ onExploreMenu }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-[#FAF6F0] overflow-hidden pt-16"
    >
      {/* Immersive Classy Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Shahi Khana Royal Breakfast"
          className="w-full h-full object-cover scale-105 filter brightness-[0.70] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />
        {/* Beautiful Color Grading Overlay - Cozy Deep Maroon to Amber gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3a060a]/95 via-[#58111a]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/30 z-10" />
      </div>

      {/* Decorative Royal Corner Elements */}
      <div className="absolute top-24 left-8 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/30 rounded-tl-lg hidden md:block z-20 pointer-events-none" />
      <div className="absolute bottom-12 right-8 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/30 rounded-br-lg hidden md:block z-20 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
        {/* Elite Badge */}
        <motion.div
          id="hero-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/45 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#FAF6F0]">
            The Pride of Multan &bull; Premium Desi Breakfast
          </span>
        </motion.div>

        {/* Brand Main Title */}
        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#FAF6F0] mb-6 leading-none"
        >
          Experience Royal <br className="hidden sm:inline" /> 
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-[#D4AF37] bg-clip-text text-transparent">
            Desi Breakfast
          </span>
        </motion.h1>

        {/* Narrative Description */}
        <motion.p
          id="hero-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="max-w-2xl mx-auto font-sans text-base sm:text-lg text-[#FAF6F0]/90 leading-relaxed tracking-wide mb-10"
        >
          Savor the ultimate culinary heritage of Punjab. Indulge in hot crispy ghee-layered parathas, authentic slow-simmered paya & nihari, sweet malai lassi, and pristine fresh dairy directly from our royal dairy house. Crafted with lineage and care.
        </motion.p>

        {/* Live Status Indicators */}
        <motion.div
          id="hero-metadata-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-y-4 gap-x-8 mb-12 text-[#FAF6F0]/80 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center space-x-2">
            <Clock className="h-4.5 w-4.5 text-[#D4AF37]" />
            <span>Open Daily: 6:00 AM - 10:00 PM</span>
          </div>
          <div className="hidden sm:block text-[#D4AF37]/50">&bull;</div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4.5 w-4.5 text-[#D4AF37]" />
            <span>Wapda Town Phase 2, Multan</span>
          </div>
          <div className="hidden sm:block text-[#D4AF37]/50">&bull;</div>
          <div className="flex items-center space-x-1">
            <span className="text-[#D4AF37] text-base">&#9733;</span>
            <span className="text-white">{BUSINESS_DETAILS.rating} Rating ({BUSINESS_DETAILS.reviewCount} Verified Reviews)</span>
          </div>
        </motion.div>

        {/* Classy & Colorful Essential Buttons */}
        <motion.div
          id="hero-buttons-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md sm:max-w-none mx-auto"
        >
          {/* Specialty Explorer (Design CTA) */}
          <button
            id="hero-action-explorer"
            onClick={onExploreMenu}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-[#D4AF37] hover:bg-[#FAF6F0] text-[#58111A] font-bold text-base rounded-md shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Search className="h-5 w-5" />
            <span>View Full Royal Menu</span>
          </button>

          {/* Maps Nav */}
          <a
            id="hero-action-maps"
            href={BUSINESS_DETAILS.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 text-[#FAF6F0] border border-[#FAF6F0]/30 hover:border-[#D4AF37] font-semibold text-base rounded-md backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <MapPin className="h-4 w-4 text-[#D4AF37]" />
            <span>Locate Shop</span>
          </a>
        </motion.div>
      </div>

      {/* Visual Scrolling Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white animate-bounce pointer-events-none hidden md:block">
        <ChevronDown 
          className="h-6 w-6 text-[#D4AF37] cursor-pointer pointer-events-auto" 
          onClick={onExploreMenu}
        />
      </div>
    </section>
  );
}
