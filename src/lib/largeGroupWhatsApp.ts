const WHATSAPP_ADMIN_NUMBER = "6282129211422";

interface LargeGroupRequest {
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  pax: number;
  tableLabel: string;
  menuLines: string[];
  contactReason: string;
  notes?: string;
}

export const getLargeGroupWhatsAppUrl = ({
  customerName,
  customerPhone,
  date,
  timeSlot,
  pax,
  tableLabel,
  menuLines,
  contactReason,
  notes,
}: LargeGroupRequest) => {
  const message = [
    "Halo Admin D'Lingga Coffee, saya ingin mengajukan reservasi.",
    "",
    `Nama pemesan: ${customerName}`,
    `Nomor WhatsApp: ${customerPhone}`,
    `Tanggal: ${date}`,
    `Waktu: ${timeSlot}`,
    `Jumlah tamu: ${pax} orang`,
    `Preferensi meja: ${tableLabel} (mohon konfirmasi ketersediaan)`,
    `Alasan menghubungi admin: ${contactReason}`,
    "Pilihan menu:",
    ...menuLines,
    ...(notes?.trim() ? [`Catatan: ${notes.trim()}`] : []),
    "",
    "Mohon konfirmasi ketersediaan meja dan reservasi. Terima kasih.",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_ADMIN_NUMBER}?text=${encodeURIComponent(message)}`;
};
