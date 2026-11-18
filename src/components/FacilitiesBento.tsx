import type React from "react";
import { Check } from "lucide-react";
import musholaImage from "../img/mushola.jpeg";

export const FacilitiesBento: React.FC = () => {
  return (
    <section
      className="relative overflow-hidden border-b border-[#E7DFD4] bg-[#F8F5F0] py-16 md:py-20"
      id="fasilitas"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(217,138,69,.12) 0, transparent 18%), radial-gradient(circle at 90% 78%, rgba(113,145,107,.10) 0, transparent 20%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E7DFD4] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#D98A45] shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D98A45]" />
            Kenyamanan Maksimal
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-[#1a0f0b] sm:text-4xl">
            Fasilitas Tersedia
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#635e53] sm:text-base">
            Nikmati momen buka bersama yang nyaman dengan ruang makan, fasilitas
            ibadah, dan area bersantai dalam satu lokasi.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {/* Feature 1: Musholla AC & Nyaman (Span 2 cols on tablet/desktop) */}
          <article className="group relative overflow-hidden rounded-3xl border border-[#E7DFD4] bg-[#30231f] p-5 shadow-lg shadow-[#30231f]/8 md:col-span-2 lg:col-span-4">
            <div className="grid h-full gap-5 sm:grid-cols-[1.05fr_.95fr] sm:items-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-[#201714] sm:aspect-[4/3]">
                <img
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={musholaImage}
                  alt="Ruang musholla yang nyaman dan bersih"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0b]/35 to-transparent" />
              </div>
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D98A45]/30 bg-[#D98A45]/15 text-[#ffb77d]">
                  <span className="material-symbols-outlined text-[24px]">
                    mosque
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Musholla
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Musholla dengan kapasitas sekitar 15–25 jamaah, dilengkapi
                  sajadah, mukena, dan sarung yang selalu bersih.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-[#ffddb9]">
                  <Check className="h-4 w-4" />
                  Sholat Maghrib & Isya Berjamaah
                </div>
              </div>
            </div>
          </article>

          {/* Feature 2: Playground */}
          <article className="group flex flex-col justify-between rounded-3xl border border-[#E7DFD4] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D98A45]/40 hover:shadow-lg hover:shadow-[#30231f]/5 md:col-span-1 lg:col-span-2">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faebe2] text-[#D98A45] transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">
                  child_care
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                Playground
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Area bermain yang dapat digunakan untuk menemani anak-anak
                bersantai bersama keluarga selama menikmati suasana bukber.
              </p>
            </div>
            <span className="mt-5 flex items-center gap-1.5 border-t border-[#E7DFD4] pt-4 text-xs font-medium text-[#635e53]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#71916B]/10">
                <Check className="h-3.5 w-3.5 text-[#71916B]" />
              </span>
              Aman untuk keluarga
            </span>
          </article>

          {/* Feature 3: Toilet */}
          <article className="group flex flex-col justify-between rounded-3xl border border-[#E7DFD4] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D98A45]/40 hover:shadow-lg hover:shadow-[#30231f]/5 lg:col-span-2">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faebe2] text-[#D98A45] transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">
                  wc
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                Toilet
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Toilet tersedia untuk memenuhi kebutuhan tamu dan dijaga
                kebersihannya selama jam operasional.
              </p>
            </div>
            <span className="mt-5 flex items-center gap-1.5 border-t border-[#E7DFD4] pt-4 text-xs font-medium text-[#635e53]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#71916B]/10">
                <Check className="h-3.5 w-3.5 text-[#71916B]" />
              </span>
              Bersih & terawat
            </span>
          </article>

          {/* Feature 4: Indoor AC & Semi-Outdoor Garden */}
          <article className="group flex flex-col justify-between rounded-3xl border border-[#E7DFD4] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D98A45]/40 hover:shadow-lg hover:shadow-[#30231f]/5 lg:col-span-2">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faebe2] text-[#D98A45] transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">
                  deck
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                Area Indoor & Semi-Outdoor Garden
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Pilihan duduk di area indoor yang nyaman atau area semi-outdoor
                garden dengan suasana taman yang sejuk dan asri.
              </p>
            </div>
            <span className="mt-5 flex items-center gap-1.5 border-t border-[#E7DFD4] pt-4 text-xs font-medium text-[#635e53]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#71916B]/10">
                <Check className="h-3.5 w-3.5 text-[#71916B]" />
              </span>
              Dua pilihan suasana
            </span>
          </article>

          {/* Feature 5: Spot Foto Silaturahmi */}
          <article className="group flex flex-col justify-between rounded-3xl border border-[#E7DFD4] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D98A45]/40 hover:shadow-lg hover:shadow-[#30231f]/5 lg:col-span-2">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faebe2] text-[#D98A45] transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">
                  photo_camera
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                Spot Foto Area
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Sudut area estetik dengan nuansa hangat dan tema Ramadan untuk
                mengabadikan momen bersama teman, keluarga, atau rekan kerja.
              </p>
            </div>
            <span className="mt-5 flex items-center gap-1.5 border-t border-[#E7DFD4] pt-4 text-xs font-medium text-[#635e53]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#71916B]/10">
                <Check className="h-3.5 w-3.5 text-[#71916B]" />
              </span>
              Sudut Instagrammable
            </span>
          </article>

          {/* Feature 6: Fast WiFi */}
          <article className="group flex flex-col justify-between rounded-3xl border border-[#E7DFD4] bg-gradient-to-r from-[#30231f] to-[#49372f] p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#30231f]/10 lg:col-span-6 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffb77d] transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">
                  wifi
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  WiFi Area
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/70">
                  Fasilitas WiFi tersedia untuk mendukung kebutuhan komunikasi
                  dan berbagi momen selama berada di D&apos;Lingga Coffee.
                </p>
              </div>
            </div>
            <span className="mt-4 flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white sm:mt-0">
              <Check className="h-4 w-4 text-[#b9cbb5]" />
              Terhubung di area tempat duduk
            </span>
          </article>
        </div>
      </div>
    </section>
  );
};
