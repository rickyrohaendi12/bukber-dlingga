import React from "react";
import { MenuItem } from "../types/reservation";
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
  "a-la-carte":
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
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
  const aLaCartePackage: MenuItem = {
    id: "a-la-carte",
    name: "Paket A La Carte",
    category: "package",
    price: 0,
    description:
      "Pilih minuman dan camilan sesuai selera. Total harga dihitung dari item yang dipesan.",
    features: [
      "Pilih item menu sesuai keinginan",
      "Minuman segar dan camilan",
      "Harga menyesuaikan pilihan",
    ],
  };
  const displayedPackages = [...packages, aLaCartePackage];

  return (
    <section
      className="py-16 md:py-20 bg-white border-b border-[#E7DFD4]"
      id="paket"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#faebe2] text-[#D98A45] text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-[15px]">
              ramen_dining
            </span>
            <span>Pilihan Menu Spesial Iftar</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a0f0b]">
            Paket Bukber Ramadan
          </h2>
          <p className="text-sm sm:text-base text-[#635e53] mt-2 leading-relaxed">
            Disajikan secara higienis, segar, dan tepat waktu menjelang adzan
            maghrib. Seluruh paket sudah termasuk welcome dates kurma medjool.
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedPackages.map((pkg) => {
            const isPopular = pkg.isPopular;
            const isVip = pkg.isVip;
            const isALaCarte = pkg.id === "a-la-carte";

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                  isPopular
                    ? "border-2 border-[#D98A45] bg-white shadow-xl hover:shadow-2xl scale-[1.02] md:-translate-y-1"
                    : "border border-[#E7DFD4] bg-[#F8F5F0] hover:bg-white shadow-xs hover:shadow-md"
                }`}
              >
                {/* Popular Floating Badge */}
                {isPopular && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#D98A45] text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm whitespace-nowrap">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Pilihan Terfavorit</span>
                  </div>
                )}

                <div className="relative h-44 sm:h-48 overflow-hidden bg-[#E7DFD4]">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    src={
                      packageImages[pkg.id] ?? packageImages["paket-rame-rame"]
                    }
                    alt={`Hidangan ${pkg.name}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div>
                    {/* Top meta tags */}
                    <div className="flex items-center justify-between gap-2 mb-3 mt-1">
                      <span className="px-2.5 py-1 rounded-full bg-[#faebe2] text-[#635e53] text-xs font-semibold">
                        Bisa dipilih per orang
                      </span>
                      {isPopular ? (
                        <span className="text-[#D98A45] text-xs font-bold flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Paling Diminati
                        </span>
                      ) : isVip ? (
                        <span className="text-[#1a0f0b] text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-[#D98A45]" />
                          VIP Experience
                        </span>
                      ) : (
                        <span className="text-[#635e53] text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#71916B]" />
                          Tersedia
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1a0f0b]">
                      {pkg.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#635e53] mt-1 leading-snug">
                      {pkg.description}
                    </p>

                    {/* Pricing */}
                    <div className="my-5 pb-5 border-b border-[#E7DFD4]">
                      <span className="text-xs text-[#635e53]">
                        {isALaCarte ? "Harga" : "Mulai dari"}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        {isALaCarte ? (
                          <span className="font-display text-xl font-extrabold text-[#1a0f0b] sm:text-2xl">
                            Sesuai pilihan
                          </span>
                        ) : (
                          <>
                            <span className="font-display text-2xl font-extrabold text-[#1a0f0b] sm:text-3xl">
                              Rp{pkg.price.toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs text-[#635e53]">/ orang</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Menu List */}
                    <div className="space-y-2.5 mb-6">
                      <p className="text-xs text-[#D98A45] uppercase tracking-wider font-bold">
                        Daftar Menu Iftar:
                      </p>
                      {pkg.features.map((feature, idx) => {
                        const isHighlighted =
                          feature.includes("Buffet Takjil") ||
                          feature.includes("Free Flow");
                        return (
                          <div key={idx} className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-[#71916B] shrink-0 mt-0.5 stroke-[2.5]" />
                            <span
                              className={`text-xs sm:text-sm ${
                                isHighlighted
                                  ? "text-[#D98A45] font-bold"
                                  : "text-[#211a15]"
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
                    className={`w-full inline-flex justify-center items-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all active:scale-98 cursor-pointer ${
                      isPopular
                        ? "bg-[#D98A45] hover:bg-[#C27734] text-white shadow-md"
                        : isVip
                          ? "bg-[#30231f] hover:bg-[#1a0f0b] text-white shadow-sm"
                          : "bg-[#faebe2] hover:bg-[#e7dfd1] text-[#1a0f0b] border border-[#E7DFD4]"
                    }`}
                  >
                    <span>{isALaCarte ? "Pilih Menu & Jadwal" : "Pilih Paket & Jadwal"}</span>
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
        <div className="mt-8 p-4 rounded-xl bg-[#F8F5F0] border border-[#E7DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-[#D98A45] shrink-0" />
            <p className="text-xs sm:text-sm text-[#635e53]">
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
            className="shrink-0 text-[#D98A45] text-xs sm:text-sm hover:underline font-bold cursor-pointer whitespace-nowrap"
          >
            Pelajari Ketentuan Reservasi →
          </button>
        </div>
      </div>
    </section>
  );
};
