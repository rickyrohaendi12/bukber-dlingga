import React, { useEffect, useMemo, useState } from "react";
import { MenuItem, TableItem, ReservationData } from "../types/reservation";
import {
  CheckCircle2,
  Clock,
  MapPin,
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
  onDateChange: (date: string) => void;
  onSubmitReservation: (
    data: Omit<
      ReservationData,
      | "bookingId"
      | "createdAt"
      | "status"
      | "packageSelections"
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
  onDateChange,
  onSubmitReservation,
  onSelectTableDirectly,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [packageId, setPackageId] = useState("");
  const [pax, setPax] = useState<number | "">("");
  const [tableId, setTableId] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const paxCount = typeof pax === "number" ? pax : 0;
  const recommendedCapacity = paxCount
    ? getSmallestSuitableTableCapacity(paxCount, availableTables)
    : null;
  const capacitySuitableTables = useMemo(
    () =>
      availableTables.filter(
        (table) =>
          table.status === "available" &&
          (!recommendedCapacity || table.seats === recommendedCapacity),
      ),
    [availableTables, recommendedCapacity],
  );

  useEffect(() => {
    if (tableId && !capacitySuitableTables.some((table) => table.id === tableId)) {
      setTableId("");
    }
  }, [capacitySuitableTables, tableId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !date ||
      !timeSlot ||
      !packageId ||
      !paxCount ||
      !tableId
    ) {
      setFormError("Mohon lengkapi semua data wajib sebelum mengirim reservasi.");
      return;
    }
    const chosenTable = availableTables.find((table) => table.id === tableId);
    if (
      !chosenTable ||
      !isTableCapacitySuitable(paxCount, chosenTable, availableTables)
    ) {
      setFormError(
        `Tidak ada meja dengan kapasitas paling kecil yang cukup untuk ${paxCount} orang. Silakan sesuaikan jumlah tamu.`,
      );
      return;
    }

    onSubmitReservation({
      customerName,
      customerPhone,
      date,
      timeSlot,
      pax: paxCount,
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
          <div className="lg:col-span-7 rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 border-b border-[#E7DFD4] pb-5">
              <span className="mb-1 block text-sm font-bold uppercase tracking-wider text-[#9a5929]">
                Reservasi Bukber
              </span>
              <h2 className="font-display text-2xl font-bold leading-tight text-[#1a0f0b] sm:text-3xl">
                Pesan meja dengan mudah
              </h2>
              <p className="mt-2 text-base leading-relaxed text-[#4f4542]">
                Lengkapi data, jadwal, dan pilihan meja. Kolom bertanda{" "}
                <span className="font-bold text-[#9a5929]">*</span> wajib diisi.
              </p>
            </div>

            <form className="space-y-7" onSubmit={handleSubmit} autoComplete="off">
              {/* Nama & Kontak */}
              <fieldset className="space-y-4">
                <legend className="mb-1 text-lg font-bold text-[#1a0f0b]">
                  1. Data pemesan
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quick-booking-name" className="mb-2 flex items-center gap-2 text-base font-semibold text-[#1a0f0b]">
                    <User className="h-4 w-4 text-[#635e53]" aria-hidden="true" />
                    Nama pemesan <span aria-hidden="true" className="text-[#9a5929]">*</span>
                  </label>
                  <input
                    id="quick-booking-name"
                    className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition placeholder:text-[#746a61] focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                    placeholder="Masukkan nama lengkap"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setFormError("");
                    }}
                    required
                    type="text"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="quick-booking-phone" className="mb-2 flex items-center gap-2 text-base font-semibold text-[#1a0f0b]">
                    <Phone className="h-4 w-4 text-[#635e53]" aria-hidden="true" />
                    Nomor WhatsApp <span aria-hidden="true" className="text-[#9a5929]">*</span>
                  </label>
                  <input
                    id="quick-booking-phone"
                    className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition placeholder:text-[#746a61] focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setFormError("");
                    }}
                    required
                    type="tel"
                    autoComplete="tel"
                  />
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4f4542]">
                    Kami mengirim konfirmasi ke nomor ini.
                  </p>
                </div>
                </div>
              </fieldset>

              {/* Tanggal & Sesi */}
              <fieldset className="space-y-4 border-t border-[#E7DFD4] pt-6">
                <legend className="mb-1 text-lg font-bold text-[#1a0f0b]">
                  2. Jadwal kedatangan
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quick-booking-date" className="mb-2 flex items-center gap-2 text-base font-semibold text-[#1a0f0b]">
                    <Calendar className="h-4 w-4 text-[#635e53]" aria-hidden="true" />
                    Tanggal bukber <span aria-hidden="true" className="text-[#9a5929]">*</span>
                  </label>
                  <input
                    id="quick-booking-date"
                    className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                    value={date}
                    min={getTodayDate()}
                    onChange={(e) => {
                      setDate(e.target.value);
                      onDateChange(e.target.value);
                      setTableId("");
                      setFormError("");
                    }}
                    required
                    type="date"
                  />
                </div>
                <div>
                  <label htmlFor="quick-booking-time" className="mb-2 flex items-center gap-2 text-base font-semibold text-[#1a0f0b]">
                    <Clock className="h-4 w-4 text-[#635e53]" aria-hidden="true" />
                    Waktu kedatangan <span aria-hidden="true" className="text-[#9a5929]">*</span>
                  </label>
                  <select
                    id="quick-booking-time"
                    value={timeSlot}
                    onChange={(e) => {
                      setTimeSlot(e.target.value);
                      setFormError("");
                    }}
                    required
                    className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                  >
                    <option value="" disabled>
                      Pilih waktu kedatangan
                    </option>
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
              </fieldset>

              {/* Paket & Jumlah Tamu */}
              <fieldset className="space-y-4 border-t border-[#E7DFD4] pt-6">
                <legend className="mb-1 text-lg font-bold text-[#1a0f0b]">
                  3. Paket dan jumlah tamu
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quick-booking-package" className="mb-2 block text-base font-semibold text-[#1a0f0b]">
                    Paket bukber <span aria-hidden="true" className="text-[#9a5929]">*</span>
                  </label>
                  <select
                    id="quick-booking-package"
                    value={packageId}
                    onChange={(e) => {
                      setPackageId(e.target.value);
                      setFormError("");
                    }}
                    required
                    className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                  >
                    <option value="" disabled>
                      Pilih paket bukber
                    </option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (Rp{pkg.price.toLocaleString("id-ID")}/org)
                        {pkg.isPopular ? " - Favorit" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quick-booking-pax" className="mb-2 flex items-center gap-2 text-base font-semibold text-[#1a0f0b]">
                    <Users className="h-4 w-4 text-[#635e53]" aria-hidden="true" />
                    Jumlah tamu <span aria-hidden="true" className="text-[#9a5929]">*</span>
                  </label>
                  <input
                    id="quick-booking-pax"
                    className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                    max={12}
                    min={2}
                    value={pax}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPax(value ? Math.min(12, Math.max(2, parseInt(value, 10) || 2)) : "");
                      setTableId("");
                      setFormError("");
                    }}
                    required
                    type="number"
                  />
                  <p className="mt-1.5 text-sm text-[#4f4542]">Minimal 2, maksimal 12 orang.</p>
                </div>
                </div>
              </fieldset>

              {/* Pilihan Meja */}
              <fieldset className="space-y-3 border-t border-[#E7DFD4] pt-6">
                <legend className="mb-1 text-lg font-bold text-[#1a0f0b]">
                  4. Pilih meja
                </legend>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor="quick-booking-table" className="text-base font-semibold text-[#1a0f0b]">
                    Meja tersedia <span aria-hidden="true" className="text-[#9a5929]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={onSelectTableDirectly}
                    className="min-h-11 w-fit rounded-lg px-2 text-sm font-bold text-[#8c4d20] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929]"
                  >
                    Lihat denah meja →
                  </button>
                </div>
                <select
                  id="quick-booking-table"
                  value={tableId}
                  onChange={(e) => {
                    setTableId(e.target.value);
                    setFormError("");
                  }}
                  required
                  disabled={!paxCount || capacitySuitableTables.length === 0}
                  className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25 disabled:cursor-not-allowed disabled:bg-[#F8F5F0] disabled:text-[#635e53]"
                >
                  <option value="" disabled>
                    {!paxCount
                      ? "Isi jumlah tamu terlebih dahulu"
                      : capacitySuitableTables.length === 0
                        ? "Tidak ada meja tersedia untuk jumlah tamu ini"
                        : "Pilih meja yang tersedia"}
                  </option>
                  {capacitySuitableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.zoneName} ({t.seats} Kursi)
                    </option>
                  ))}
                </select>
                <p className="text-sm leading-relaxed text-[#4f4542]">
                  Hanya meja yang tersedia dan sesuai kapasitas yang ditampilkan
                  {paxCount ? ` untuk ${paxCount} orang` : ""}
                  {recommendedCapacity ? ` (${recommendedCapacity} kursi)` : ""}.
                </p>
              </fieldset>

              {/* Catatan Tambahan */}
              <div className="border-t border-[#E7DFD4] pt-6">
                <label htmlFor="quick-booking-notes" className="mb-2 flex items-center gap-2 text-base font-semibold text-[#1a0f0b]">
                  <MessageSquare className="h-4 w-4 text-[#635e53]" aria-hidden="true" />
                  Catatan tambahan <span className="font-normal text-[#635e53]">(opsional)</span>
                </label>
                <textarea
                  id="quick-booking-notes"
                  className="min-h-24 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition placeholder:text-[#746a61] focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                  placeholder="Tulis permintaan khusus jika ada"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              {formError && (
                <p
                  className="rounded-xl border border-[#C56A64]/40 bg-[#C56A64]/[0.08] px-4 py-3 text-base font-medium leading-relaxed text-[#8f3f3b]"
                  role="alert"
                >
                  {formError}
                </p>
              )}
              <button
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#9a5929] px-5 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#78451f] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929] active:scale-[0.99]"
                type="submit"
              >
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span>Kirim reservasi</span>
              </button>
              <p className="pt-1 text-center text-sm leading-relaxed text-[#4f4542]">
                Konfirmasi reservasi akan diteruskan ke WhatsApp Customer Service dalam waktu kurang dari 10 menit.
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
