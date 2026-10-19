import React, { useState } from 'react';
import { ReservationData } from '../types/reservation';
import { X, Search, Ticket, AlertCircle } from 'lucide-react';

interface CheckTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  allReservations: ReservationData[];
  onSelectTicket: (ticket: ReservationData) => void;
}

export const CheckTicketModal: React.FC<CheckTicketModalProps> = ({
  isOpen,
  onClose,
  allReservations,
  onSelectTicket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    const clean = searchTerm.trim().replace(/^#/, '').toLowerCase();
    if (!clean) {
      setSearchError('Masukkan Booking ID atau nomor WhatsApp Anda.');
      return;
    }

    const found = allReservations.find(
      (r) =>
        r.bookingId.toLowerCase().includes(clean) ||
        r.customerPhone.replace(/\D/g, '').includes(clean.replace(/\D/g, '')) ||
        r.customerName.toLowerCase().includes(clean)
    );

    if (found) {
      onSelectTicket(found);
      onClose();
    } else {
      setSearchError('Tiket tidak ditemukan. Coba periksa kembali Booking ID atau nomor WhatsApp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E7DFD4] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#30231f] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-5 h-5 text-[#D98A45]" />
            <span className="font-display text-base font-bold">Cek E-Tiket Reservasi</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#635e53]">
            Masukkan <strong>Booking ID</strong> (contoh: <code>BKB-2025-0328-88</code>) atau{' '}
            <strong>nomor WhatsApp</strong> yang digunakan saat pemesanan.
          </p>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="BKB-2025-0328-88 atau 0812-xxxx"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] outline-none"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#635e53] absolute left-3.5 top-3.5" />
            </div>

            {searchError && (
              <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#D98A45] hover:bg-[#C27734] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Cari E-Tiket Saya
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
