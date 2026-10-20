import React, { useEffect, useState } from "react";
import { Calendar, Ticket } from "lucide-react";
import dlinggaLogo from "../img/dlingga.jpg";

const NAV_SECTIONS = [
  { id: "paket", label: "Paket Bukber" },
  { id: "fasilitas", label: "Fasilitas Ibadah" },
  { id: "denah", label: "Denah Meja" },
  { id: "lokasi", label: "Lokasi & Jam" },
] as const;

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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (currentView !== "landing") {
      setActiveSection(null);
      return;
    }

    const updateActiveSection = () => {
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 64;
      const currentSection = NAV_SECTIONS.filter(({ id }) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= headerHeight + 1;
      }).at(-1);

      setActiveSection(currentSection?.id ?? null);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [currentView]);

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
          {NAV_SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => {
                if (currentView !== "landing") onNavigateHome();
                setTimeout(() => {
                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              aria-current={activeSection === id ? "location" : undefined}
              className={`transition-colors cursor-pointer ${
                activeSection === id
                  ? "text-[#D98A45] font-semibold"
                  : "text-[#635e53] hover:text-[#D98A45]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
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
