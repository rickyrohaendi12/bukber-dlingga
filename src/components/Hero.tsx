import React from "react";
import { Calendar, Utensils, Star, ShieldCheck, Armchair } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface HeroProps {
  onStartBooking: () => void;
  onExplorePackages: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartBooking,
  onExplorePackages,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative bg-[#F8F5F0] overflow-hidden border-b border-[#E7DFD4]">
      {/* Subtle Ambient Warm Glow */}
      <motion.div
        className="absolute -top-32 right-1/4 w-96 h-96 bg-[#ffdcc3]/30 rounded-full blur-3xl pointer-events-none"
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-10 w-72 h-72 bg-[#f4e6dc]/70 rounded-full blur-2xl pointer-events-none"
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.06, 1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Copy & CTAs (7 cols) */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-left"
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {/* Badge Ramadan */}
            <motion.div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faebe2] border border-[#E7DFD4] text-[#1a0f0b]"
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <Star className="w-4 h-4 text-[#D98A45] fill-[#D98A45]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#635e53]">
                Ramadan 1448 H Special
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D98A45]" />
              <span className="text-xs font-bold text-[#D98A45]">
                Tempat Terbatas
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a0f0b] tracking-tight leading-tight"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
            >
              Rayakan Momen Bukber{" "}
              <span className="text-[#D98A45] underline decoration-[#ffdcc3] decoration-wavy decoration-3 underline-offset-8">
                Lebih Berkesan
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-base sm:text-lg text-[#635e53] max-w-xl leading-relaxed"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
              }}
            >
              Sambut hangatnya silaturahmi di bulan suci bersama keluarga dan
              sahabat. Nikmati sajian iftar otentik, takjil bar melimpah, dan
              atmosfer kafe kontemporer yang tenang di tengah hiruk-pikuk kota.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <button
                onClick={onStartBooking}
                className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-lg bg-[#D98A45] hover:bg-[#C27734] text-white font-semibold shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                <span>Reservasi Sekarang</span>
              </button>
              <button
                onClick={onExplorePackages}
                className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-lg bg-[#e7dfd1] hover:bg-[#ded2c1] text-[#30231f] font-semibold transition-all border border-[#E7DFD4] cursor-pointer"
              >
                <Utensils className="w-5 h-5 text-[#30231f]" />
                <span>Lihat Pilihan Paket</span>
              </button>
            </motion.div>

            {/* Key Highlights Counters */}
            <motion.div
              className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E7DFD4] max-w-lg"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-[#1a0f0b]">
                  100%
                </p>
                <p className="text-xs text-[#635e53] mt-0.5">
                  Bahan Halal Pilihan
                </p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-[#1a0f0b]">
                  Musholla
                </p>
                <p className="text-xs text-[#635e53] mt-0.5">
                  AC & Wudhu Terpisah
                </p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-[#1a0f0b]">
                  16:30
                </p>
                <p className="text-xs text-[#635e53] mt-0.5">
                  Buka Setiap Hari
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Visual Imagery Bento (5 cols) */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={
              shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
              delay: shouldReduceMotion ? 0 : 0.25,
            }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Hero Image Frame */}
              <div className="rounded-2xl overflow-hidden border border-[#E7DFD4] shadow-xl bg-white group">
                <img
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK3jCwC39iYgMonw-xMCHrsOtaThInbF5l4o_1f-iIukYXivSIay_w9kYh86zhHnqXuVPHBDhk5AmXLrYEg0P88OvCMtrPP2T2DTm55sr7XkKS5gH-D2jCBZQv1tf0oX6hSU1ArR5B7k2ue58Q3-tfJd2ya46pBlm9QD5pqkMx3Zk8DAe6pp2HzfCSxyhhCpmboDLksRn-9lB5Cm7d203HZ6IEJnoeVczHrpX8neloAIw7C4qyJTRC"
                  alt="Suasana meja iftar buka puasa bersama di Bukber Lounge dengan sajian istimewa dan suasana hangat"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
              </div>

              {/* Floating Pill Card: Fast Booking Notice */}
              {/* <motion.div
                className="absolute -bottom-6 -left-3 sm:left-4 bg-white/95 backdrop-blur-md border border-[#E7DFD4] rounded-xl p-3.5 shadow-lg flex items-center gap-3"
                animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#faebe2] flex items-center justify-center text-[#D98A45] shrink-0">
                  <Armchair className="w-5 h-5 text-[#D98A45]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#1a0f0b] font-bold">
                    Slot Iftar Hari Ini Tersisa 4 Meja
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#635e53]">
                    Amankan meja terbaik Anda sekarang
                  </p>
                </div>
              </motion.div> */}

              {/* Floating Badge: Free Takjil */}
              <motion.div
                className="absolute -top-4 -right-2 bg-[#30231f] text-white rounded-xl px-3.5 py-1.5 shadow-md border border-[#E7DFD4] flex items-center gap-2"
                animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <ShieldCheck className="w-4 h-4 text-[#D98A45]" />
                <span className="text-xs font-semibold text-white">
                  Marhaban Ya Ramadhan
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
