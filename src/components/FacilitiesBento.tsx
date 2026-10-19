import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';

export const FacilitiesBento: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-[#F8F5F0] border-b border-[#E7DFD4]" id="fasilitas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1 rounded-full bg-[#faebe2] text-[#D98A45] text-xs font-semibold">
            Kenyamanan Maksimal
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a0f0b] mt-2">
            Fasilitas Lengkap untuk Kenyamanan Ibadah
          </h2>
          <p className="text-sm sm:text-base text-[#635e53] mt-2 leading-relaxed">
            Kami memastikan momen berbuka puasa dan ibadah Maghrib Anda berjalan khusyuk, tertib, dan
            tanpa rasa tergesa-gesa.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Musholla AC & Nyaman (Span 2 cols on tablet/desktop) */}
          <div className="md:col-span-2 rounded-2xl bg-white border border-[#E7DFD4] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full sm:w-1/2 rounded-xl overflow-hidden aspect-video border border-[#E7DFD4] bg-[#F8F5F0]">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlTNViA2wW1uAPn-WN9kiNEokPyYqnxcENZcrbjySwvlqI05viVvbr4WunUqJK0ZxHcvQlx9XFVhkzTF0w7Crupv1bBkks6Wn8yJ9kkvni9sGc46dqTpiY7CER3ymYQGfxebClwrp8fABjpv8WsljpVTFiudeCNgBeB1qOhuwBI_CQDU_2D-5PGJU3QgzGLlafmfEf2kSVurQBAGdg3LEgWmYHzoJ6HO4n09iN-JdGmkJ4Ri1qqOel"
                alt="Ruang musholla ber-AC yang nyaman dan bersih di Bukber Lounge"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#faebe2] text-[#D98A45] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">mosque</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1a0f0b]">
                Ruang Sholat & Musholla Full AC
              </h3>
              <p className="text-sm text-[#635e53] leading-relaxed">
                Kapasitas hingga 40 jamaah dengan pendingin ruangan sejuk, karpet tebal harum, serta
                perlengkapan mukena dan sarung yang senantiasa bersih.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[#71916B] text-xs sm:text-sm font-semibold pt-1">
                <CheckCircle2 className="w-4 h-4 text-[#71916B]" />
                <span>Imam Sholat Maghrib & Isya Berjamaah</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Tempat Wudhu Terpisah */}
          <div className="rounded-2xl bg-white border border-[#E7DFD4] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#faebe2] text-[#D98A45] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">wash</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                Tempat Wudhu Terpisah
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Area wudhu pria dan wanita dibuat tertutup dan terpisah untuk menjaga privasi,
                dilengkapi lantai anti-slip dan aliran air bersih bertekanan stabil.
              </p>
            </div>
            <span className="text-[#635e53] text-xs mt-4 pt-4 border-t border-[#E7DFD4] flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-[#71916B]" /> Higienis & Terawat
            </span>
          </div>

          {/* Feature 3: Indoor AC & Semi-Outdoor Garden */}
          <div className="rounded-2xl bg-white border border-[#E7DFD4] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#faebe2] text-[#D98A45] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">deck</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                Indoor & Semi-Outdoor Garden
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Pilihan area ber-AC bebas asap rokok atau taman semi-outdoor berangin sejuk dengan
                tanaman tropis yang asri.
              </p>
            </div>
            <span className="text-[#635e53] text-xs mt-4 pt-4 border-t border-[#E7DFD4] flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-[#71916B]" /> Kapasitas Hingga 250 Pax
            </span>
          </div>

          {/* Feature 4: Spot Foto Silaturahmi */}
          <div className="rounded-2xl bg-white border border-[#E7DFD4] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#faebe2] text-[#D98A45] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">photo_camera</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                Spot Foto Silaturahmi
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Sudut photobooth tematik Ramadan dengan pencahayaan warm aesthetics untuk
                mengabadikan momen foto bersama tim atau sanak famili.
              </p>
            </div>
            <span className="text-[#635e53] text-xs mt-4 pt-4 border-t border-[#E7DFD4] flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-[#71916B]" /> Instagrammable Corner
            </span>
          </div>

          {/* Feature 5: Fast WiFi & Stopkontak */}
          <div className="rounded-2xl bg-white border border-[#E7DFD4] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#faebe2] text-[#D98A45] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">wifi</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                High-Speed WiFi & Power Plugs
              </h3>
              <p className="text-sm text-[#635e53] mt-2 leading-relaxed">
                Koneksi internet dedicated 200 Mbps dan stopkontak di setiap sudut meja bagi yang
                perlu bekerja sejenak sebelum berbuka.
              </p>
            </div>
            <span className="text-[#635e53] text-xs mt-4 pt-4 border-t border-[#E7DFD4] flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-[#71916B]" /> Bebas Hambatan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
