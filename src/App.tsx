/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TableItem,
  MenuItem,
  AddonItem,
  ReservationData,
} from './types/reservation';
import {
  INITIAL_TABLES,
  MENU_PACKAGES,
  ADDON_ITEMS,
  INITIAL_TICKETS,
} from './data/mockData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackageSection } from './components/PackageSection';
import { FacilitiesBento } from './components/FacilitiesBento';
import { FloorPlan } from './components/FloorPlan';
import { QuickBookingForm } from './components/QuickBookingForm';
import { BookingWizard } from './components/BookingWizard';
import { TicketView } from './components/TicketView';
import { CheckTicketModal } from './components/CheckTicketModal';
import { Footer } from './components/Footer';
import { Calendar, Armchair } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { AdminPage } from './components/AdminPage';
import {
  findTableBookingConflict,
  ensureBookingDataReset,
  isTableCapacitySuitable,
} from './data/reservations';

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin-dlingga-9746') {
    return <AdminPage />;
  }

  return <PublicApp />;
}

function PublicApp() {
  const shouldReduceMotion = useReducedMotion();

  // Navigation / View State
  const [currentView, setCurrentView] = useState<'landing' | 'wizard' | 'ticket'>('landing');

  // Master Data State with localStorage persistence
  const [tables, setTables] = useState<TableItem[]>(() => {
    ensureBookingDataReset();
    const saved = localStorage.getItem('bukber_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [reservations, setReservations] = useState<ReservationData[]>(() => {
    const saved = localStorage.getItem('bukber_reservations');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [activeReservation, setActiveReservation] = useState<ReservationData | null>(() => {
    return reservations[0] ?? null;
  });

  // Preselection for wizard
  const [preselectedPackageId, setPreselectedPackageId] = useState<string>('paket-rame-rame');
  const [preselectedTableId, setPreselectedTableId] = useState<string>('M-01');

  // Check Ticket Modal
  const [isCheckTicketOpen, setIsCheckTicketOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bukber_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('bukber_reservations', JSON.stringify(reservations));
  }, [reservations]);

  // Handlers
  const handleStartBooking = (packageId?: string, tableId?: string) => {
    if (packageId) setPreselectedPackageId(packageId);
    if (tableId) setPreselectedTableId(tableId);
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPackageFromLanding = (packageId: string) => {
    setPreselectedPackageId(packageId);
    handleStartBooking(packageId, preselectedTableId);
  };

  const handleSelectTableFromLanding = (table: TableItem) => {
    setPreselectedTableId(table.id);
    handleStartBooking(preselectedPackageId, table.id);
  };

  const handleQuickSubmit = (
    data: Omit<
      ReservationData,
      'bookingId' | 'createdAt' | 'status' | 'subtotal' | 'taxAmount' | 'totalAmount'
    >
  ) => {
    const chosenTable = tables.find((table) => table.id === data.tableId);
    if (!chosenTable || !isTableCapacitySuitable(data.pax, chosenTable, tables)) {
      window.alert(
        `Pilih meja dengan kapasitas paling kecil yang cukup untuk ${data.pax} orang agar meja yang lebih besar tetap tersedia bagi rombongan lain.`,
      );
      return;
    }

    const currentReservations: ReservationData[] = JSON.parse(
      localStorage.getItem('bukber_reservations') ?? JSON.stringify(reservations),
    );
    const conflict = findTableBookingConflict(currentReservations, data.date, data.tableId);
    if (conflict) {
      window.alert(
        `Meja ${data.tableId} pada tanggal ${data.date} sudah dipesan (${conflict.bookingId}). Silakan pilih meja atau tanggal lain.`,
      );
      return;
    }

    const pkg = MENU_PACKAGES.find((p) => p.id === data.packageId) || MENU_PACKAGES[1];
    const subtotal = pkg.price * data.pax;
    const taxAmount = Math.round(subtotal * 0.1);
    const totalAmount = subtotal + taxAmount;
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const bookingId = `BKB-2025-0328-${randomSuffix}`;

    const newReservation: ReservationData = {
      ...data,
      bookingId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      subtotal,
      taxAmount,
      totalAmount,
    };

    localStorage.setItem(
      'bukber_reservations',
      JSON.stringify([newReservation, ...currentReservations]),
    );

    // Update table status
    setTables((prev) =>
      prev.map((t) => (t.id === data.tableId ? { ...t, status: 'reserved' } : t))
    );

    setReservations([newReservation, ...currentReservations]);
    setActiveReservation(newReservation);
    setCurrentView('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteBookingFromWizard = (newReservation: ReservationData): boolean => {
    const chosenTable = tables.find((table) => table.id === newReservation.tableId);
    if (
      !chosenTable ||
      !isTableCapacitySuitable(newReservation.pax, chosenTable, tables)
    ) {
      window.alert(
        `Pilih meja dengan kapasitas paling kecil yang cukup untuk ${newReservation.pax} orang agar meja yang lebih besar tetap tersedia bagi rombongan lain.`,
      );
      return false;
    }

    const currentReservations: ReservationData[] = JSON.parse(
      localStorage.getItem('bukber_reservations') ?? JSON.stringify(reservations),
    );
    const conflict = findTableBookingConflict(
      currentReservations,
      newReservation.date,
      newReservation.tableId,
    );
    if (conflict) {
      window.alert(
        `Meja ${newReservation.tableId} pada tanggal ${newReservation.date} sudah dipesan (${conflict.bookingId}). Silakan pilih meja atau tanggal lain.`,
      );
      return false;
    }

    const updatedReservations = [newReservation, ...currentReservations];
    localStorage.setItem('bukber_reservations', JSON.stringify(updatedReservations));

    // Update table status
    setTables((prev) =>
      prev.map((t) => (t.id === newReservation.tableId ? { ...t, status: 'reserved' } : t))
    );

    setReservations(updatedReservations);
    setActiveReservation(newReservation);
    setCurrentView('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  };

  const handleSelectTicketFromModal = (ticket: ReservationData) => {
    setActiveReservation(ticket);
    setCurrentView('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navigation */}
      <Header
        currentView={currentView}
        onNavigateHome={() => {
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartBooking={() => handleStartBooking()}
        onOpenCheckTicket={() => setIsCheckTicketOpen(true)}
        activeBookingId={activeReservation?.bookingId}
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <>
            {/* Hero Section */}
            <Hero
              onStartBooking={() => handleStartBooking()}
              onExplorePackages={() => {
                document.getElementById('paket')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Pilihan Paket Bukber */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <PackageSection
                packages={MENU_PACKAGES}
                addons={ADDON_ITEMS}
                onSelectPackage={handleSelectPackageFromLanding}
                onAddMenu={() => handleStartBooking(preselectedPackageId, preselectedTableId)}
              />
            </motion.div>

            {/* Fasilitas Lengkap Bento Grid */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <FacilitiesBento />
            </motion.div>

            {/* Interactive Denah Meja Kafe Section */}
            <motion.section
              className="py-16 md:py-20 bg-white border-b border-[#E7DFD4]"
              id="denah"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                  <div>
                    <span className="px-3.5 py-1 rounded-full bg-[#faebe2] text-[#D98A45] text-xs font-semibold">
                      Eksplorasi Ruangan
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a0f0b] mt-2">
                      Tata Letak & Denah Meja Kafe
                    </h2>
                    <p className="text-xs sm:text-sm text-[#635e53] mt-1">
                      Lihat ketersediaan meja secara live dan klik meja hijau untuk langsung memesan.
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 bg-[#F8F5F0] p-2.5 rounded-xl border border-[#E7DFD4] shrink-0 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-[#635e53]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#71916B]" /> Tersedia
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-[#635e53]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D98A45]" /> Direservasi
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-[#635e53]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C56A64]" /> Penuh
                    </div>
                  </div>
                </div>

                {/* Floor Plan Visual Container */}
                <FloorPlan
                  tables={tables}
                  selectedTableId={preselectedTableId}
                  onSelectTable={handleSelectTableFromLanding}
                  interactive={true}
                />

                {/* Quick Hint */}
                <div className="mt-4 p-3 rounded-xl bg-[#F8F5F0] border border-[#E7DFD4] flex flex-col sm:flex-row items-center justify-between text-xs text-[#635e53] gap-2">
                  <span className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-[#D98A45]" />
                    Tips: Klik langsung pada meja yang bertanda <strong>Tersedia (Hijau)</strong> untuk
                    memulai proses reservasi otomatis.
                  </span>
                  <button
                    onClick={() => handleStartBooking(preselectedPackageId, preselectedTableId)}
                    className="text-[#D98A45] font-bold hover:underline cursor-pointer shrink-0"
                  >
                    Buka Wizard Lengkap →
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Quick Reservation Form & Jam Operasional + Peta Senopati */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <QuickBookingForm
                packages={MENU_PACKAGES}
                availableTables={tables}
                preselectedTableId={preselectedTableId}
                preselectedPackageId={preselectedPackageId}
                onSubmitReservation={handleQuickSubmit}
                onSelectTableDirectly={() => {
                  document.getElementById('denah')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </motion.div>
          </>
        )}

        {currentView === 'wizard' && (
          <BookingWizard
            tables={tables}
            packages={MENU_PACKAGES}
            addons={ADDON_ITEMS}
            initialPackageId={preselectedPackageId}
            initialTableId={preselectedTableId}
            onBack={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCompleteBooking={handleCompleteBookingFromWizard}
          />
        )}

        {currentView === 'ticket' && activeReservation && (
          <TicketView
            reservation={activeReservation}
            packages={MENU_PACKAGES}
            addons={ADDON_ITEMS}
            tables={tables}
            onBackToHome={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Check Ticket Modal */}
      <CheckTicketModal
        isOpen={isCheckTicketOpen}
        onClose={() => setIsCheckTicketOpen(false)}
        allReservations={reservations}
        onSelectTicket={handleSelectTicketFromModal}
      />
    </div>
  );
}
