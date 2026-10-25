import React, { useState, useMemo, useEffect } from "react";
import {
  TableItem,
  MenuItem,
  AddonItem,
  ReservationData,
} from "../types/reservation";
import {
  getTomorrowDate,
  isTableCapacitySuitable,
} from "../data/reservations";
import {
  Check,
  CheckCircle,
  Clock,
  User,
  Phone,
  MessageSquare,
  HelpCircle,
  ArrowLeft,
  Plus,
  Minus,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface BookingWizardProps {
  tables: TableItem[];
  packages: MenuItem[];
  addons: AddonItem[];
  initialPackageId?: string;
  initialDate: string;
  onDateChange: (date: string) => void;
  onBack: () => void;
  onCompleteBooking: (
    reservation: ReservationData,
  ) => Promise<ReservationData | null>;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  tables,
  packages,
  addons,
  initialPackageId = "paket-rame-rame",
  initialDate,
  onDateChange,
  onBack,
  onCompleteBooking,
}) => {
  // Step state (1: Jadwal, 2: Menu, 3: Denah Meja & Konfirmasi)
  const [currentStep, setCurrentStep] = useState<number>(3);

  // Reservation Form State
  const [date, setDate] = useState(initialDate);
  const [timeSlot, setTimeSlot] = useState("");
  const [pax, setPax] = useState<number>(2);
  const [packageSelections, setPackageSelections] = useState<Record<string, number>>(
    () => ({ [initialPackageId]: 2 }),
  );
  const [selectedTableId, setSelectedTableId] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<{
    [addonId: string]: number;
  }>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (date < getTomorrowDate()) {
      const tomorrow = getTomorrowDate();
      setDate(tomorrow);
      onDateChange(tomorrow);
      setSelectedTableId("");
    }
  }, [date, onDateChange]);

  // Find selected objects
  const selectedPackageCount = Object.values(packageSelections).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const selectedPackageItems = packages.filter(
    (item) => (packageSelections[item.id] ?? 0) > 0,
  );
  const packageId =
    Object.keys(packageSelections).length === 1
      ? Object.keys(packageSelections)[0]
      : "mixed";
  const capacitySuitableTables = useMemo(
    () =>
      tables
        .filter((table) => table.status === "available" && table.seats >= pax)
        .sort((a, b) => a.seats - b.seats),
    [pax, tables],
  );
  const selectedTable = tables.find((table) => table.id === selectedTableId);

  useEffect(() => {
    if (!capacitySuitableTables.some((table) => table.id === selectedTableId)) {
      setSelectedTableId("");
    }
  }, [capacitySuitableTables, selectedTableId]);

  const handlePaxChange = (nextPax: number) => {
    const adjustedPax = Math.min(12, Math.max(2, nextPax));
    setPax(adjustedPax);
    const selectedTable = tables.find((table) => table.id === selectedTableId);
    if (selectedTable && selectedTable.seats < adjustedPax) {
      setSelectedTableId("");
    }
  };

  // Calculations
  const packageTotal = packages.reduce(
    (total, item) =>
      total + item.price * (packageSelections[item.id] ?? 0),
    0,
  );
  const addonsTotal = Object.entries(selectedAddons).reduce(
    (sum, [addonId, qty]) => {
      const item = addons.find((a) => a.id === addonId);
      return sum + (item ? item.price * qty : 0);
    },
    0,
  );

  const subtotal = packageTotal + addonsTotal;
  const taxAmount = 0;
  const totalAmount = subtotal;

  const handlePackageQty = (packageId: string, delta: number) => {
    setPackageSelections((current) => {
      const selectedCount = current[packageId] ?? 0;
      const nextCount = selectedCount + delta;
      if (nextCount < 0 || nextCount > 30) {
        return current;
      }

      const next = { ...current };
      if (nextCount === 0) delete next[packageId];
      else next[packageId] = nextCount;
      return next;
    });
    setFormError("");
  };

  const handleAddonQty = (addonId: string, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return { ...prev, [addonId]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError(
        "Isi nama lengkap dan nomor WhatsApp aktif untuk melanjutkan.",
      );
      return;
    }
    if (!timeSlot) {
      setFormError("Pilih waktu kedatangan terlebih dahulu.");
      return;
    }
    const chosenTable = tables.find((table) => table.id === selectedTableId);
    if (!chosenTable || !isTableCapacitySuitable(pax, chosenTable)) {
      setFormError(
        `Pilih meja yang sesuai untuk ${pax} orang sebelum melanjutkan.`,
      );
      return;
    }
    if (selectedPackageCount < pax) {
      setFormError(
        `Jumlah paket minimal harus sama dengan jumlah tamu. Saat ini ${selectedPackageCount} dari minimal ${pax} paket sudah dipilih.`,
      );
      return;
    }
    const provisionalBookingId = "Menunggu konfirmasi";

    const newReservation: ReservationData = {
      bookingId: provisionalBookingId,
      customerName,
      customerPhone,
      date,
      timeSlot,
      pax,
      packageId,
      packageSelections,
      tableId: selectedTableId,
      notes,
      addons: selectedAddons,
      status: "pending",
      createdAt: new Date().toISOString(),
      subtotal,
      taxAmount,
      totalAmount,
    };

    setIsSubmitting(true);
    try {
      const savedReservation = await onCompleteBooking(newReservation);
      if (!savedReservation) return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Step Navigation Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {/* Step 1 */}
          <div
            onClick={() => setCurrentStep(1)}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
              currentStep === 1
                ? "bg-white border-[#D98A45] ring-2 ring-[#D98A45]/20 shadow-xs"
                : "bg-white/80 border-[#E7DFD4]"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#71916B] text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-[#635e53] uppercase tracking-wider">
                STEP 1 • JADWAL
              </p>
              <p className="text-xs font-semibold text-[#1a0f0b] truncate">
                {new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
                , {timeSlot || "Pilih waktu"} ({pax} org)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setCurrentStep(2)}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
              currentStep === 2
                ? "bg-white border-[#D98A45] ring-2 ring-[#D98A45]/20 shadow-xs"
                : "bg-white/80 border-[#E7DFD4]"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#71916B] text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-[#635e53] uppercase tracking-wider">
                STEP 2 • MENU
              </p>
              <p className="text-xs font-semibold text-[#1a0f0b] truncate">
                {selectedPackageItems.length + (packageSelections["a-la-carte"] ? 1 : 0) > 0
                  ? `${selectedPackageItems.length + (packageSelections["a-la-carte"] ? 1 : 0)} pilihan menu`
                  : "Belum memilih menu"}
              </p>
            </div>
          </div>

          {/* Step 3 - Active */}
          <div
            onClick={() => setCurrentStep(3)}
            className={`p-3.5 rounded-xl border-2 border-[#D98A45] bg-[#ffdcc3]/30 flex items-center gap-3 shadow-xs cursor-pointer`}
          >
            <div className="w-6 h-6 rounded-full bg-[#D98A45] text-white flex items-center justify-center shrink-0 text-xs font-bold">
              3
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-[#D98A45] text-white text-[10px] font-bold tracking-wider uppercase">
                AKTIF
              </span>
              <p className="text-xs font-bold text-[#1a0f0b] mt-0.5">
                Denah Meja & Form
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl border border-[#E7DFD4] bg-white/50 flex items-center gap-3 opacity-70">
            <div className="w-6 h-6 rounded-full bg-[#e7dfd1] text-[#635e53] flex items-center justify-center shrink-0 text-xs font-bold">
              4
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#635e53] uppercase tracking-wider">
                STEP 4
              </p>
              <p className="text-xs font-medium text-[#635e53]">
                Konfirmasi E-Tiket
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Interactive Left & Sticky Summary Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Floor Plan, Schedules & Addons (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1 & 2 Fast Modifiers */}
            <div className="rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 border-b border-[#E7DFD4] pb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                    1. Atur jadwal dan jumlah tamu
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#4f4542]">
                    Tentukan jadwal terlebih dahulu untuk melihat meja yang sesuai.
                  </p>
                </div>
                <label htmlFor="wizard-date" className="flex flex-col gap-2 text-base font-semibold text-[#1a0f0b]">
                  Tanggal kedatangan
                  <input
                    id="wizard-date"
                    type="date"
                    value={date}
                    min={getTomorrowDate()}
                    onChange={(event) => {
                      setDate(event.target.value);
                      onDateChange(event.target.value);
                    }}
                    className="min-h-12 rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base outline-none focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-semibold text-[#1a0f0b]">
                    Jumlah tamu
                  </span>
                  <div className="flex min-h-12 items-center overflow-hidden rounded-xl border border-[#cfc4b7]">
                    <button
                      type="button"
                      aria-label="Kurangi jumlah tamu"
                      disabled={pax <= 2}
                      onClick={() => handlePaxChange(Math.max(2, pax - 1))}
                      className="h-12 w-12 bg-[#F8F5F0] text-xl font-bold text-[#1a0f0b] hover:bg-[#e7dfd1] focus-visible:outline-2 focus-visible:outline-[#9a5929] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="min-w-24 px-3 py-2 text-center text-base font-bold text-[#1a0f0b]">
                      {pax} orang
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah jumlah tamu"
                      disabled={pax >= 12}
                      onClick={() => handlePaxChange(pax + 1)}
                      className="h-12 w-12 bg-[#F8F5F0] text-xl font-bold text-[#1a0f0b] hover:bg-[#e7dfd1] focus-visible:outline-2 focus-visible:outline-[#9a5929] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Slots Chips */}
              <fieldset className="mt-4">
                <legend className="mb-2 text-base font-semibold text-[#1a0f0b]">
                  Waktu kedatangan <span className="text-[#9a5929]">*</span>
                </legend>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  "16.30 WIB",
                  "17.00 WIB",
                  "17.30 - 19.30 WIB",
                  "18.30 WIB",
                ].map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setTimeSlot(slot);
                        setFormError("");
                      }}
                      aria-pressed={isSelected}
                      className={`min-h-12 rounded-xl border px-3 py-3 text-base font-semibold text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929] ${
                        isSelected
                          ? "bg-[#30231f] text-white border-[#30231f] shadow-xs"
                          : "bg-white text-[#635e53] border-[#E7DFD4] hover:border-[#D98A45]"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
                </div>
              </fieldset>
            </div>

            {/* Table Selection */}
            <div className="rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 border-b border-[#E7DFD4] pb-4">
                <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                  2. Pilih meja
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#4f4542]">
                  Pilih meja tersedia dengan kapasitas yang cukup untuk {pax} orang. Meja diurutkan dari kapasitas terkecil.
                </p>
              </div>

              <label
                htmlFor="wizard-table-selection"
                className="mb-2 block text-base font-semibold text-[#1a0f0b]"
              >
                Meja tersedia <span className="text-[#9a5929]">*</span>
              </label>
              <select
                id="wizard-table-selection"
                value={selectedTableId}
                onChange={(event) => {
                  setSelectedTableId(event.target.value);
                  setFormError("");
                }}
                required
                disabled={capacitySuitableTables.length === 0}
                className="min-h-12 w-full cursor-pointer rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none transition focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25 disabled:cursor-not-allowed disabled:bg-[#F8F5F0] disabled:text-[#635e53]"
              >
                <option value="" disabled>
                  {capacitySuitableTables.length === 0
                    ? `Tidak ada meja tersedia untuk ${pax} orang`
                    : "Pilih meja yang tersedia"}
                </option>
                {capacitySuitableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} - {table.zoneName} ({table.seats} kursi)
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm leading-relaxed text-[#4f4542]">
                Pilihan menampilkan semua meja yang tersedia dan cukup untuk jumlah tamu.
              </p>
              {capacitySuitableTables.length === 0 && (
                <p className="mt-3 rounded-lg bg-[#FBEEEE] p-3 text-xs text-[#A8544E]">
                  Tidak tersedia meja yang cukup untuk {pax} orang.
                </p>
              )}

              {/* Selected Table Callout */}
              <div className="mt-4 rounded-xl border border-[#E7DFD4] bg-[#faebe2] p-3">
                {selectedTable ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#30231f] text-xs font-bold text-white">
                        {selectedTable.id}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1a0f0b]">
                          {selectedTable.name} ({selectedTable.seats} Kursi)
                        </p>
                        <p className="text-[11px] text-[#635e53]">
                          {selectedTable.zoneName} · {selectedTable.description}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-[#E7DFD4] bg-white px-2.5 py-1 text-[11px] font-bold text-[#71916B]">
                      Dipilih
                    </span>
                  </div>
                ) : (
                  <p className="text-center text-base font-medium leading-relaxed text-[#4f4542]">
                    Pilih meja pada daftar untuk melanjutkan.
                  </p>
                )}
              </div>
            </div>

            {/* Package Selection */}
            <section
              className="rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-sm sm:p-6"
              aria-labelledby="package-selection-title"
            >
              <div className="mb-4 border-b border-[#E7DFD4] pb-3">
                <h3
                  id="package-selection-title"
                  className="font-display text-lg font-bold text-[#1a0f0b]"
                >
                  Atur pilihan menu
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#4f4542]">
                  Pilih minimal satu paket per tamu. Anda boleh memesan paket
                  tambahan melebihi jumlah tamu.
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#8c4d20]" aria-live="polite">
                  {selectedPackageCount} paket dipilih untuk {pax} tamu
                  {selectedPackageCount < pax
                    ? ` · Tambahkan minimal ${pax - selectedPackageCount} paket lagi`
                    : selectedPackageCount > pax
                      ? ` · ${selectedPackageCount - pax} paket tambahan`
                      : " · Minimal paket per tamu terpenuhi"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {packages.map((item) => {
                  const quantity = packageSelections[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 transition ${
                        quantity > 0
                          ? "border-[#D98A45] bg-[#FFF8F2] ring-2 ring-[#D98A45]/15"
                          : "border-[#E7DFD4] hover:border-[#D98A45]"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-base font-bold text-[#1a0f0b]">
                          {item.name}
                        </span>
                        <span className="text-sm font-semibold text-[#8c4d20]">
                          Rp{item.price.toLocaleString("id-ID")} / orang
                        </span>
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-[#4f4542]">
                        {item.description}
                      </span>
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#E7DFD4] pt-3">
                        <span className="text-sm text-[#4f4542]">
                          Bisa dipesan mulai 1 paket
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Kurangi ${item.name}`}
                            disabled={quantity === 0}
                            onClick={() => handlePackageQty(item.id, -1)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#cfc4b7] text-[#1a0f0b] hover:bg-[#F8F5F0] focus-visible:outline-2 focus-visible:outline-[#9a5929] disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-16 text-center text-sm font-bold text-[#1a0f0b]">
                            {quantity} paket
                          </span>
                          <button
                            type="button"
                            aria-label={`Tambah ${item.name}`}
                            disabled={quantity >= 30}
                            onClick={() => handlePackageQty(item.id, 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#9a5929] text-white hover:bg-[#78451f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929] disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div
                  className={`rounded-xl border p-4 transition ${
                    (packageSelections["a-la-carte"] ?? 0) > 0
                      ? "border-[#D98A45] bg-[#FFF8F2] ring-2 ring-[#D98A45]/15"
                      : "border-[#E7DFD4] hover:border-[#D98A45]"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-base font-bold text-[#1a0f0b]">
                      Paket A La Carte
                    </span>
                    <span className="text-xs font-semibold text-[#D98A45]">
                      Pilih item menu
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-[#4f4542]">
                    Pilih paket A la Carte untuk tiap porsi yang ingin dipesan,
                    lalu pilih minuman atau camilan di bawah jika diperlukan.
                  </span>
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#E7DFD4] pt-3">
                    <button
                      type="button"
                      aria-label="Kurangi jumlah paket A la Carte"
                      disabled={!packageSelections["a-la-carte"]}
                      onClick={() => handlePackageQty("a-la-carte", -1)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#cfc4b7] text-[#1a0f0b] hover:bg-[#F8F5F0] focus-visible:outline-2 focus-visible:outline-[#9a5929] disabled:opacity-40"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-16 text-center text-sm font-bold text-[#1a0f0b]">
                      {packageSelections["a-la-carte"] ?? 0} paket
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah jumlah paket A la Carte"
                      disabled={(packageSelections["a-la-carte"] ?? 0) >= 30}
                      onClick={() => handlePackageQty("a-la-carte", 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#9a5929] text-white hover:bg-[#78451f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929] disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Addon Menu Options */}
            <div className="rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-col gap-2 border-b border-[#E7DFD4] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                    3. Tambahan minuman dan camilan
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#4f4542]">
                    "Pilih minuman atau camilan tambahan jika diinginkan."
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[#faebe2] px-3 py-1.5 text-sm font-semibold text-[#8c4d20]">
                  Opsional
                </span>
              </div>

              <div className="space-y-3">
                {addons.map((addon) => {
                  const qty = selectedAddons[addon.id] || 0;
                  return (
                    <div
                      key={addon.id}
                      className="flex flex-col gap-3 rounded-xl border border-[#E7DFD4] p-4 transition-colors hover:bg-[#F8F5F0] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#1a0f0b]">
                            {addon.name}
                          </span>
                          <span className="rounded-full bg-[#e7dfd1] px-2 py-1 text-xs text-[#4f4542]">
                            {addon.category}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-[#4f4542]">
                          {addon.description}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#8c4d20]">
                          Rp{addon.price.toLocaleString("id-ID")}
                          <span className="font-normal text-[#4f4542]">
                            {" "}
                            / {addon.unit}
                          </span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {qty > 0 && (
                          <button
                            type="button"
                            aria-label={`Kurangi ${addon.name}`}
                            onClick={() => handleAddonQty(addon.id, -1)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#cfc4b7] bg-white text-[#1a0f0b] hover:bg-[#faebe2] focus-visible:outline-2 focus-visible:outline-[#9a5929]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="min-w-8 text-center text-base font-bold text-[#1a0f0b]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Tambah ${addon.name}`}
                          onClick={() => handleAddonQty(addon.id, 1)}
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#9a5929] text-white shadow-xs hover:bg-[#78451f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Ringkasan Reservasi & Form Data Pemesan (5 Cols - Matching Image 3) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E7DFD4] p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E7DFD4] mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#1a0f0b]">
                    Ringkasan Reservasi
                  </h3>
                  <p className="text-xs text-[#635e53]">
                    Verifikasi detail sebelum pembayaran & konfirmasi
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#faebe2] text-[#D98A45] text-xs font-bold">
                  Step 3 & 4
                </span>
              </div>

              {/* Studio & Kursi Terpilih (Cinema-like aesthetic from Image 3) */}
              <div className="bg-[#F8F5F0] rounded-xl p-3.5 border border-[#E7DFD4] mb-5 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#635e53] flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-[#D98A45]">
                      storefront
                    </span>
                    Zona / Area
                  </span>
                  <span className="font-bold text-[#1a0f0b]">
                    {selectedTable?.zoneName ?? "Belum dipilih"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-[#E7DFD4] pt-2">
                  <span className="text-[#635e53] flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-[#D98A45]">
                      chair
                    </span>
                    Meja Terpilih
                  </span>
                  <span className="font-bold text-[#D98A45]">
                    {selectedTable
                      ? `${selectedTable.name} (${selectedTable.seats} Kursi)`
                      : "Belum ada meja tersedia"}
                  </span>
                </div>
              </div>

              {/* Rincian Menu Dipilih */}
              <div className="mb-5">
                <span className="text-[11px] font-bold text-[#635e53] uppercase tracking-wider block mb-2.5">
                  RINCIAN MENU DIPILIH
                </span>
                <div className="space-y-3 text-xs">
                  {Object.entries(packageSelections).length === 0 && (
                    <p className="text-[11px] text-[#8a7d73]">
                      Pilihan menu belum diatur.
                    </p>
                  )}
                  {Object.entries(packageSelections).map(([id, quantity]) => {
                    const item = packages.find((menuPackage) => menuPackage.id === id);
                    const unitPrice = item?.price ?? 0;
                    const isALaCarte = id === "a-la-carte";
                    const label = item?.name ?? "Paket A La Carte";
                    return (
                      <div key={id} className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1a0f0b]">{label}</p>
                          <p className="text-[11px] text-[#635e53]">
                            {isALaCarte
                              ? `${quantity} paket · harga sesuai item tambahan`
                              : `${quantity} paket × Rp${unitPrice.toLocaleString("id-ID")}`}
                          </p>
                        </div>
                        {!isALaCarte && (
                          <span className="font-bold text-[#1a0f0b]">
                            Rp{(unitPrice * quantity).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Addon Items */}
                  {Object.entries(selectedAddons).map(([addonId, qty]) => {
                    const item = addons.find((a) => a.id === addonId);
                    if (!item) return null;
                    return (
                      <div
                        key={addonId}
                        className="flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold text-[#1a0f0b]">
                            {qty}× {item.name}
                          </p>
                          <p className="text-[11px] text-[#635e53]">
                            Rp{item.price.toLocaleString("id-ID")} / {item.unit}
                          </p>
                        </div>
                        <span className="font-medium text-[#1a0f0b]">
                          Rp{(item.price * qty).toLocaleString("id-ID")}
                        </span>
                      </div>
                    );
                  })}

                  {/* Total Estimasi */}
                  <div className="border-t border-dashed border-[#E7DFD4] pt-3">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs text-[#635e53] font-semibold block">
                          Total Estimasi
                        </span>
                        <span className="text-[10px] text-[#71916B]">
                          Termasuk Takjil Kurma & Teh Hangat Gratis
                        </span>
                      </div>
                      <span className="font-display text-2xl font-bold text-[#D98A45]">
                        Rp{totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Data Pemesan */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5 border-t border-[#E7DFD4] pt-6"
                autoComplete="off"
              >
                <div className="flex items-center gap-2 text-lg font-bold text-[#1a0f0b]">
                  <User className="h-5 w-5 text-[#9a5929]" />
                  <span>4. Data pemesan</span>
                </div>

                <div>
                  <label htmlFor="wizard-customer-name" className="mb-2 block text-base font-semibold text-[#1a0f0b]">
                    Nama lengkap <span className="text-[#9a5929]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="wizard-customer-name"
                      className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white py-3 pl-11 pr-4 text-base text-[#1a0f0b] outline-none placeholder:text-[#746a61] focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setFormError("");
                      }}
                      placeholder="Masukkan nama lengkap"
                      autoComplete="name"
                      maxLength={120}
                      required
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-[#635e53]" aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <label htmlFor="wizard-customer-phone" className="mb-2 block text-base font-semibold text-[#1a0f0b]">
                    Nomor WhatsApp aktif <span className="text-[#9a5929]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="wizard-customer-phone"
                      className="min-h-12 w-full rounded-xl border border-[#cfc4b7] bg-white py-3 pl-11 pr-4 text-base text-[#1a0f0b] outline-none placeholder:text-[#746a61] focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setFormError("");
                      }}
                      placeholder="Contoh: 081234567890"
                      type="tel"
                      autoComplete="tel"
                      maxLength={20}
                      required
                    />
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-[#635e53]" aria-hidden="true" />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4f4542]">
                    Konfirmasi reservasi akan dikirim melalui WhatsApp ini.
                  </p>
                </div>

                <div>
                  <label htmlFor="wizard-notes" className="mb-2 block text-base font-semibold text-[#1a0f0b]">
                    Catatan tambahan <span className="font-normal text-[#4f4542]">(opsional)</span>
                  </label>
                  <textarea
                    id="wizard-notes"
                    className="min-h-24 w-full rounded-xl border border-[#cfc4b7] bg-white px-4 py-3 text-base text-[#1a0f0b] outline-none placeholder:text-[#746a61] focus:border-[#9a5929] focus:ring-2 focus:ring-[#9a5929]/25"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tulis permintaan khusus jika ada"
                    rows={3}
                  />
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4f4542]">
                    Opsional. Tinggalkan kosong jika tidak ada permintaan
                    khusus.
                  </p>
                </div>

                {/* Availability notice */}
                <div className="flex items-start gap-3 rounded-xl border border-[#E7DFD4] bg-[#faebe2] p-4 text-sm leading-relaxed text-[#4f4542]">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#9a5929]" />
                  <span>
                    Meja baru tercatat setelah pengajuan berhasil. Ketersediaan
                    dapat berubah jika ada pengajuan lain lebih dulu untuk
                    tanggal yang sama.
                  </span>
                </div>

                {/* Action Buttons */}
                {formError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-[#C56A64]/40 bg-[#FBEEEE] px-4 py-3 text-base leading-relaxed text-[#8f3f3b]"
                  >
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#1a0f0b] px-5 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-[#30231f] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                >
                  <CheckCircle className="h-5 w-5 text-[#ffb77d]" />
                  <span>
                    {isSubmitting
                      ? "Mengirim pengajuan..."
                      : "Ajukan Reservasi"}
                  </span>
                </button>
                <p className="text-center text-sm leading-relaxed text-[#4f4542]">
                  WhatsApp akan terbuka dengan detail booking Anda. Tekan Kirim
                  di WhatsApp agar admin menerima pengajuan.
                </p>

                <button
                  type="button"
                  onClick={onBack}
                  className="min-h-12 w-full rounded-lg py-3 text-center text-base font-semibold text-[#4f4542] underline-offset-4 transition-colors hover:text-[#1a0f0b] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929]"
                >
                  ← Kembali ke Beranda
                </button>
              </form>
            </div>

            {/* Help Callout */}
            <div className="p-4 rounded-xl bg-white border border-[#E7DFD4] shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#635e53]" />
                <div>
                  <p className="font-semibold text-[#1a0f0b]">
                    Butuh bantuan reservasi?
                  </p>
                  <p className="text-[#635e53]">Call Center: (021) 789-9901</p>
                </div>
              </div>
              <span className="text-[11px] text-[#635e53] font-medium">
                Buka 10.00 - 22.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
