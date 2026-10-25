import React, { useEffect, useMemo, useState } from "react";
import { MenuItem, TableItem, ReservationData } from "../types/reservation";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";
import {
  getTomorrowDate,
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
  const [date, setDate] = useState(getTomorrowDate);
  const [timeSlot, setTimeSlot] = useState("");
  const [packageId, setPackageId] = useState("");
  const [pax, setPax] = useState<number | "">("");
  const [tableId, setTableId] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const paxCount = typeof pax === "number" ? pax : 0;
  const capacitySuitableTables = useMemo(
    () =>
      availableTables
        .filter(
          (table) =>
            table.status === "available" &&
            (!paxCount || table.seats >= paxCount),
        )
        .sort((a, b) => a.seats - b.seats),
    [availableTables, paxCount],
  );

  useEffect(() => {
    if (date < getTomorrowDate()) {
      const tomorrow = getTomorrowDate();
      setDate(tomorrow);
      onDateChange(tomorrow);
    }
  }, [date, onDateChange]);

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
      !isTableCapacitySuitable(paxCount, chosenTable)
    ) {
      setFormError(
        `Pilih meja tersedia dengan kapasitas yang cukup untuk ${paxCount} orang.`,
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
    <div id="reservasi">
      <div className="rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-sm sm:p-8">
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
                    min={getTomorrowDate()}
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
                  <p className="mt-1.5 text-sm text-[#4f4542]">
                    Minimal 2, maksimal 12 orang. Untuk rombongan lebih besar,{" "}
                    <a
                      href="https://wa.me/6282129211422?text=Halo%20Admin%20D%27Lingga%20Coffee,%20saya%20ingin%20reservasi%20untuk%20rombongan%20lebih%20dari%2012%20orang."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#187344] underline underline-offset-2 hover:text-[#125c36]"
                    >
                      chat admin via WhatsApp.
                    </a>
                  </p>
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
                  . Meja ditampilkan dari kapasitas terkecil.
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
    </div>
  );
};
