import React, { useEffect, useMemo, useState } from "react";
import { MenuItem, TableItem, ReservationData } from "../types/reservation";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  ExternalLink,
  Calendar,
  Users,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";
import {
  getSmallestSuitableTableCapacity,
  getTodayDate,
  isTableCapacitySuitable,
} from "../data/reservations";

interface QuickBookingFormProps {
  packages: MenuItem[];
  availableTables: TableItem[];
  date: string;
  onDateChange: (date: string) => void;
  preselectedTableId?: string;
  preselectedPackageId?: string;
  onSubmitReservation: (
    data: Omit<
      ReservationData,
      | "bookingId"
      | "createdAt"
      | "status"
      | "subtotal"
      | "taxAmount"
      | "totalAmount"
    >,
  ) => void;
  onSelectTableDirectly: () => void;
}

export const QuickBookingForm: React.FC<QuickBookingFormProps> = ({
  packages,
  availableTables,
  date,
  onDateChange,
  preselectedTableId,
  preselectedPackageId,
  onSubmitReservation,
  onSelectTableDirectly,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [timeSlot, setTimeSlot] = useState("17.30 - 19.30 WIB");
  const [packageId, setPackageId] = useState(
    preselectedPackageId || "paket-rame-rame",
  );
  const [pax, setPax] = useState<number>(4);
  const [tableId, setTableId] = useState(preselectedTableId || "M-01");
  const [notes, setNotes] = useState("");
  const recommendedCapacity = getSmallestSuitableTableCapacity(pax, availableTables);
  const capacitySuitableTables = useMemo(
    () => availableTables.filter((table) => table.seats === recommendedCapacity),
    [availableTables, recommendedCapacity],
  );

  useEffect(() => {
    if (!capacitySuitableTables.some((table) => table.id === tableId)) {
      setTableId(capacitySuitableTables[0]?.id || "");
    }
  }, [capacitySuitableTables, tableId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Mohon isi nama dan nomor WhatsApp Anda terlebih dahulu.");
      return;
    }
    const chosenTable = availableTables.find((table) => table.id === tableId);
    if (
      !chosenTable ||
      !isTableCapacitySuitable(pax, chosenTable, availableTables)
    ) {
      alert(
        `Tidak ada meja dengan kapasitas paling kecil yang cukup untuk ${pax} orang. Silakan sesuaikan jumlah tamu.`,
      );
      return;
    }

    onSubmitReservation({
      customerName,
      customerPhone,
      date,
      timeSlot,
      pax,
      packageId,
      tableId,
      notes,
      addons: {},
    });
  };

  return (
    <section
      className="py-16 md:py-20 bg-[#F8F5F0] border-b border-[#E7DFD4]"
      id="reservasi"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form Reservasi (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7DFD4] p-6 sm:p-8 shadow-xs">
            <div className="border-b border-[#E7DFD4] pb-4 mb-6">
              <span className="text-xs text-[#D98A45] font-bold uppercase tracking-wider block">
                Formulir Pemesanan
              </span>
              <h2 className="font-display text-2xl font-bold text-[#1a0f0b] mt-1">
                Formulir Reservasi Meja Bukber
              </h2>
              <p className="text-xs sm:text-sm text-[#635e53]">
                Isi data di bawah ini untuk mengunci kuota meja Anda seketika.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Nama & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a0f0b] mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#635e53]" />
                    Nama Pemesan
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                    placeholder="Contoh: Farhan Nugraha"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a0f0b] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#635e53]" />
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                    placeholder="0812-XXXX-XXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    type="tel"
                  />
                </div>
              </div>

              {/* Tanggal & Sesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a0f0b] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#635e53]" />
                    Pilih Tanggal Iftar
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                    value={date}
                    min={getTodayDate()}
                    onChange={(e) => onDateChange(e.target.value)}
                    required
                    type="date"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a0f0b] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#635e53]" />
                    Waktu Kedatangan
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                  >
                    <option value="16.30 WIB">
                      16.30 WIB (Paling Dianjurkan)
                    </option>
                    <option value="17.00 WIB">17.00 WIB (Sore Santai)</option>
                    <option value="17.30 - 19.30 WIB">
                      17.30 - 19.30 WIB (Slot Iftar Maghrib)
                    </option>
                    <option value="18.30 WIB">
                      18.30 WIB (Setelah Sholat Maghrib)
                    </option>
                  </select>
                </div>
              </div>

              {/* Paket & Jumlah Tamu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a0f0b] mb-1.5">
                    Pilihan Paket Bukber
                  </label>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (Rp{pkg.price.toLocaleString("id-ID")}/org)
                        {pkg.isPopular ? " - Favorit" : ""}
                      </option>
                    ))}
                    <option value="a-la-carte">
                      A La Carte / Menu Reguler
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a0f0b] mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#635e53]" />
                    Jumlah Tamu (Pax)
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                    max={100}
                    min={2}
                    value={pax}
                    onChange={(e) =>
                      setPax(Math.max(2, parseInt(e.target.value) || 2))
                    }
                    required
                    type="number"
                  />
                </div>
              </div>

              {/* Pilihan Meja */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#1a0f0b]">
                    Pilihan Meja ({tableId})
                  </label>
                  <button
                    type="button"
                    onClick={onSelectTableDirectly}
                    className="text-xs text-[#D98A45] hover:underline font-semibold cursor-pointer"
                  >
                    Buka Denah Interaktif →
                  </button>
                </div>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                >
                  {capacitySuitableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.zoneName} ({t.seats} Kursi){" "}
                      {t.status === "reserved" ? "[Reserved]" : "[Tersedia]"}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-[#635e53]">
                  Hanya menampilkan meja berkapasitas paling kecil yang cukup untuk {pax} orang
                  {recommendedCapacity ? ` (${recommendedCapacity} kursi)` : ""}.
                </p>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-[#1a0f0b] mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#635e53]" />
                  Catatan Khusus / Permintaan
                </label>
                <textarea
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] bg-[#fff8f5] outline-none transition"
                  placeholder="Contoh: Meja M-01 dekat area AC, minta kursi bayi 1 unit."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                className="w-full py-3.5 rounded-lg bg-[#D98A45] hover:bg-[#C27734] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Kunci Reservasi Saya Sekarang</span>
              </button>
              <p className="text-center text-xs text-[#635e53] pt-1">
                *Konfirmasi reservasi otomatis diteruskan ke WhatsApp CS dalam
                tempo &lt; 10 menit.
              </p>
            </form>
          </div>

          {/* Right: Jam Operasional & Lokasi Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6" id="lokasi">
            {/* Jam Operasional Card */}
            <div className="bg-white rounded-2xl border border-[#E7DFD4] p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#faebe2] text-[#D98A45] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#D98A45]" />
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
                <div className="flex justify-between items-center">
                  <span className="text-[#1a0f0b] font-medium">
                    Sesi Open Gate
                  </span>
                  <span className="font-bold text-[#D98A45]">16.30 WIB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#1a0f0b] font-medium">
                    Penyajian Takjil & Iftar
                  </span>
                  <span className="font-bold text-[#D98A45]">
                    17.30 - 19.30 WIB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#1a0f0b] font-medium">
                    Jam Tutup Kafe
                  </span>
                  <span className="font-bold text-[#635e53]">21.00 WIB</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-[#F8F5F0] border border-[#E7DFD4] text-center">
                <p className="text-xs text-[#635e53] leading-relaxed">
                  Disarankan tiba{" "}
                  <strong className="text-[#1a0f0b]">pukul 16.45 WIB</strong>{" "}
                  agar hidangan tersaji tepat saat adzan Maghrib berkumandang.
                </p>
              </div>
            </div>

            {/* Peta & Lokasi Card */}
            <div className="bg-white rounded-2xl border border-[#E7DFD4] p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#faebe2] text-[#D98A45] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#D98A45]" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                    Lokasi & Parkir Luas
                  </h3>
                  <p className="text-xs text-[#635e53]">Akses jalan utama</p>
                </div>
              </div>
              <p className="text-sm text-[#211a15] mb-3 leading-relaxed">
                <strong className="text-[#1a0f0b]">
                  Bukber D'Lingga Coffee
                </strong>
                <br />
                33R8+66P, Hidden Gem (belakang SPPG Tarunajaya 2, Tarunajaya,
                Kec. Darmaraja, Kabupaten Sumedang, Jawa Barat 45372
              </p>
              <div className="rounded-xl overflow-hidden border border-[#E7DFD4] relative h-44 bg-[#F8F5F0] group">
                <iframe
                  className="w-full h-full border-0"
                  src="https://www.google.com/maps?q=-6.9094375,108.0655625&z=17&output=embed"
                  title="Peta lokasi D'Lingga Coffee"
                  loading="lazy"
                />
                <a
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-[#1a0f0b] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-[#30231f] transition-colors"
                  href="https://maps.app.goo.gl/ozUJiHWcK6ww5cFNA"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Maps</span>
                </a>
              </div>
              {/* <div className="mt-3 flex items-center gap-2 text-[#635e53] text-xs font-medium">
                <Car className="w-4 h-4 text-[#71916B] shrink-0" />
                <span>
                  Kapasitas Parkir: 45 Mobil & 80 Sepeda Motor (Valet Tersedia)
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
