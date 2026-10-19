import React, { useState, useMemo } from "react";
import {
  TableItem,
  MenuItem,
  AddonItem,
  ReservationData,
} from "../types/reservation";
import { FloorPlan } from "./FloorPlan";
import {
  getSmallestSuitableTableCapacity,
  getTodayDate,
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
  initialTableId?: string;
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
  initialTableId = "M-01",
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
  const [pax, setPax] = useState<number>(
    Math.max(2, packages.find((item) => item.id === initialPackageId)?.minPax ?? 2),
  );
  const [packageSelections, setPackageSelections] = useState<Record<string, number>>(
    () => ({
      [initialPackageId]: Math.max(
        2,
        packages.find((item) => item.id === initialPackageId)?.minPax ?? 2,
      ),
    }),
  );
  const [selectedTableId, setSelectedTableId] = useState<string>(() => {
    const recommendedCapacity = getSmallestSuitableTableCapacity(2, tables);
    const initialTable = tables.find((table) => table.id === initialTableId);
    if (
      initialTable?.status === "available" &&
      initialTable &&
      isTableCapacitySuitable(2, initialTable, tables)
    ) {
      return initialTable.id;
    }
    return (
      tables.find(
        (table) =>
          table.status === "available" && table.seats === recommendedCapacity,
      )?.id ?? ""
    );
  });
  const [selectedAddons, setSelectedAddons] = useState<{
    [addonId: string]: number;
  }>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find selected objects
  const assignedPax = Object.values(packageSelections).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const selectedPackageItems = packages.filter(
    (item) => (packageSelections[item.id] ?? 0) > 0,
  );
  const packageMinimum = Math.max(
    2,
    ...selectedPackageItems.map((item) => item.minPax ?? 2),
  );
  const packageId =
    Object.keys(packageSelections).length === 1
      ? Object.keys(packageSelections)[0]
      : "mixed";
  const recommendedCapacity = getSmallestSuitableTableCapacity(pax, tables);
  const capacitySuitableTables = useMemo(
    () => tables.filter((table) => table.seats === recommendedCapacity),
    [recommendedCapacity, tables],
  );
  const selectedTable =
    tables.find((table) => table.id === selectedTableId) ??
    capacitySuitableTables[0] ??
    tables[0];

  const handlePaxChange = (nextPax: number) => {
    const adjustedPax = Math.min(12, Math.max(packageMinimum, assignedPax, nextPax));
    setPax(adjustedPax);
    const nextCapacity = getSmallestSuitableTableCapacity(adjustedPax, tables);
    const selectedTable = tables.find((table) => table.id === selectedTableId);
    if (!selectedTable || selectedTable.seats !== nextCapacity) {
      setSelectedTableId(
        tables.find(
          (table) =>
            table.status === "available" && table.seats === nextCapacity,
        )?.id ?? "",
      );
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
  const taxAmount = Math.round(subtotal * 0.1);
  const totalAmount = subtotal + taxAmount;

  const handlePackageQty = (packageId: string, delta: number) => {
    setPackageSelections((current) => {
      const selectedCount = current[packageId] ?? 0;
      const nextCount = selectedCount + delta;
      if (nextCount < 0 || (delta > 0 && assignedPax >= pax)) return current;

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
    if (!chosenTable || !isTableCapacitySuitable(pax, chosenTable, tables)) {
      setFormError(
        `Pilih meja yang sesuai untuk ${pax} orang sebelum melanjutkan.`,
      );
      return;
    }
    if (assignedPax !== pax) {
      setFormError(
        `Atur pilihan menu untuk semua tamu. Saat ini ${assignedPax} dari ${pax} tamu sudah mendapat pilihan.`,
      );
      return;
    }
    if (packageSelections["a-la-carte"] && addonsTotal === 0) {
      setFormError(
        "Tambahkan minimal satu item A la Carte untuk tamu yang memilih menu tersebut.",
      );
      return;
    }
    if (pax < packageMinimum) {
      setFormError(`Paket yang dipilih memerlukan minimal ${packageMinimum} tamu dalam reservasi.`);
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

    const formatPrice = (amount: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount);
    const orderedAddons = Object.entries(selectedAddons)
      .map(([addonId, quantity]) => {
        const addon = addons.find((item) => item.id === addonId);
        return addon
          ? `- ${addon.name} x${quantity}: ${formatPrice(addon.price * quantity)}`
          : null;
      })
      .filter((item): item is string => item !== null);
    const orderedPackages = Object.entries(packageSelections).map(([id, quantity]) => {
      const item = packages.find((menuPackage) => menuPackage.id === id);
      return `${item?.name ?? "A la Carte"} × ${quantity} orang`;
    });
    setIsSubmitting(true);
    try {
      const savedReservation = await onCompleteBooking(newReservation);
      if (!savedReservation) return;

      const message = [
        "Halo Admin DLingga Coffee, ada pengajuan booking baru yang perlu dikonfirmasi.",
        "",
        `Booking ID: ${savedReservation.bookingId}`,
        `Nama: ${customerName.trim()}`,
        `No. WhatsApp: ${customerPhone.trim()}`,
        `Tanggal: ${date}`,
        `Waktu: ${timeSlot}`,
        `Jumlah tamu: ${pax} orang`,
        `Meja: ${selectedTable?.name ?? selectedTableId}`,
        "Pilihan menu:",
        ...orderedPackages.map((item) => `- ${item}`),
        "Menu tambahan:",
        ...(orderedAddons.length > 0 ? orderedAddons : ["- Tidak ada"]),
        `Catatan: ${notes.trim() || "-"}`,
        `Subtotal: ${formatPrice(subtotal)}`,
        `Pajak: ${formatPrice(taxAmount)}`,
        `Total: ${formatPrice(totalAmount)}`,
        "",
        "Mohon segera tinjau dan konfirmasi booking ini. Terima kasih.",
      ].join("\n");
      const whatsappUrl = `https://wa.me/6282129211422?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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
                {selectedPackageItems.length > 0
                  ? `${selectedPackageItems.length} pilihan menu`
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
            <div className="bg-white rounded-2xl border border-[#E7DFD4] p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7DFD4]">
                <div>
                  <h3 className="font-display text-base font-bold text-[#1a0f0b]">
                    Atur Waktu & Jumlah Tamu
                  </h3>
                  <p className="text-xs text-[#635e53]">
                    Pilih tanggal, waktu kedatangan, dan jumlah tamu untuk
                    melihat pilihan meja.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1a0f0b]">
                  Tanggal
                  <input
                    type="date"
                    value={date}
                    min={getTodayDate()}
                    onChange={(event) => {
                      setDate(event.target.value);
                      onDateChange(event.target.value);
                    }}
                    className="rounded-lg border border-[#E7DFD4] bg-white px-2.5 py-2 text-xs"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1a0f0b]">
                    Jumlah Tamu:
                  </span>
                  <div className="flex items-center border border-[#E7DFD4] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      aria-label="Kurangi jumlah tamu"
                      disabled={pax <= Math.max(packageMinimum, assignedPax, 2)}
                      onClick={() => handlePaxChange(Math.max(2, pax - 1))}
                      className="px-2.5 py-1 bg-[#F8F5F0] hover:bg-[#e7dfd1] text-xs font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-[#1a0f0b] bg-white">
                      {pax} Pax
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah jumlah tamu"
                      disabled={pax >= 12}
                      onClick={() => handlePaxChange(pax + 1)}
                      className="px-2.5 py-1 bg-[#F8F5F0] hover:bg-[#e7dfd1] text-xs font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Slots Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
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
                      className={`p-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer ${
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
            </div>

            {/* Interactive Floor Plan Selector */}
            <div className="bg-white rounded-2xl border border-[#E7DFD4] p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#E7DFD4] gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-[#1a0f0b]">
                    Pilih Meja di Denah Kafe
                  </h3>
                  <p className="text-xs text-[#635e53]">
                    Pilihan dibatasi ke kapasitas meja paling kecil yang cukup
                    untuk {pax} orang
                  </p>
                </div>
                {/* Legend Mini */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-[#635e53]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#71916B]" />{" "}
                    Tersedia
                  </span>
                  <span className="flex items-center gap-1 text-[#635e53]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D98A45]" />{" "}
                    Reserved
                  </span>
                  <span className="flex items-center gap-1 text-[#635e53]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C56A64]" />{" "}
                    Penuh
                  </span>
                </div>
              </div>

              {/* Floor Plan Render */}
              <FloorPlan
                tables={capacitySuitableTables}
                selectedTableId={selectedTableId}
                onSelectTable={(table) => setSelectedTableId(table.id)}
                interactive={true}
              />
              {!recommendedCapacity && (
                <p className="mt-3 rounded-lg bg-[#FBEEEE] p-3 text-xs text-[#A8544E]">
                  Tidak tersedia meja yang cukup untuk {pax} orang.
                </p>
              )}

              {/* Selected Table Callout */}
              <div className="mt-4 p-3 rounded-xl bg-[#faebe2] border border-[#E7DFD4] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#30231f] text-white flex items-center justify-center font-bold text-xs">
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
                <span className="text-[11px] font-bold text-[#71916B] bg-white px-2.5 py-1 rounded-full border border-[#E7DFD4]">
                  Terkunci
                </span>
              </div>
            </div>

            {/* Package Selection */}
            <section
              className="rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-xs"
              aria-labelledby="package-selection-title"
            >
              <div className="mb-4 border-b border-[#E7DFD4] pb-3">
                <h3
                  id="package-selection-title"
                  className="font-display text-base font-bold text-[#1a0f0b]"
                >
                  Atur menu untuk setiap tamu
                </h3>
                <p className="mt-1 text-xs text-[#635e53]">
                  Bagi jumlah tamu ke paket atau A la Carte. Total pilihan harus
                  sama dengan jumlah tamu di atas.
                </p>
                <p className="mt-2 text-xs font-semibold text-[#D98A45]" aria-live="polite">
                  Sudah dipilih: {assignedPax} dari {pax} tamu
                  {assignedPax < pax ? ` · Pilih untuk ${pax - assignedPax} tamu lagi` : " · Semua tamu sudah dipilih"}
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
                        <span className="text-sm font-bold text-[#1a0f0b]">
                          {item.name}
                        </span>
                        <span className="text-xs font-semibold text-[#D98A45]">
                          Rp{item.price.toLocaleString("id-ID")} / orang
                        </span>
                      </span>
                      <span className="mt-2 block text-[11px] leading-4 text-[#635e53]">
                        {item.description}
                      </span>
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#E7DFD4] pt-3">
                        <span className="text-xs text-[#635e53]">
                          Minimal {item.minPax ?? 2} tamu dalam reservasi
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Kurangi ${item.name}`}
                            disabled={quantity === 0}
                            onClick={() => handlePackageQty(item.id, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7DFD4] text-[#1a0f0b] disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-14 text-center text-xs font-bold text-[#1a0f0b]">
                            {quantity} orang
                          </span>
                          <button
                            type="button"
                            aria-label={`Tambah ${item.name}`}
                            disabled={assignedPax >= pax}
                            onClick={() => handlePackageQty(item.id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D98A45] text-white disabled:opacity-40"
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
                    <span className="text-sm font-bold text-[#1a0f0b]">
                      A la Carte
                    </span>
                    <span className="text-xs font-semibold text-[#D98A45]">
                      Pilih item menu
                    </span>
                  </span>
                  <span className="mt-2 block text-[11px] leading-4 text-[#635e53]">
                    Untuk tamu yang tidak memilih paket. Tambahkan minuman atau
                    camilan A la Carte di bawah.
                  </span>
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#E7DFD4] pt-3">
                    <button
                      type="button"
                      aria-label="Kurangi tamu A la Carte"
                      disabled={!packageSelections["a-la-carte"]}
                      onClick={() => handlePackageQty("a-la-carte", -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7DFD4] text-[#1a0f0b] disabled:opacity-40"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-14 text-center text-xs font-bold text-[#1a0f0b]">
                      {packageSelections["a-la-carte"] ?? 0} orang
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah tamu A la Carte"
                      disabled={assignedPax >= pax}
                      onClick={() => handlePackageQty("a-la-carte", 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D98A45] text-white disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Addon Menu Options */}
            <div className="bg-white rounded-2xl border border-[#E7DFD4] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E7DFD4]">
                <div>
                  <h3 className="font-display text-base font-bold text-[#1a0f0b]">
                    Tambah Minuman & Camilan Favorit
                  </h3>
                  <p className="text-xs text-[#635e53]">
                    {packageSelections["a-la-carte"]
                      ? "Wajib pilih setidaknya satu item untuk menu A la Carte."
                      : "Tambahan langsung disajikan hangat saat menjelang berbuka."}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#D98A45] bg-[#faebe2] px-2.5 py-1 rounded-full">
                  {packageSelections["a-la-carte"] ? "Wajib" : "Opsional"}
                </span>
              </div>

              <div className="space-y-3">
                {addons.map((addon) => {
                  const qty = selectedAddons[addon.id] || 0;
                  return (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#E7DFD4] hover:bg-[#F8F5F0] transition-colors"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1a0f0b]">
                            {addon.name}
                          </span>
                          <span className="text-[10px] text-[#635e53] bg-[#e7dfd1] px-1.5 py-0.5 rounded">
                            {addon.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#635e53] mt-0.5">
                          {addon.description}
                        </p>
                        <p className="text-xs font-bold text-[#D98A45] mt-1">
                          Rp{addon.price.toLocaleString("id-ID")}
                          <span className="text-[10px] text-[#635e53] font-normal">
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
                            onClick={() => handleAddonQty(addon.id, -1)}
                            className="w-7 h-7 rounded-lg border border-[#E7DFD4] bg-white hover:bg-[#faebe2] flex items-center justify-center text-[#1a0f0b] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="w-5 text-center text-xs font-bold text-[#1a0f0b]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddonQty(addon.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#D98A45] hover:bg-[#C27734] text-white flex items-center justify-center cursor-pointer shadow-xs"
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
                    const label = item?.name ?? "A la Carte";
                    return (
                      <div key={id} className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1a0f0b]">{label}</p>
                          <p className="text-[11px] text-[#635e53]">
                            {quantity} orang × Rp{unitPrice.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <span className="font-bold text-[#1a0f0b]">
                          Rp{(unitPrice * quantity).toLocaleString("id-ID")}
                        </span>
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

                  {/* Subtotal & Tax */}
                  <div className="border-t border-[#E7DFD4] pt-3 space-y-1.5">
                    <div className="flex justify-between text-[#635e53]">
                      <span>Subtotal Menu</span>
                      <span className="font-medium text-[#1a0f0b]">
                        Rp{subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#635e53]">
                      <span>Pajak Restoran & Service (10%)</span>
                      <span className="font-medium text-[#1a0f0b]">
                        Rp{taxAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

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
                className="border-t border-[#E7DFD4] pt-4 space-y-3.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a0f0b]">
                  <User className="w-4 h-4 text-[#D98A45]" />
                  <span>Form Data Pemesan</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#635e53] mb-1">
                    Nama lengkap <span className="text-[#A8544E]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-xs text-[#1a0f0b] outline-none"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setFormError("");
                      }}
                      placeholder="Nama lengkap Anda"
                      autoComplete="off"
                      maxLength={120}
                      required
                    />
                    <User className="w-4 h-4 text-[#635e53] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#635e53] mb-1">
                    Nomor WhatsApp aktif{" "}
                    <span className="text-[#A8544E]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-xs text-[#1a0f0b] outline-none font-mono"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setFormError("");
                      }}
                      placeholder="Nomor WhatsApp Anda"
                      type="tel"
                      autoComplete="off"
                      maxLength={20}
                      required
                    />
                    <Phone className="w-4 h-4 text-[#635e53] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#635e53] mb-1">
                    Catatan Khusus (Opsional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-xs text-[#1a0f0b] outline-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tulis permintaan khusus jika ada"
                    rows={2}
                  />
                  <p className="mt-1 text-[10px] text-[#8a7d73]">
                    Opsional. Tinggalkan kosong jika tidak ada permintaan
                    khusus.
                  </p>
                </div>

                {/* Availability notice */}
                <div className="p-3 rounded-lg bg-[#faebe2] border border-[#E7DFD4] text-[11px] text-[#635e53] flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#D98A45] shrink-0 mt-0.5" />
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
                    className="rounded-lg bg-[#FBEEEE] px-3 py-2.5 text-xs text-[#A8544E]"
                  >
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-[#1a0f0b] hover:bg-[#30231f] disabled:cursor-wait disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-[#D98A45]" />
                  <span>
                    {isSubmitting
                      ? "Mengirim pengajuan..."
                      : "Ajukan Reservasi"}
                  </span>
                </button>
                <p className="text-center text-[11px] leading-4 text-[#635e53]">
                  WhatsApp akan terbuka dengan detail booking Anda. Tekan Kirim
                  di WhatsApp agar admin menerima pengajuan.
                </p>

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2 text-center text-xs text-[#635e53] hover:text-[#1a0f0b] font-medium transition-colors cursor-pointer"
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
