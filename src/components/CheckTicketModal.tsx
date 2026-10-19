import React, { useState } from 'react';
import { ReservationData } from '../types/reservation';
import { X, Search, Ticket, AlertCircle } from 'lucide-react';
import { lookupReservation } from '../data/reservations';

interface CheckTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicket: (ticket: ReservationData) => void;
}

export const CheckTicketModal: React.FC<CheckTicketModalProps> = ({
  isOpen,
  onClose,
  onSelectTicket,
}) => {
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    if (!bookingId.trim() || !phone.trim()) {
      setSearchError('Masukkan Booking ID dan nomor WhatsApp yang digunakan saat memesan.');
      return;
    }

    setIsSearching(true);
    try {
      const found = await lookupReservation(bookingId.trim().replace(/^#/, ''), phone.trim());
      if (!found) {
        setSearchError('Tiket tidak ditemukan. Pastikan Booking ID dan nomor WhatsApp sesuai.');
        return;
      }
      onSelectTicket(found);
      onClose();
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Gagal mencari tiket. Coba lagi.');
    } finally {
      setIsSearching(false);
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
            Untuk melindungi detail reservasi, masukkan Booking ID dan nomor WhatsApp yang digunakan saat pemesanan.
          </p>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Booking ID"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] outline-none"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#635e53] absolute left-3.5 top-3.5" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nomor WhatsApp (contoh: 0812...)"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7DFD4] focus:border-[#D98A45] focus:ring-1 focus:ring-[#D98A45] text-sm text-[#1a0f0b] outline-none"
            />

            {searchError && (
              <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-2.5 rounded-xl bg-[#D98A45] hover:bg-[#C27734] disabled:opacity-60 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              {isSearching ? 'Mencari...' : 'Cari E-Tiket Saya'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
