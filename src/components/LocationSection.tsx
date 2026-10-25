import React from "react";
import { Clock, ExternalLink, MapPin, MessageCircle } from "lucide-react";

export const LocationSection: React.FC = () => (
  <aside id="lokasi" className="space-y-6">
    {/* Jam Operasional Card */}
    <div className="rounded-2xl border border-[#E7DFD4] bg-white p-6 shadow-xs">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#faebe2] text-[#D98A45]">
          <Clock className="h-5 w-5 text-[#D98A45]" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
            Jam Operasional Iftar
          </h3>
          <p className="text-xs text-[#635e53]">
            Setiap Hari Selama Bulan Ramadan
          </p>
        </div>
      </div>
      <div className="space-y-3 border-t border-[#E7DFD4] pt-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#1a0f0b]">Sesi Open Gate</span>
          <span className="font-bold text-[#D98A45]">16.30 WIB</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#1a0f0b]">
            Penyajian Takjil & Iftar
          </span>
          <span className="font-bold text-[#D98A45]">17.30 - 19.30 WIB</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#1a0f0b]">Jam Tutup Kafe</span>
          <span className="font-bold text-[#635e53]">22.00 WIB</span>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-[#E7DFD4] bg-[#F8F5F0] p-3 text-center">
        <p className="text-xs leading-relaxed text-[#635e53]">
          Disarankan tiba{" "}
          <strong className="text-[#1a0f0b]">pukul 16.45 WIB</strong> agar
          hidangan tersaji tepat saat adzan Maghrib berkumandang.
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-[#E7DFD4] bg-[#F8F5F0] p-4">
        <p className="text-sm font-semibold text-[#1a0f0b]">
          Rombongan lebih dari 12 orang?
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#635e53]">
          Hubungi admin untuk membantu mengatur reservasi rombongan.
        </p>
        <a
          href="https://wa.me/6282129211422?text=Halo%20Admin%20D%27Lingga%20Coffee,%20saya%20ingin%20reservasi%20untuk%20rombongan%20lebih%20dari%2012%20orang."
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1f8f55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#187344] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#187344]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Chat admin via WhatsApp
        </a>
      </div>
    </div>

    {/* Peta & Lokasi Card */}
    <div className="rounded-2xl border border-[#E7DFD4] bg-white p-6 shadow-xs">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#faebe2] text-[#D98A45]">
          <MapPin className="h-5 w-5 text-[#D98A45]" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
            Lokasi & Parkir Luas
          </h3>
          <p className="text-xs text-[#635e53]">Akses jalan utama</p>
        </div>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-[#211a15]">
        <strong className="text-[#1a0f0b]">Bukber D'Lingga Coffee</strong>
        <br />
        33R8+66P, Hidden Gem (belakang SPPG Tarunajaya 2, Tarunajaya, Kec.
        Darmaraja, Kabupaten Sumedang, Jawa Barat 45372
      </p>
      <div className="group relative h-44 overflow-hidden rounded-xl border border-[#E7DFD4] bg-[#F8F5F0]">
        <iframe
          className="h-full w-full border-0"
          src="https://www.google.com/maps?q=-6.9094375,108.0655625&z=17&output=embed"
          title="Peta lokasi D'Lingga Coffee"
          loading="lazy"
        />
        <a
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-[#1a0f0b] px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#30231f]"
          href="https://maps.app.goo.gl/ozUJiHWcK6ww5cFNA"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Buka di Google Maps</span>
        </a>
      </div>
    </div>
  </aside>
);
