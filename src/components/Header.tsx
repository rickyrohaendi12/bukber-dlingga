import React, { useState } from "react";
import { Calendar, Ticket, Bell, X, CheckCircle } from "lucide-react";
import dlinggaLogo from "../img/dlingga.jpg";

interface HeaderProps {
  currentView: "landing" | "wizard" | "ticket";
  onNavigateHome: () => void;
  onStartBooking: (
    selectedPackageId?: string,
    selectedTableId?: string,
  ) => void;
  onOpenCheckTicket: () => void;
  activeBookingId?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onStartBooking,
  onOpenCheckTicket,
  activeBookingId,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: "1",
      title: "Slot Iftar Maghrib Menipis",
      desc: "Sisa 4 meja untuk area indoor ber-AC hari ini. Amankan sebelum 16.00 WIB.",
      time: "10 menit lalu",
      unread: true,
    },
    {
      id: "2",
      title: "Menu Spesial Iga Bakar Madu",
      desc: "Paket Premium Sultan kini dilengkapi welcome mocktail kurma mint.",
      time: "1 jam lalu",
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#E7DFD4] shadow-xs">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 max-w-7xl mx-auto h-16">
        {/* Brand Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 group cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-xs transition-transform group-hover:scale-105">
            <img
              src={dlinggaLogo}
              alt="Logo Dlingga"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-[#1a0f0b] tracking-tight">
                D'Lingga Coffee
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded bg-[#faebe2] text-[#D98A45] border border-[#E7DFD4]">
                IFTAR 1446H
              </span>
            </div>
            <p className="text-[10px] text-[#635e53] -mt-0.5 hidden sm:block">
              Cafe & Dining Lounge
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => {
              if (currentView !== "landing") onNavigateHome();
              setTimeout(() => {
                document
                  .getElementById("paket")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
            className="text-[#635e53] hover:text-[#D98A45] transition-colors cursor-pointer"
          >
            Paket Bukber
          </button>
          <button
            onClick={() => {
              if (currentView !== "landing") onNavigateHome();
              setTimeout(() => {
                document
                  .getElementById("denah")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
            className="text-[#635e53] hover:text-[#D98A45] transition-colors cursor-pointer"
          >
            Denah Meja
          </button>
          <button
            onClick={() => {
              if (currentView !== "landing") onNavigateHome();
              setTimeout(() => {
                document
                  .getElementById("fasilitas")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
            className="text-[#635e53] hover:text-[#D98A45] transition-colors cursor-pointer"
          >
            Fasilitas Ibadah
          </button>
          <button
            onClick={() => {
              if (currentView !== "landing") onNavigateHome();
              setTimeout(() => {
                document
                  .getElementById("lokasi")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
            className="text-[#635e53] hover:text-[#D98A45] transition-colors cursor-pointer"
          >
            Lokasi & Jam
          </button>
        </nav>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-[#635e53] hover:text-[#D98A45] hover:bg-[#faebe2]/60 rounded-lg transition-colors cursor-pointer relative"
              title="Notifikasi Ketersediaan"
              aria-label="Notifikasi Ketersediaan"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D98A45] rounded-full animate-pulse" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E7DFD4] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD4] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1a0f0b]">
                    Update Kursi Iftar
                  </span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[#635e53] hover:text-[#1a0f0b] p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-[#F8F5F0] hover:bg-[#faebe2]/50 transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#1a0f0b]">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-[#635e53] font-normal">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[#635e53] mt-1">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cek Tiket */}
          <button
            onClick={onOpenCheckTicket}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F8F5F0] text-[#635e53] hover:text-[#D98A45] text-xs sm:text-sm font-semibold transition-colors border border-[#E7DFD4] hover:border-[#D98A45] cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-[#D98A45]" />
            <span className="hidden sm:inline">Cek Tiket</span>
            <span className="sm:hidden">Tiket</span>
            {activeBookingId && (
              <span
                className="w-2 h-2 rounded-full bg-[#71916B]"
                title="Tiket Aktif Tersedia"
              />
            )}
          </button>

          {/* Reservasi Sekarang CTA */}
          <button
            onClick={() => onStartBooking()}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#D98A45] hover:bg-[#C27734] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Reservasi Sekarang</span>
          </button>
        </div>
      </div>
    </header>
  );
};
