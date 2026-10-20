import React, { useState } from "react";
import { MessageCircle, X, Shield, FileText } from "lucide-react";
import dlinggaLogo from "../img/dlingga.jpg";

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<"terms" | "cancellation" | null>(
    null,
  );

  return (
    <>
      <footer className="bg-[#faebe2] border-t border-[#E7DFD4] mt-12 print:hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src={dlinggaLogo}
                  alt="Logo Dlingga"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-display text-lg font-bold text-[#1a0f0b]">
                D'Lingga Coffee
              </span>
            </div>
            <p className="text-[#635e53] text-xs max-w-md">
              © 2025 Bukber Cafe & Lounge. Hangatnya Silaturahmi di Bulan
              Ramadan. Seluruh hak cipta dilindungi.
            </p>
          </div>

          {/* Links Cluster */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm">
            <button
              onClick={() => setModalType("terms")}
              className="text-[#635e53] hover:text-[#D98A45] transition-colors cursor-pointer"
            >
              Syarat & Ketentuan Reservasi
            </button>
            <span className="text-[#E7DFD4] hidden md:inline">•</span>
            <button
              onClick={() => setModalType("cancellation")}
              className="text-[#635e53] hover:text-[#D98A45] transition-colors cursor-pointer"
            >
              Kebijakan Pembatalan
            </button>
            <span className="text-[#E7DFD4] hidden md:inline">•</span>
            <a
              href="https://wa.me/6282129211422?text=Halo%20Admin%20Bukber%20Lounge,%20saya%20ingin%20bertanya%20seputar%20reservasi%20buka%20puasa."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D98A45] font-semibold hover:underline flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp CS Iftar</span>
            </a>
            <span className="text-[#E7DFD4] hidden md:inline">•</span>
            <a
              href="#lokasi"
              className="text-[#635e53] hover:text-[#D98A45] transition-colors cursor-pointer"
            >
              Lokasi & Kontak
            </a>
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E7DFD4] shadow-2xl relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-[#635e53] hover:text-[#1a0f0b] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              {modalType === "terms" ? (
                <FileText className="w-5 h-5 text-[#D98A45]" />
              ) : (
                <Shield className="w-5 h-5 text-[#D98A45]" />
              )}
              <h3 className="font-display text-base font-bold text-[#1a0f0b]">
                {modalType === "terms"
                  ? "Syarat & Ketentuan Reservasi"
                  : "Kebijakan Pembatalan & Refund"}
              </h3>
            </div>
            <div className="text-xs text-[#635e53] space-y-2.5 leading-relaxed">
              {modalType === "terms" ? (
                <>
                  <p>
                    1. Reservasi dianggap sah setelah tamu menerima konfirmasi
                    resmi atau e-tiket dari admin Bukber Lounge via WhatsApp.
                  </p>
                  <p>
                    2. Tamu diharapkan hadir setidaknya 15 menit sebelum waktu
                    azan Maghrib berkumandang (maksimal 17.45 WIB).
                  </p>
                  <p>
                    3. Toleransi keterlambatan tanpa konfirmasi adalah 20 menit,
                    setelah itu meja dapat dialihkan ke tamu waiting list.
                  </p>
                  <p>
                    4. Semua sajian dipersiapkan dengan 100% bahan halal
                    tersertifikasi.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    1. Pembatalan tanpa potongan (Refund DP 100%) dapat diajukan
                    maksimal H-1 sebelum jadwal buka puasa.
                  </p>
                  <p>
                    2. Pembatalan pada hari-H (kurang dari 12 jam) dikenakan
                    biaya operasional bahan dapur sebesar 50% dari total DP yang
                    disetor.
                  </p>
                  <p>
                    3. Reschedule / pindah tanggal bebas biaya selama kuota meja
                    pada tanggal pengganti masih tersedia.
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setModalType(null)}
              className="mt-5 w-full py-2.5 rounded-lg bg-[#30231f] text-white text-xs font-bold hover:bg-[#1a0f0b] transition-colors cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
