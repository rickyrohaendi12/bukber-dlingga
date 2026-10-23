/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MenuItem,
  ReservationData,
} from './types/reservation';
import {
  INITIAL_TABLES,
  MENU_PACKAGES,
  ADDON_ITEMS,
} from './data/mockData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackageSection } from './components/PackageSection';
import { RulesSection } from './components/RulesSection';
import { FacilitiesBento } from './components/FacilitiesBento';
import { QuickBookingForm } from './components/QuickBookingForm';
import { LocationSection } from './components/LocationSection';
import { BookingWizard } from './components/BookingWizard';
import { TicketView } from './components/TicketView';
import { CheckTicketModal } from './components/CheckTicketModal';
import { Footer } from './components/Footer';
import { motion, useReducedMotion } from 'motion/react';
import { Armchair, MapPin } from 'lucide-react';
import { AdminPage } from './components/AdminPage';
import floorPlanFloor1Image from './img/denah lt 1.jpeg';
import floorPlanFloor2Image from './img/denah lt 2.png';
import {
  getBookedTableIds,
  createReservation,
  getTomorrowDate,
  isTableCapacitySuitable,
  updateReservationOrder,
} from './data/reservations';

const getErrorMessage = (error: unknown, fallback: string) => {
  let message = fallback;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string' && error.length > 0) {
    message = error;
  } else if (typeof error === 'object' && error !== null) {
    const details = error as {
      message?: unknown;
      code?: unknown;
      details?: unknown;
      hint?: unknown;
      status?: unknown;
      statusText?: unknown;
      name?: unknown;
    };
    const parts = [
      details.message,
      details.code,
      details.details,
      details.hint,
      details.status,
      details.statusText,
    ].filter((part): part is string => typeof part === 'string' && part.length > 0);

    message = parts.length > 0
      ? parts.join('\n')
      : typeof details.name === 'string'
        ? `${details.name}: ${fallback}`
        : fallback;
  }

  if (message.includes('BOOKING_DATE_MUST_BE_AT_LEAST_ONE_DAY_AHEAD')) {
    return 'Reservasi harus dilakukan minimal satu hari sebelum tanggal kedatangan.';
  }
  if (message.includes('DUPLICATE_CUSTOMER_BOOKING_DATE')) {
    return 'Nomor WhatsApp ini sudah memiliki reservasi aktif pada tanggal tersebut. Gunakan tiket yang sudah ada atau pilih tanggal lain.';
  }
  return message;
};

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

  const [bookingDate, setBookingDate] = useState(getTomorrowDate);
  const [bookedTableIds, setBookedTableIds] = useState<string[]>([]);
  const [activeReservation, setActiveReservation] = useState<ReservationData | null>(null);
  const [backendError, setBackendError] = useState('');
  const tables = useMemo(
    () =>
      INITIAL_TABLES.map((table) => ({
        ...table,
        status: bookedTableIds.includes(table.id)
          ? 'reserved' as const
          : 'available' as const,
      })),
    [bookedTableIds],
  );

  // Preselection for wizard
  const [preselectedPackageId, setPreselectedPackageId] = useState<string>('paket-rame-rame');
  const [selectedFloor, setSelectedFloor] = useState<1 | 2>(1);

  // Check Ticket Modal
  const [isCheckTicketOpen, setIsCheckTicketOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    let isLoading = false;

    const refreshBookedTables = async () => {
      if (isLoading) return;
      isLoading = true;
      try {
        const tableIds = await getBookedTableIds(bookingDate);
        if (isCurrent) {
          setBookedTableIds(tableIds);
          setBackendError('');
        }
      } catch (error: unknown) {
        if (isCurrent) {
          setBackendError(error instanceof Error ? error.message : 'Gagal memuat data reservasi.');
        }
      } finally {
        isLoading = false;
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshBookedTables();
      }
    };

    void refreshBookedTables();
    const refreshInterval = window.setInterval(() => {
      void refreshBookedTables();
    }, 15_000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      isCurrent = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [bookingDate]);

  // Handlers
  const handleStartBooking = (packageId?: string) => {
    if (packageId) setPreselectedPackageId(packageId);
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPackageFromLanding = (packageId: string) => {
    setPreselectedPackageId(packageId);
    handleStartBooking(packageId);
  };

  const handleQuickSubmit = async (
    data: Omit<
      ReservationData,
      'bookingId' | 'createdAt' | 'status' | 'subtotal' | 'taxAmount' | 'totalAmount'
      | 'packageSelections'
    >
  ) => {
    const chosenTable = tables.find((table) => table.id === data.tableId);
    if (!chosenTable || !isTableCapacitySuitable(data.pax, chosenTable, tables)) {
      window.alert(
        `Pilih meja dengan kapasitas paling kecil yang cukup untuk ${data.pax} orang agar meja yang lebih besar tetap tersedia bagi rombongan lain.`,
      );
      return;
    }

    try {
      const newReservation = await createReservation({
        ...data,
        packageSelections: { [data.packageId]: data.pax },
      });
      setBookedTableIds((current) => [...new Set([...current, newReservation.tableId])]);
      setActiveReservation(newReservation);
      setBackendError('');
      setCurrentView('ticket');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to create reservation from quick booking:', error);
      const message = getErrorMessage(error, 'Gagal membuat reservasi.');
      window.alert(message.includes('TABLE_ALREADY_BOOKED')
        ? `Meja ${data.tableId} pada tanggal ${data.date} sudah dipesan. Silakan pilih meja atau tanggal lain.`
        : message);
    }
  };

  const handleCompleteBookingFromWizard = async (
    newReservation: ReservationData,
  ): Promise<ReservationData | null> => {
    const chosenTable = tables.find((table) => table.id === newReservation.tableId);
    if (
      !chosenTable ||
      !isTableCapacitySuitable(newReservation.pax, chosenTable, tables)
    ) {
      window.alert(
        `Pilih meja dengan kapasitas paling kecil yang cukup untuk ${newReservation.pax} orang agar meja yang lebih besar tetap tersedia bagi rombongan lain.`,
      );
      return null;
    }

    try {
      const savedReservation = await createReservation(newReservation);
      setBookedTableIds((current) => [...new Set([...current, savedReservation.tableId])]);
      setActiveReservation(savedReservation);
      setBackendError('');
      setCurrentView('ticket');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return savedReservation;
    } catch (error) {
      console.error('Failed to create reservation from booking wizard:', error);
      const message = getErrorMessage(error, 'Gagal membuat reservasi.');
      window.alert(message.includes('TABLE_ALREADY_BOOKED')
        ? `Meja ${newReservation.tableId} pada tanggal ${newReservation.date} sudah dipesan. Silakan pilih meja atau tanggal lain.`
        : message);
      return null;
    }
  };

  const handleSelectTicketFromModal = (ticket: ReservationData) => {
    setActiveReservation(ticket);
    setCurrentView('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateReservationOrder = async (
    pax: number,
    packageSelections: Record<string, number>,
    addons: Record<string, number>,
  ) => {
    if (!activeReservation) {
      throw new Error('Tiket reservasi tidak ditemukan.');
    }

    try {
      const updatedReservation = await updateReservationOrder(
        activeReservation.bookingId,
        activeReservation.customerPhone,
        pax,
        packageSelections,
        addons,
      );
      setActiveReservation(updatedReservation);
      setBookingDate(updatedReservation.date);
      setBackendError('');
      return updatedReservation;
    } catch (error) {
      console.error('Failed to update reservation order:', error);
      throw new Error(getErrorMessage(error, 'Gagal menyimpan perubahan pesanan.'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {backendError && (
        <div role="alert" className="bg-[#FBEEEE] px-4 py-3 text-center text-sm text-[#A8544E]">
          Backend reservasi belum siap: {backendError}
        </div>
      )}
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

            <RulesSection />

            {/* Pilihan Paket Bukber */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <PackageSection
                packages={MENU_PACKAGES}
                onSelectPackage={handleSelectPackageFromLanding}
              />
            </motion.div>

            {/* Reservasi, Lokasi & Jam Operasional */}
            <section className="border-b border-[#E7DFD4] bg-[#F8F5F0] py-16 md:py-20">
              <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-12">
                <motion.div
                  className="lg:col-span-7"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <QuickBookingForm
                    packages={MENU_PACKAGES}
                    availableTables={tables}
                    onDateChange={setBookingDate}
                    onSubmitReservation={handleQuickSubmit}
                    onSelectTableDirectly={() => {
                      document.getElementById('denah')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </motion.div>
                <motion.div
                  className="lg:col-span-5"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <LocationSection />
                </motion.div>
              </div>
            </section>

            {/* Fasilitas Lengkap Bento Grid */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <FacilitiesBento />
            </motion.div>

            {/* Denah Meja Kafe */}
            <motion.section
              className="border-b border-[#E7DFD4] bg-[#F8F5F0] py-16 md:py-20"
              id="denah"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#faebe2] px-3.5 py-1.5 text-xs font-semibold text-[#9a5929]">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    Panduan Area Kafe
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold text-[#1a0f0b] sm:text-3xl md:text-4xl">
                    Denah Meja D'Lingga
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#635e53] sm:text-base">
                    Kenali tata letak dan kapasitas meja sebelum memesan. Pilih
                    meja yang tersedia melalui dropdown di formulir reservasi.
                  </p>
                </div>

                <div className="mx-auto max-w-xl rounded-3xl border border-[#E7DFD4] bg-white p-3 shadow-lg shadow-[#30231f]/[0.06] sm:p-5">
                  <div
                    className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-[#F8F5F0] p-1.5"
                    aria-label="Pilih lantai denah"
                  >
                    {([1, 2] as const).map((floor) => (
                      <button
                        key={floor}
                        type="button"
                        aria-pressed={selectedFloor === floor}
                        onClick={() => setSelectedFloor(floor)}
                        className={`min-h-11 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a5929] ${
                          selectedFloor === floor
                            ? 'bg-[#30231f] text-white shadow-sm'
                            : 'text-[#635e53] hover:bg-white hover:text-[#1a0f0b]'
                        }`}
                      >
                        Lantai {floor}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#E7DFD4] bg-[#F8F5F0] p-2 sm:p-3">
                    <img
                      src={selectedFloor === 1 ? floorPlanFloor1Image : floorPlanFloor2Image}
                      alt={`Denah tata letak meja D'Lingga Coffee lantai ${selectedFloor} beserta kapasitas setiap meja`}
                      className="mx-auto h-auto max-h-[70vh] w-full max-w-[420px] object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-[#F8F5F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-center">
                    <span className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#30231f]">
                      <Armchair className="h-4 w-4 text-[#9a5929]" aria-hidden="true" />
                      Sudah menemukan tempat yang cocok?
                    </span>
                    <span className="text-center text-sm text-[#635e53]">
                      Pilih meja tersedia di formulir reservasi.
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>

          </>
        )}

        {currentView === 'wizard' && (
          <BookingWizard
            tables={tables}
            packages={MENU_PACKAGES}
            addons={ADDON_ITEMS}
            initialDate={bookingDate}
            onDateChange={setBookingDate}
            initialPackageId={preselectedPackageId}
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
            onUpdateReservation={handleUpdateReservationOrder}
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
        onSelectTicket={handleSelectTicketFromModal}
      />
    </div>
  );
}
