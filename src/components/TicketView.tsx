import React, { useState } from "react";
import {
  ReservationData,
  MenuItem,
  AddonItem,
  TableItem,
} from "../types/reservation";
import { FAQS } from "../data/mockData";
import {
  Check,
  CheckCircle,
  Calendar,
  MapPin,
  Home,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  User,
  CreditCard,
  Pencil,
} from "lucide-react";
import { isReservationEditable } from "../data/reservations";
import { EditReservationOrderModal } from "./EditReservationOrderModal";
import qrisImage from "../img/qris.jpg";

interface TicketViewProps {
  reservation: ReservationData;
  packages: MenuItem[];
  addons: AddonItem[];
  tables: TableItem[];
  onBackToHome: () => void;
  onUpdateReservation: (
    pax: number,
    packageSelections: Record<string, number>,
    addons: Record<string, number>,
  ) => Promise<ReservationData>;
}

export const TicketView: React.FC<TicketViewProps> = ({
  reservation,
  packages,
  addons,
  tables,
  onBackToHome,
  onUpdateReservation,
}) => {
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const selectedPackageItems = Object.entries(reservation.packageSelections).map(
    ([packageId, quantity]) => ({
      item: packages.find((menuPackage) => menuPackage.id === packageId),
      packageId,
      quantity,
    }),
  );
  const selectedTable = tables.find((t) => t.id === reservation.tableId);
  const isDpPaid = reservation.status === "dp_paid";
  const isCancelled = reservation.status === "cancelled";
  const isAwaitingDp = reservation.status === "awaiting_dp";

  // Format Indonesian Date
  const formatIndoDate = (dateString: string) => {
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
        );
        return d.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  const orderedPackages = selectedPackageItems.map(
    ({ item, packageId, quantity }) =>
      `- ${item?.name ?? packageId} × ${quantity} paket`,
  );
  const orderedAddons = Object.entries(reservation.addons)
    .map(([addonId, quantity]) => {
      const addon = addons.find((item) => item.id === addonId);
      return addon ? `- ${addon.name} × ${quantity}` : null;
    })
    .filter((item): item is string => item !== null);
  const depositAmount = Math.ceil(reservation.totalAmount / 2);
  const paymentProofMessage = encodeURIComponent(
    [
      `Halo Admin D'Lingga Coffee, saya sudah membayar DP 50% untuk reservasi.`,
      "",
      `Booking ID: ${reservation.bookingId}`,
      `Nama: ${reservation.customerName}`,
      `No. WhatsApp: ${reservation.customerPhone}`,
      `Tanggal: ${formatIndoDate(reservation.date)}`,
      `Waktu: ${reservation.timeSlot}`,
      `Jumlah tamu: ${reservation.pax} orang`,
      `Meja: ${selectedTable?.name ?? reservation.tableId}`,
      "Pilihan menu:",
      ...orderedPackages,
      "Menu tambahan:",
      ...(orderedAddons.length > 0 ? orderedAddons : ["- Tidak ada"]),
      `Catatan: ${reservation.notes?.trim() || "-"}`,
      `Total reservasi: ${formatPrice(reservation.totalAmount)}`,
      `Nominal DP 50%: ${formatPrice(depositAmount)}`,
      "",
      "Saya lampirkan bukti pembayaran pada chat ini. Mohon konfirmasi setelah pembayaran diterima.",
    ].join("\n"),
  );

  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8 md:py-14 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero Banner Sukses (Screen only) */}
        <section className="text-center max-w-2xl mx-auto mb-10 print:hidden">
          {/* Animated / Stylized Warm Icon Anchor */}
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-[#faebe2] flex items-center justify-center shadow-inner">
              <div className="w-14 h-14 rounded-full bg-[#D98A45]/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#D98A45] flex items-center justify-center text-white shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
              </div>
            </div>
            {/* Ambient Ramadan Moon Glow Star Accents */}
            <span className="material-symbols-outlined absolute -top-1 -right-2 text-[#D98A45] text-lg animate-pulse">
              star
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
              isDpPaid
                ? "bg-[#EEF5EB] text-[#52724D]"
                : isCancelled
                  ? "bg-[#FBEEEE] text-[#A8544E]"
                  : "bg-[#faebe2] text-[#D98A45]"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isDpPaid
                ? "check_circle"
                : "hourglass_top"}
            </span>
            <span>
              {isDpPaid
                ? "DP Sudah Dibayar"
                : isAwaitingDp
                  ? "Menunggu Pembayaran DP"
                  : isCancelled
                  ? "Reservasi Dibatalkan"
                  : "Menunggu Verifikasi Admin"}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1a0f0b] tracking-tight mb-2">
            Reservasi Berhasil Diajukan!
          </h1>
          <p className="text-sm sm:text-base text-[#635e53]">
            Terima kasih{" "}
            <strong className="text-[#1a0f0b]">
              Kak {reservation.customerName}
            </strong>
            ,
            {isDpPaid
              ? "pembayaran DP reservasi buka puasa bersamamu telah dikonfirmasi oleh admin."
              : isAwaitingDp
                ? "reservasi buka puasa bersamamu telah disetujui. Setelah QRIS merchant yang valid tersedia, silakan bayar DP 50% dan kirim bukti pembayarannya melalui WhatsApp."
                : isCancelled
                ? "reservasi buka puasa bersamamu telah dibatalkan."
                : "pengajuan reservasi buka puasa bersamamu telah kami terima. Setelah QRIS merchant yang valid tersedia, silakan bayar DP 50% dan kirim bukti pembayarannya melalui WhatsApp."}
          </p>
        </section>

        {/* Kartu E-Tiket Reservasi Bukber (Physical Boarding Pass Aesthetic) */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative bg-white border border-[#E7DFD4] rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-2">
            {/* Top Golden Ramadan Ambient Header Band */}
            <div className="bg-[#30231f] text-white px-6 py-4 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#D98A45] text-xl">
                  mosque
                </span>
                <span className="font-display text-base sm:text-lg font-bold tracking-wide">
                  E-Tiket Iftar Ramadan 1446 H
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[#ffb77d] text-xs">BOOKING ID:</span>
                <span className="font-bold tracking-wider text-white">
                  #{reservation.bookingId}
                </span>
              </div>
            </div>

            {/* Status Notification Strip */}
            <div
              className={`border-b px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                isDpPaid
                  ? "bg-[#F2F8EF] border-[#DCEAD6]"
                  : isCancelled
                    ? "bg-[#FBF0EF] border-[#F0D8D6]"
                    : "bg-[#FFF8EE] border-[#F5E5C9]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isDpPaid
                      ? "bg-[#71916B]"
                      : isCancelled
                        ? "bg-[#C56A64]"
                        : "bg-[#D98A45] animate-ping"
                  }`}
                />
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isDpPaid
                      ? "bg-[#71916B]/15 text-[#52724D]"
                      : isCancelled
                        ? "bg-[#C56A64]/15 text-[#A8544E]"
                        : "bg-[#D98A45]/20 text-[#9C5A14]"
                  }`}
                >
                  {isDpPaid
                    ? "DP Sudah Dibayar"
                    : isAwaitingDp
                      ? "Menunggu Pembayaran DP"
                      : isCancelled
                      ? "Booking Dibatalkan"
                      : "Menunggu Approval"}
                </span>
              </div>
              <p className="text-xs text-[#635e53] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#D98A45] text-base">
                  info
                </span>
                {isDpPaid
                  ? "Pembayaran DP Anda telah diverifikasi admin"
                  : isAwaitingDp
                    ? "Booking disetujui. Setelah QRIS merchant valid tersedia, bayar DP 50% dan kirim bukti melalui WhatsApp"
                    : isCancelled
                    ? "Hubungi admin jika Anda memerlukan informasi lebih lanjut"
                    : "Setelah QRIS merchant valid tersedia, bayar DP 50% dan kirim bukti pembayaran melalui WhatsApp"}
              </p>
            </div>

            {/* Upper Ticket Body: Reservation Core Details */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Info Block: Time & Seating */}
                <div className="space-y-4">
                  {/* Hari & Waktu */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F5F0] flex items-center justify-center text-[#D98A45] shrink-0 border border-[#E7DFD4]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#635e53] uppercase tracking-wider block font-semibold">
                        Hari & Waktu Iftar
                      </span>
                      <p className="font-display text-base font-bold text-[#1a0f0b]">
                        {formatIndoDate(reservation.date)}
                      </p>
                      <p className="text-xs text-[#635e53] font-medium mt-0.5">
                        {reservation.timeSlot}{" "}
                        <span className="text-[#D98A45] text-[10px] bg-[#faebe2] px-2 py-0.5 rounded-full border border-[#E7DFD4] ml-1">
                          Slot Iftar Maghrib
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Alokasi Meja */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F5F0] flex items-center justify-center text-[#D98A45] shrink-0 border border-[#E7DFD4]">
                      <span className="material-symbols-outlined text-xl">
                        table_restaurant
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#635e53] uppercase tracking-wider block font-semibold">
                        Alokasi Meja
                      </span>
                      <p className="font-display text-base font-bold text-[#1a0f0b]">
                        {selectedTable
                          ? selectedTable.name
                          : `Meja ${reservation.tableId}`}
                      </p>
                      <p className="text-xs text-[#635e53]">
                        {selectedTable?.zoneName || "Area Semi-Outdoor Garden"}{" "}
                        <span className="inline-block font-semibold text-[#1a0f0b]">
                          (Kapasitas {reservation.pax} Pax)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Data Pemesan */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F5F0] flex items-center justify-center text-[#D98A45] shrink-0 border border-[#E7DFD4]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#635e53] uppercase tracking-wider block font-semibold">
                        Data Pemesan
                      </span>
                      <p className="text-sm font-bold text-[#1a0f0b]">
                        {reservation.customerName}
                      </p>
                      <p className="text-xs text-[#635e53] font-mono">
                        {reservation.customerPhone}
                      </p>
                      {reservation.notes && (
                        <p className="text-[11px] text-[#635e53] italic mt-1 bg-[#F8F5F0] p-1.5 rounded border border-[#E7DFD4]">
                          "{reservation.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Info Block: Order Breakdown & Total */}
                <div className="bg-[#F8F5F0] rounded-xl p-5 border border-[#E7DFD4] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#635e53] uppercase tracking-wider block mb-2 font-bold">
                      Rincian Paket & Pesanan
                    </span>
                    <div className="space-y-2 mb-4 text-xs">
                      {selectedPackageItems.map(({ item, packageId, quantity }) => {
                        const unitPrice = item?.price ?? 0;
                        return (
                          <div
                            key={packageId}
                            className="flex justify-between items-start"
                          >
                            <div>
                              <p className="font-semibold text-[#1a0f0b]">
                                {item?.name ?? packageId} ({quantity} paket)
                              </p>
                              {item && (
                                <p className="text-[10px] text-[#635e53]">
                                  Rp{unitPrice.toLocaleString("id-ID")} per orang
                                </p>
                              )}
                            </div>
                            <span className="font-medium text-[#1a0f0b]">
                              Rp{(unitPrice * quantity).toLocaleString("id-ID")}
                            </span>
                          </div>
                        );
                      })}

                      {/* Addon items */}
                      {Object.entries(reservation.addons).map(
                        ([addonId, qty]) => {
                          const addon = addons.find((a) => a.id === addonId);
                          if (!addon || qty <= 0) return null;
                          return (
                            <div
                              key={addonId}
                              className="flex justify-between items-center border-t border-[#E7DFD4] pt-2"
                            >
                              <p className="text-[#635e53]">
                                {qty}x {addon.name}
                              </p>
                              <span className="font-medium text-[#1a0f0b]">
                                Rp{(addon.price * qty).toLocaleString("id-ID")}
                              </span>
                            </div>
                          );
                        },
                      )}

                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-dashed border-[#E7DFD4] pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#635e53] font-semibold">
                        Total Estimasi
                      </span>
                      <span className="font-display text-xl sm:text-2xl font-bold text-[#D98A45]">
                        Rp{reservation.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#635e53] mt-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#71916B]" />
                      DP 50%: Rp{depositAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!isDpPaid && !isCancelled && (
              <section className="mx-6 mb-6 rounded-2xl border border-[#E7DFD4] bg-white p-5 sm:mx-8 sm:p-6 print:hidden" aria-labelledby="deposit-payment-title">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a5929]">
                    Pembayaran reservasi
                  </p>
                  <h2 id="deposit-payment-title" className="mt-1 font-display text-xl font-extrabold text-[#1a0f0b]">
                    DP 50% · Rp{depositAmount.toLocaleString("id-ID")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#635e53]">
                    Setelah membayar DP 50% menggunakan QRIS merchant yang
                    valid, kirim bukti pembayaran melalui WhatsApp dengan
                    mencantumkan Booking ID{" "}
                    <strong className="text-[#1a0f0b]">#{reservation.bookingId}</strong>.
                  </p>
                </div>
                <img
                  src={qrisImage}
                  alt="Gambar QRIS pembayaran reservasi"
                  className="mx-auto mt-5 max-h-72 w-full max-w-md rounded-xl border border-[#E7DFD4] object-contain"
                />
                <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-[#F0D8D6] bg-[#FBEEEE] p-3 text-left text-xs leading-5 text-[#8f3f3b]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    QRIS yang tersedia saat ini masih berupa ilustrasi, bukan
                    QR pembayaran merchant. Jangan pindai atau transfer
                    menggunakan gambar ini. Pengelola harus mengganti{" "}
                    <code>src/img/qris.jpg</code> dengan QRIS merchant yang
                    valid sebelum pembayaran dibuka.
                  </span>
                </div>
                <a
                  href={`https://wa.me/6282129211422?text=${paymentProofMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#20ba5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Kirim bukti pembayaran via WhatsApp
                </a>
                <p className="mt-2 text-center text-[11px] leading-4 text-[#635e53]">
                  WhatsApp akan terbuka dengan detail reservasi. Lampirkan
                  foto atau tangkapan layar bukti pembayaran di chat sebelum
                  menekan Kirim.
                </p>
              </section>
            )}

            {/* Physical Ticket Perforation Line with Side Notches */}
            <div className="relative my-0 flex items-center justify-between">
              {/* Left Ticket Notch Punch */}
              <div className="w-6 h-6 rounded-full bg-[#F8F5F0] -ml-3 border-r border-[#E7DFD4] shadow-inner" />
              {/* Perforated Dashed Line */}
              <div className="w-full border-b-2 border-dashed border-[#E7DFD4] mx-2" />
              {/* Right Ticket Notch Punch */}
              <div className="w-6 h-6 rounded-full bg-[#F8F5F0] -mr-3 border-l border-[#E7DFD4] shadow-inner" />
            </div>

            {/* Arrival reminder */}
            <div className="p-6 md:p-8 bg-[#fff8f5]">
              <div className="mb-5 rounded-xl border border-[#D98A45]/30 bg-[#FFF2E0] px-4 py-3 text-center text-sm font-semibold text-[#8C4F13]">
                Mohon datang sebelum waktu Maghrib.
              </div>
            </div>
          </div>
        </div>

        {/* Call to Actions Cluster (Print hidden) */}
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16 print:hidden">
          {isReservationEditable(reservation) && (
            <button
              type="button"
              onClick={() => setIsEditOrderOpen(true)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#9a5929] hover:bg-[#78451f] text-white font-bold text-sm shadow-md transition-all active:scale-98"
            >
              <Pencil className="h-4 w-4" />
              <span>Ubah Pesanan</span>
            </button>
          )}
          {/* Secondary Action: Back to Home */}
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#E7DFD4] bg-white hover:bg-[#F8F5F0] text-[#1a0f0b] font-bold text-sm transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {isEditOrderOpen && (
          <EditReservationOrderModal
            reservation={reservation}
            packages={packages}
            addons={addons}
            onClose={() => setIsEditOrderOpen(false)}
            onSave={onUpdateReservation}
          />
        )}

        {/* Section FAQ Singkat Bukber Lounge */}
        <section className="max-w-3xl mx-auto border-t border-[#E7DFD4] pt-10 print:hidden">
          <div className="text-center mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1a0f0b]">
              Pertanyaan Seputar Reservasi Bukber
            </h2>
            <p className="text-xs sm:text-sm text-[#635e53] mt-1">
              Informasi penting untuk kenyamanan momen berbuka puasa Anda dan
              keluarga.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-[#E7DFD4] rounded-xl p-5 hover:border-[#D98A45] transition-colors shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#faebe2] text-[#D98A45] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-sm font-bold">
                      {faq.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-[#1a0f0b] mb-1">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#635e53] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
