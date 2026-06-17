import { motion } from 'motion/react';
import { Compass, Sparkles, Award, MapPin, Heart } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data';

export default function AboutSection() {
  const brandQualities = [
    {
      title: 'Traditional Methods',
      desc: 'Our slow-cooking stews, Paya and Beef Nihari, are simmered over a low tandoor woodfire or heat overnight to extract maximum marrow enrichment.',
      icon: Compass,
    },
    {
      title: 'Pristine Dairy Lineage',
      desc: 'No added water, chemicals or synthetic preservatives. Our house milk is sourced fresh, skimmed naturally, and set in organic earthen clay pots.',
      icon: Sparkles,
    },
    {
      title: 'The Royal Standard',
      desc: '“Shahi Khana” literally means Royal Food. We cook with the standard of royal hospitality—serving pure ingredients and generous portions.',
      icon: Award,
    },
  ];

  return (
    <section id="story" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#58111A]/5 rounded-full filter blur-3xl -translate-y-1/2 z-0 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-yellow-400/5 rounded-full filter blur-3xl z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Heritage Brand Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <span className="font-sans text-xs font-bold tracking-widest text-[#D4AF37] uppercase block">
              Our Legacy & Value System
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#58111A] tracking-tight leading-none">
              Shahi Khana:<br className="hidden sm:inline" /> Royal Food, Honest Roots
            </h2>
            <div className="w-20 h-1 bg-[#D4AF37] mb-6" />

            <p className="font-sans text-[#58111A]/80 text-sm sm:text-base leading-relaxed tracking-wide">
              Founded on the belief that traditional Pakistani breakfast is an elaborate culinary art, Shahi Khana in Multan preserves centuries of recipe lineage down to the exact particle count. From the golden crust of our puffed puris to the thick cardamom-rich layer of cream (Malai) floating atop our sweetened Lassi, we deliver a culinary adventure fit for kings.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3 text-[#58111A] font-semibold text-sm">
                <span className="p-1 px-2.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 font-mono text-xs">
                  Coordinates: {BUSINESS_DETAILS.coordinates.lat}, {BUSINESS_DETAILS.coordinates.lng}
                </span>
                <span className="text-[#D4AF37]">&bull;</span>
                <span className="text-xs sm:text-sm">{BUSINESS_DETAILS.coordinates.text}</span>
              </div>

              {/* Royal Color Palette Visualization */}
              <div className="pt-2">
                <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#58111A]/50 mb-2">
                  Our Verified Brand Colors
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="w-5 h-5 rounded bg-[#58111A]" title="Deep Royal Maroon" />
                    <span className="font-sans text-[10px] text-[#58111A]/70 font-medium">Royal Maroon</span>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <span className="w-5 h-5 rounded bg-[#D4AF37]" title="Royal Gold" />
                    <span className="font-sans text-[10px] text-[#58111A]/70 font-medium">Royal Gold</span>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <span className="w-5 h-5 rounded bg-[#FAF6F0] border border-[#58111A]/10" title="Cream" />
                    <span className="font-sans text-[10px] text-[#58111A]/70 font-medium font-sans">Cream</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Brand Qualities Cards List */}
          <div className="lg:col-span-5 space-y-6">
            {brandQualities.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  id={`brand-quality-${index}`}
                  className="bg-[#FAF6F0] border border-[#58111A]/10 p-6 rounded-xl flex items-start space-x-4 shadow-sm hover:translate-x-1.5 transition-all duration-300"
                >
                  <div className="p-3 bg-[#58111A] text-[#D4AF37] rounded-lg">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-sans text-base font-bold text-[#58111A] tracking-tight">
                      {item.title}
                    </h4>
                    <p className="font-sans text-[#58111A]/75 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
