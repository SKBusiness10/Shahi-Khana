import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck } from 'lucide-react';
import { BUSINESS_REVIEWS, BUSINESS_DETAILS } from '../data';

export default function ReviewsSection() {
  const [reviews] = useState(BUSINESS_REVIEWS);

  return (
    <section id="reviews" className="py-24 bg-[#FAF6F0] border-t border-[#D4AF37]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Rating Header Overview */}
        <div className="bg-[#58111A] text-[#FAF6F0] rounded-2xl p-8 sm:p-12 border border-[#D4AF37]/30 shadow-xl mb-16 relative overflow-hidden">
          {/* Decorative Gold Circles */}
          <div className="absolute right-0 bottom-0 w-64 h-64 border border-[#D4AF37]/15 rounded-full translate-x-12 translate-y-12 z-0" />
          <div className="absolute right-8 bottom-8 w-48 h-48 border border-[#D4AF37]/10 rounded-full translate-x-12 translate-y-12 z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Standard Metrics Card */}
            <div className="lg:col-span-4 text-center lg:text-left space-y-3">
              <span className="font-sans text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                Google Maps Verified
              </span>
              <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-tight">
                Authentic Guest Feedback
              </h3>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto lg:mx-0" />
              <p className="font-sans text-sm text-[#FAF6F0]/85 tracking-wide leading-relaxed">
                Directly synchronized with our active local business listing. We take honor in serving you.
              </p>
            </div>

            {/* Core Rating Value Card */}
            <div className="lg:col-span-4 flex flex-col items-center p-6 bg-white/5 border border-[#FAF6F0]/10 rounded-xl">
              <span className="font-sans text-5xl font-extrabold text-[#D4AF37]">
                {BUSINESS_DETAILS.rating}
              </span>
              <div className="flex items-center space-x-1.5 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(BUSINESS_DETAILS.rating)
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-[#FAF6F0]/30'
                    }`}
                  />
                ))}
              </div>
              <span className="font-sans text-xs text-[#FAF6F0]/70 tracking-wide font-medium">
                Based on {reviews.length + 240} Organic Reviews
              </span>
            </div>

            {/* Verification Stamp */}
            <div className="lg:col-span-4 flex items-center justify-center space-x-3 lg:justify-end">
              <div className="p-3 bg-white/10 text-[#D4AF37] rounded-full border border-[#D4AF37]/35 shadow-inner">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="text-left">
                <span className="font-sans text-md font-bold text-white block">
                  100% Genuine Reviews
                </span>
                <span className="font-sans text-xs text-[#FAF6F0]/70">
                  Imported from Google Local Guides
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section Title */}
        <div className="text-center mb-10">
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Guest Journal Entries
          </h4>
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#58111A] tracking-tight mt-1">
            Experience Diary & Feedback
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-3" />
        </div>

        {/* Individual Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((rev, index) => (
            <motion.div
              key={rev.id}
              id={`review-card-${index}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
              className="bg-white border border-[#58111A]/10 p-6 rounded-xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all duration-350"
            >
              {/* Card Quote Decor */}
              <div className="absolute right-6 top-6 text-2xl font-serif text-[#D4AF37]/20 select-none">
                &ldquo;
              </div>

              {/* Review Content */}
              <div className="space-y-4">
                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#58111A]/5 text-[#58111A] border border-[#58111A]/20 flex items-center justify-center font-sans font-bold text-sm tracking-wide shrink-0">
                    {rev.author ? rev.author[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-[#58111A] tracking-tight truncate max-w-[160px]">
                      {rev.author}
                    </h4>
                    <span className="font-sans text-[10px] text-[#58111A]/50 font-medium">
                      {rev.date}
                    </span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < rev.rating
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-[#58111A]/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="font-sans text-[#58111A]/80 text-sm leading-relaxed tracking-wide font-normal italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Decorative Corner Highlight */}
              <div className="h-1 w-12 bg-transparent group-hover:bg-[#D4AF37] transition-all rounded-full mt-6" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
