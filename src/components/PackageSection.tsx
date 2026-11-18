import type React from "react";
import type { MenuItem } from "../types/reservation";
import {
  Check,
  CheckCircle2,
  Flame,
  Users,
  Sparkles,
  ArrowRight,
  Calendar,
  Info,
} from "lucide-react";

const packageImages: Record<string, string> = {
  "paket-hemat":
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
  "paket-rame-rame":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85",
  "paket-premium-sultan":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85",
};

interface PackageSectionProps {
  packages: MenuItem[];
  onSelectPackage: (packageId: string) => void;
}

export const PackageSection: React.FC<PackageSectionProps> = ({
  packages,
  onSelectPackage,
}) => {
  return (
    <section
      className="relative overflow-hidden border-b border-[#E9E4DC] bg-[#F7F5F1] py-16 md:py-24"
      id="paket"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E9E4DC] bg-[#F1ECE5] px-4 py-2 text-xs font-bold tracking-wide text-[#8F5A35]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pilihan Menu Spesial Iftar</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#30231F] sm:text-4xl md:text-5xl">
            Paket Bukber <span className="text-[#A95F2A]">Ramadan</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#63584E] sm:text-base">
            Disajikan secara higienis, segar, dan tepat waktu menjelang adzan
            maghrib. Seluruh paket sudah termasuk welcome dates kurma medjool.
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => {
            const isPopular = pkg.isPopular;
            const isVip = pkg.isVip;
            const isLimited = pkg.isLimited;

            return (
              <div
                key={pkg.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-300 ${
                  isPopular
                    ? "border-[#B97949] shadow-md ring-1 ring-[#B97949]/20 md:-translate-y-1"
                    : "border-[#E9E4DC] shadow-sm hover:-translate-y-1 hover:border-[#D6C7B7] hover:shadow-md"
                }`}
              >
                {/* Popular Floating Badge */}
                {isPopular && (
                  <div className="absolute left-1/2 top-3 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#A95F2A] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#30231F]/20">
                    <Flame className="h-3.5 w-3.5 fill-white" />
                    <span>Pilihan Terfavorit</span>
                  </div>
                )}

                <div className="relative h-48 overflow-hidden bg-[#EEEAE3] sm:h-52">
                  <img
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={
                      packageImages[pkg.id] ?? packageImages["paket-rame-rame"]
                    }
                    alt={`Hidangan ${pkg.name}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#211711]/25 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div>
                    {/* Top meta tags */}
                    <div className="mb-3 mt-1 flex min-h-8 items-center justify-between gap-2">
                      <span className="rounded-full border border-[#E9E4DC] bg-[#F5F2ED] px-2.5 py-1 text-[11px] font-semibold text-[#63584E]">
                        Bisa dipilih per orang
                      </span>
                      {isPopular ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#A95F2A]">
                          <Users className="h-4 w-4" />
                          Paling Diminati
                        </span>
                      ) : isLimited ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#30231F]">
                          <Sparkles className="h-4 w-4 text-[#A95F2A]" />
                          Terbatas
                        </span>
                      ) : isVip ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#30231F]">
                          <Sparkles className="h-4 w-4 text-[#A95F2A]" />
                          VIP Experience
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-[#63584E]">
                          <CheckCircle2 className="h-4 w-4 text-[#66845E]" />
                          Tersedia
                        </span>
                      )}
                    </div>

                    <h3 className="font-display min-h-14 text-xl font-bold leading-snug text-[#30231F] sm:text-2xl">
                      {pkg.name}
                    </h3>
                    <p className="mt-2 min-h-10 text-xs leading-relaxed text-[#63584E] sm:text-sm">
                      {pkg.description}
                    </p>

                    {/* Pricing */}
                    <div className="my-5 border-b border-[#E9E4DC] pb-5">
                      <span className="text-xs font-medium text-[#74685C]">
                        Mulai dari
                      </span>
                      <div className="mt-0.5 flex items-baseline gap-1">
                        <span className="font-display text-2xl font-extrabold tracking-tight text-[#30231F] sm:text-3xl">
                          Rp{pkg.price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-[#74685C]">/ orang</span>
                      </div>
                    </div>

                    {/* Menu List */}
                    <div className="mb-6 space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A95F2A]">
                        Daftar Menu Iftar:
                      </p>
                      {pkg.features.map((feature, idx) => {
                        const isHighlighted =
                          feature.includes("Buffet Takjil") ||
                          feature.includes("Free Flow");
                        return (
                          <div key={idx} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 stroke-[2.5] text-[#66845E]" />
                            <span
                              className={`text-xs leading-relaxed sm:text-sm ${
                                isHighlighted
                                  ? "font-semibold text-[#A95F2A]"
                                  : "text-[#30231F]"
                              }`}
                            >
                              {feature}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectPackage(pkg.id)}
                    className={`mt-auto inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                      isPopular
                        ? "bg-[#A95F2A] text-white shadow-md shadow-[#A95F2A]/20 hover:bg-[#8F4E23]"
                        : isVip || isLimited
                          ? "bg-[#30231F] text-white shadow-sm hover:bg-[#1A0F0B]"
                          : "border border-[#D8C5AF] bg-[#F4E6DC] text-[#30231F] hover:border-[#CFA77F] hover:bg-[#EEDBC8]"
                    }`}
                  >
                    <span>Pilih Paket & Jadwal</span>
                    {isPopular ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note for Special Dietary/Allergies */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E9E4DC] bg-white p-5 sm:flex-row sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1ECE5]">
              <Info className="h-5 w-5 text-[#A95F2A]" />
            </span>
            <p className="text-xs leading-relaxed text-[#63584E] sm:text-sm">
              Ada pantangan makanan atau request khusus untuk
              vegetarian/anak-anak? Tuliskan pada formulir reservasi atau
              hubungi WhatsApp kami.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById("reservasi");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="shrink-0 cursor-pointer whitespace-nowrap text-xs font-bold text-[#A95F2A] transition-colors hover:text-[#7E431E] hover:underline sm:text-sm"
          >
            Pelajari Ketentuan Reservasi →
          </button>
        </div>
      </div>
    </section>
  );
};
