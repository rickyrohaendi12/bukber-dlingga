import React, { useEffect, useMemo, useState } from "react";
import {
  Armchair,
  BadgeCheck,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ClipboardList,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Users,
  Utensils,
} from "lucide-react";
import {
  ADDON_ITEMS,
  MENU_PACKAGES,
  INITIAL_TABLES,
} from "../data/mockData";
import { ReservationData } from "../types/reservation";
import type { Session } from "@supabase/supabase-js";
import dlinggaLogo from "../img/dlingga.jpg";
import qrisImage from "../img/qris.jpg";
import { isSupabaseConfigured, requireSupabase } from "../lib/supabase";
import {
  getReservations,
  isTableCapacitySuitable,
  updateReservationStatus,
} from "../data/reservations";

type BookingFilter = "all" | ReservationData["status"];

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusLabels: Record<ReservationData["status"], string> = {
  pending: "Menunggu approval",
  awaiting_dp: "Menunggu pembayaran DP",
  dp_paid: "DP sudah dibayar",
  cancelled: "Dibatalkan",
};

const getWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  const internationalNumber = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("8")
      ? `62${digits}`
      : digits;
  return /^\d{8,15}$/.test(internationalNumber) ? internationalNumber : null;
};

const getDpPaymentMessageUrl = (booking: ReservationData) => {
  const phone = getWhatsAppNumber(booking.customerPhone);
  if (!phone) return null;

  const deposit = Math.ceil(booking.totalAmount / 2);
  const message = [
    `Halo ${booking.customerName}, booking buka puasa Anda telah disetujui.`,
    "",
    `Booking ID: ${booking.bookingId}`,
    `Tanggal: ${formatDate(booking.date)}`,
    `Waktu: ${booking.timeSlot}`,
    `Jumlah tamu: ${booking.pax} orang`,
    `Meja: ${booking.tableId}`,
    `Total: ${formatRupiah(booking.totalAmount)}`,
    `DP 50%: ${formatRupiah(deposit)}`,
    "",
    "Silakan lakukan pembayaran DP melalui QRIS terlampir, lalu kirim bukti pembayaran di chat ini. Reservasi akan berstatus DP dibayar setelah pembayaran diverifikasi admin.",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const getDpPaidMessageUrl = (booking: ReservationData) => {
  const phone = getWhatsAppNumber(booking.customerPhone);
  if (!phone) return null;

  const message = [
    `Halo ${booking.customerName}, pembayaran DP 50% untuk reservasi Anda sudah kami konfirmasi.`,
    "",
    `Booking ID: ${booking.bookingId}`,
    `Tanggal: ${formatDate(booking.date)}`,
    `Jumlah DP: ${formatRupiah(Math.ceil(booking.totalAmount / 2))}`,
    `Sisa pembayaran: ${formatRupiah(booking.totalAmount - Math.ceil(booking.totalAmount / 2))}`,
    "",
    "Terima kasih. Sampai jumpa di D'Lingga Coffee!",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [dailyDate, setDailyDate] = useState("");
  const [search, setSearch] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const isAdmin = session?.user.app_metadata.role === "admin";

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthError("Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk mengaktifkan panel admin.");
      setIsCheckingSession(false);
      return;
    }

    let isCurrent = true;
    const client = requireSupabase();
    client.auth.getSession()
      .then(({ data, error }) => {
        if (!isCurrent) return;
        if (error) setAuthError(error.message);
        setSession(data.session);
        setIsCheckingSession(false);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setAuthError(error instanceof Error ? error.message : "Gagal memeriksa sesi admin.");
          setIsCheckingSession(false);
        }
      });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (isCurrent) setSession(nextSession);
    });
    return () => {
      isCurrent = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setReservations([]);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    getReservations()
      .then((items) => {
        if (isCurrent) {
          setReservations(items);
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(error instanceof Error ? error.message : "Gagal memuat reservasi.");
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [isAdmin]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSigningIn(true);
    setAuthError("");
    try {
      const { data, error } = await requireSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (data.user.app_metadata.role !== "admin") {
        await requireSupabase().auth.signOut();
        setAuthError("Akun ini belum memiliki role admin. Hubungi pengelola project Supabase.");
        return;
      }
      setSession(data.session);
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Gagal masuk ke panel admin.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
      setSession(null);
      setReservations([]);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Gagal keluar dari panel admin.");
    }
  };

  const refreshReservations = async () => {
    setIsLoading(true);
    try {
      setReservations(await getReservations());
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat reservasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedReservations = useMemo(
    () =>
      [...reservations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [reservations],
  );

  const dailyReservations = useMemo(
    () =>
      dailyDate
        ? sortedReservations.filter((booking) => booking.date === dailyDate)
        : sortedReservations,
    [dailyDate, sortedReservations],
  );

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return dailyReservations.filter((booking) => {
      const matchesFilter = filter === "all" || booking.status === filter;
      const matchesSearch =
        !query ||
        [booking.bookingId, booking.customerName, booking.customerPhone]
          .join(" ")
          .toLocaleLowerCase("id-ID")
          .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [dailyReservations, filter, search]);

  const selectedBooking =
    filteredReservations.find(
      (booking) => booking.bookingId === selectedBookingId,
    ) ?? filteredReservations[0];

  const counts = useMemo(
    () => ({
      all: dailyReservations.length,
      pending: dailyReservations.filter((booking) => booking.status === "pending")
        .length,
      awaiting_dp: dailyReservations.filter(
        (booking) => booking.status === "awaiting_dp",
      ).length,
      dp_paid: dailyReservations.filter(
        (booking) => booking.status === "dp_paid",
      ).length,
      cancelled: dailyReservations.filter(
        (booking) => booking.status === "cancelled",
      ).length,
    }),
    [dailyReservations],
  );

  const dailyOrderSummary = useMemo(() => {
    const activeBookings = dailyReservations.filter(
      (booking) => booking.status !== "cancelled",
    );
    const items = new Map<
      string,
      { id: string; name: string; quantity: number; unit: string }
    >();

    const addItem = (id: string, name: string, quantity: number, unit: string) => {
      const existing = items.get(id);
      items.set(id, {
        id,
        name,
        quantity: (existing?.quantity ?? 0) + quantity,
        unit,
      });
    };

    activeBookings.forEach((booking) => {
      Object.entries(booking.packageSelections).forEach(
        ([packageId, quantity]) => {
          const menuPackage = MENU_PACKAGES.find(
            (item) => item.id === packageId,
          );
          addItem(
            `package:${packageId}`,
            menuPackage?.name ?? packageId,
            quantity,
            "paket",
          );
        },
      );
      Object.entries(booking.addons).forEach(([addonId, quantity]) => {
        const addon = ADDON_ITEMS.find((item) => item.id === addonId);
        addItem(
          `addon:${addonId}`,
          addon?.name ?? addonId,
          quantity,
          addon?.unit ?? "item",
        );
      });
    });

    return {
      bookingCount: activeBookings.length,
      guestCount: activeBookings.reduce((total, booking) => total + booking.pax, 0),
      items: Array.from(items.values()).sort((a, b) =>
        a.name.localeCompare(b.name, "id-ID"),
      ),
    };
  }, [dailyReservations]);

  const dailyDateLabel = dailyDate ? formatDate(dailyDate) : "Semua tanggal";

  const handleDailyDateChange = (date: string) => {
    setDailyDate(date);
    setSelectedBookingId(null);
  };

  const approveBooking = async (bookingId: string) => {
    const booking = reservations.find(
      (item) => item.bookingId === bookingId,
    );
    if (!booking || booking.status !== "pending") return;

    const table = INITIAL_TABLES.find((item) => item.id === booking.tableId);
    if (
      !table ||
      !isTableCapacitySuitable(booking.pax, table)
    ) {
      window.alert(
        `Booking tidak dapat disetujui: kapasitas meja ${booking.tableId} tidak cukup untuk ${booking.pax} orang.`,
      );
      return;
    }

    let updatedBooking: ReservationData;
    try {
      updatedBooking = await updateReservationStatus(bookingId, "awaiting_dp");
      setReservations((current) =>
        current.map((item) => item.bookingId === bookingId ? updatedBooking : item),
      );
      setLoadError("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyetujui booking.";
      window.alert(message.includes("TABLE_ALREADY_BOOKED")
        ? `Meja ${booking.tableId} pada tanggal ${booking.date} sudah dipesan oleh booking lain.`
        : message);
      return;
    }

  };

  const confirmDpPayment = async (bookingId: string) => {
    const booking = reservations.find((item) => item.bookingId === bookingId);
    if (!booking || booking.status !== "awaiting_dp") return;

    try {
      const updatedBooking = await updateReservationStatus(bookingId, "dp_paid");
      setReservations((current) =>
        current.map((item) =>
          item.bookingId === bookingId ? updatedBooking : item,
        ),
      );
      setLoadError("");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Gagal mengonfirmasi pembayaran DP.",
      );
    }
  };

  const selectedTable = selectedBooking
    ? INITIAL_TABLES.find((table) => table.id === selectedBooking.tableId)
    : undefined;

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5F0] text-sm text-[#635e53]">
        Memeriksa sesi admin...
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F5F0] p-4">
        <div role="alert" className="max-w-lg rounded-2xl border border-[#F0D8D6] bg-white p-6 text-sm text-[#A8544E]">
          {authError}
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F5F0] px-4 py-10">
        <form onSubmit={signIn} className="w-full max-w-md rounded-2xl border border-[#E7DFD4] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#faebe2] text-[#D98A45]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D98A45]">Panel administrasi</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#1a0f0b]">Masuk admin</h1>
          <p className="mt-2 text-sm leading-6 text-[#635e53]">
            Gunakan akun Supabase dengan app_metadata role admin.
          </p>
          {!session && (
            <>
              <label className="mt-6 block text-xs font-semibold text-[#1a0f0b]">
                Email
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#E7DFD4] px-3.5 py-3 text-sm outline-none focus:border-[#D98A45]"
                />
              </label>
              <label className="mt-4 block text-xs font-semibold text-[#1a0f0b]">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#E7DFD4] px-3.5 py-3 text-sm outline-none focus:border-[#D98A45]"
                />
              </label>
              <button
                type="submit"
                disabled={isSigningIn}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#30231f] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {isSigningIn ? "Memeriksa..." : "Masuk"}
              </button>
            </>
          )}
          {authError && (
            <p role="alert" className="mt-4 rounded-xl bg-[#FBEEEE] p-3 text-sm text-[#A8544E]">
              {authError}
            </p>
          )}
          {session && !isAdmin && (
            <button type="button" onClick={signOut} className="mt-5 rounded-xl border border-[#E7DFD4] px-4 py-2.5 text-sm font-semibold text-[#635e53]">
              Keluar dari akun ini
            </button>
          )}
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#211a15]">
      <header className="border-b border-[#E7DFD4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <a
            href="/"
            className="flex items-center gap-3"
            aria-label="Kembali ke halaman utama"
          >
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={dlinggaLogo}
                alt="Logo Dlingga"
                className="h-full w-full object-cover"
              />
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold text-[#1a0f0b]">
                D'Lingga Coffee
              </span>
              <span className="block text-xs font-medium text-[#635e53]">
                Panel administrasi
              </span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-xl border border-[#E7DFD4] px-4 py-2.5 text-sm font-semibold text-[#635e53] transition hover:bg-[#F8F5F0]"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
            <a
              href="/"
              className="rounded-xl border border-[#E7DFD4] px-4 py-2.5 text-sm font-semibold text-[#635e53] transition hover:bg-[#F8F5F0]"
            >
              Kembali ke website
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D98A45]">
            Manajemen reservasi
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1a0f0b] sm:text-4xl">
            Daftar booking
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#635e53]">
            Pilih tanggal untuk melihat seluruh booking dan rekap menu yang
            perlu disiapkan pada hari tersebut.
          </p>
          <button
            type="button"
            onClick={refreshReservations}
            className="mt-4 rounded-xl border border-[#E7DFD4] bg-white px-4 py-2 text-sm font-semibold text-[#635e53] hover:bg-[#F8F5F0]"
          >
            {isLoading ? "Memuat..." : "Muat ulang"}
          </button>
        </div>
        {loadError && (
          <div role="alert" className="mb-6 rounded-xl border border-[#F0D8D6] bg-[#FBEEEE] p-4 text-sm text-[#A8544E]">
            Gagal memuat atau memperbarui data Supabase: {loadError}
          </div>
        )}

        <section className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[#E7DFD4] bg-white p-4 shadow-sm sm:p-5" aria-label="Filter tanggal booking">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-xs font-semibold text-[#635e53]">
            Tampilkan pesanan tanggal
            <span className="flex items-center gap-2 rounded-xl border border-[#E7DFD4] bg-[#fffdfa] px-3.5 py-2.5 focus-within:border-[#D98A45]">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#D98A45]" />
              <input
                type="date"
                value={dailyDate}
                onChange={(event) => handleDailyDateChange(event.target.value)}
                className="w-full bg-transparent text-sm text-[#211a15] outline-none"
              />
            </span>
          </label>
          <button
            type="button"
            onClick={() => handleDailyDateChange("")}
            disabled={!dailyDate}
            className="rounded-xl border border-[#E7DFD4] px-4 py-2.5 text-sm font-semibold text-[#635e53] transition hover:bg-[#F8F5F0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Semua tanggal
          </button>
          <p className="w-full text-xs text-[#8a7d73]">
            {dailyDate
              ? `Menampilkan booking untuk ${dailyDateLabel}.`
              : "Pilih tanggal untuk melihat rekap menu dan semua booking pada hari itu."}
          </p>
        </section>

        <section
          className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
          aria-label="Ringkasan booking"
        >
          {(
            [
              [
                "all",
                "Total booking",
                ClipboardList,
                "text-[#635e53]",
                "bg-[#F8F5F0]",
              ],
              [
                "pending",
                "Menunggu approval",
                Clock3,
                "text-[#B76A23]",
                "bg-[#FFF4E7]",
              ],
              [
                "awaiting_dp",
                "Menunggu DP",
                Banknote,
                "text-[#9A5929]",
                "bg-[#FFF4E7]",
              ],
              [
                "dp_paid",
                "DP sudah dibayar",
                BadgeCheck,
                "text-[#52724D]",
                "bg-[#EEF5EB]",
              ],
              [
                "cancelled",
                "Dibatalkan",
                CalendarDays,
                "text-[#A8544E]",
                "bg-[#FBEEEE]",
              ],
            ] as const
          ).map(([key, label, Icon, color, iconBg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                filter === key
                  ? "border-[#D98A45] ring-2 ring-[#D98A45]/15"
                  : "border-[#E7DFD4]"
              }`}
            >
              <span
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${color}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="block text-2xl font-extrabold text-[#1a0f0b]">
                {counts[key]}
              </span>
              <span className="mt-1 block text-xs font-medium text-[#635e53]">
                {label}
              </span>
            </button>
          ))}
        </section>

        {dailyDate && (
          <section className="mb-7 rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-sm sm:p-6" aria-label="Rekap pesanan harian">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D98A45]">
                  Rekap pesanan harian
                </p>
                <h2 className="mt-1 font-display text-xl font-extrabold text-[#1a0f0b]">
                  {dailyDateLabel}
                </h2>
              </div>
              <p className="rounded-xl bg-[#F8F5F0] px-3 py-2 text-xs font-semibold text-[#635e53]">
                {dailyOrderSummary.bookingCount} booking aktif ·{" "}
                {dailyOrderSummary.guestCount} tamu
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#8a7d73]">
              Jumlah paket dan add-on dari booking menunggu persetujuan atau
              disetujui. Booking yang dibatalkan tidak masuk rekap.
            </p>
            {dailyOrderSummary.items.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {dailyOrderSummary.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#F0EAE4] bg-[#fffdfa] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[#4f4542]">
                      {item.name}
                    </span>
                    <span className="shrink-0 rounded-lg bg-[#FFF4E7] px-2.5 py-1 text-xs font-bold text-[#9a5b25]">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl bg-[#F8F5F0] p-4 text-sm text-[#635e53]">
                Belum ada booking aktif pada tanggal ini.
              </p>
            )}
          </section>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="overflow-hidden rounded-2xl border border-[#E7DFD4] bg-white shadow-sm">
            <div className="border-b border-[#E7DFD4] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1a0f0b]">
                    {dailyDate ? "Booking harian" : "Booking masuk"}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#635e53]">
                    {filteredReservations.length} booking ditampilkan
                  </p>
                </div>
                <span className="rounded-lg bg-[#F8F5F0] px-2.5 py-1.5 text-xs font-semibold text-[#635e53]">
                  {filter === "all" ? "Semua status" : statusLabels[filter]}
                </span>
              </div>
              <label className="flex items-center gap-2.5 rounded-xl border border-[#E7DFD4] bg-[#fffdfa] px-3.5 py-3 focus-within:border-[#D98A45]">
                <Search className="h-4 w-4 shrink-0 text-[#8b8179]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama, nomor, atau booking ID"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#a79c93]"
                />
              </label>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {(["all", "pending", "awaiting_dp", "dp_paid", "cancelled"] as const).map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        filter === value
                          ? "bg-[#30231f] text-white"
                          : "bg-[#F8F5F0] text-[#635e53] hover:bg-[#eee0d7]"
                      }`}
                    >
                      {value === "all" ? "Semua" : statusLabels[value]}
                      <span className="ml-1.5 opacity-70">{counts[value]}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="max-h-[720px] overflow-y-auto">
              {isLoading ? (
                <div className="px-6 py-14 text-center text-sm text-[#635e53]">
                  Memuat booking dari Supabase...
                </div>
              ) : filteredReservations.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <ClipboardList className="mx-auto h-9 w-9 text-[#c4b8ad]" />
                  <p className="mt-3 font-semibold text-[#1a0f0b]">
                    Booking tidak ditemukan
                  </p>
                  <p className="mt-1 text-sm text-[#635e53]">
                    Ubah tanggal, kata kunci, atau filter status.
                  </p>
                </div>
              ) : (
                filteredReservations.map((booking) => (
                  <button
                    key={booking.bookingId}
                    type="button"
                    onClick={() => setSelectedBookingId(booking.bookingId)}
                    className={`block w-full border-b border-[#F0EAE4] p-4 text-left transition last:border-0 sm:p-5 ${
                      selectedBooking?.bookingId === booking.bookingId
                        ? "bg-[#FFF8F2]"
                        : "hover:bg-[#fffdfa]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#1a0f0b]">
                          {booking.customerName}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#8a7d73]">
                          #{booking.bookingId}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-[#635e53]">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-[#D98A45]" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#D98A45]" />
                        {booking.pax} orang
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-[#D98A45]" />
                        {booking.timeSlot}
                      </span>
                      <span className="truncate font-semibold text-[#1a0f0b]">
                        {formatRupiah(booking.totalAmount)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          {selectedBooking ? (
            <section className="overflow-hidden rounded-2xl border border-[#E7DFD4] bg-white shadow-sm">
              <div className="bg-[#30231f] p-5 text-white sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#ffb77d]">
                      Rincian booking
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold">
                      {selectedBooking.customerName}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-white/60">
                      #{selectedBooking.bookingId}
                    </p>
                  </div>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={Phone}
                    label="Nomor WhatsApp"
                    value={selectedBooking.customerPhone}
                  />
                  <InfoItem
                    icon={Users}
                    label="Jumlah tamu"
                    value={`${selectedBooking.pax} orang`}
                  />
                  <InfoItem
                    icon={CalendarDays}
                    label="Tanggal"
                    value={formatDate(selectedBooking.date)}
                  />
                  <InfoItem
                    icon={Clock3}
                    label="Waktu"
                    value={selectedBooking.timeSlot}
                  />
                  <InfoItem
                    icon={Armchair}
                    label="Meja"
                    value={
                      selectedTable?.name ?? `Meja ${selectedBooking.tableId}`
                    }
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Zona"
                    value={selectedTable?.zoneName ?? "Belum tersedia"}
                  />
                </div>

                <div className="border-t border-[#F0EAE4] pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display font-bold text-[#1a0f0b]">
                      <Utensils className="h-4 w-4 text-[#D98A45]" />
                      Menu yang dipesan
                    </h3>
                    <span className="text-xs text-[#635e53]">
                      {selectedBooking.pax} pax
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#E7DFD4] bg-[#fffdfa] p-4">
                    <ul className="space-y-3">
                      {Object.entries(selectedBooking.packageSelections).map(
                        ([packageId, quantity]) => {
                          const item = MENU_PACKAGES.find(
                            (menuPackage) => menuPackage.id === packageId,
                          );
                          return (
                            <li
                              key={packageId}
                              className="flex items-start justify-between gap-3"
                            >
                              <div>
                                <p className="font-semibold text-[#1a0f0b]">
                                  {item?.name ?? "A la Carte"}
                                  <span className="ml-1 text-xs font-normal text-[#635e53]">
                                    × {quantity} paket
                                  </span>
                                </p>
                                {item?.features.length ? (
                                  <ul className="mt-2 space-y-1.5">
                                    {item.features.map((feature) => (
                                      <li
                                        key={feature}
                                        className="flex gap-2 text-xs leading-5 text-[#635e53]"
                                      >
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#71916B]" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-1 text-xs text-[#8a7d73]">
                                    Menu dipilih melalui item A la Carte.
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 text-xs font-semibold text-[#635e53]">
                                {item
                                  ? formatRupiah(item.price * quantity)
                                  : "Sesuai item"}
                              </span>
                            </li>
                          );
                        },
                      )}
                    </ul>

                    {Object.entries(selectedBooking.addons).length > 0 && (
                      <div className="mt-4 border-t border-[#F0EAE4] pt-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8a7d73]">
                          Add-on
                        </p>
                        <ul className="space-y-2">
                          {Object.entries(selectedBooking.addons).map(
                            ([addonId, quantity]) => {
                              const addon = ADDON_ITEMS.find(
                                (item) => item.id === addonId,
                              );
                              return (
                                <li
                                  key={addonId}
                                  className="flex items-start justify-between gap-3 text-xs"
                                >
                                  <span className="text-[#635e53]">
                                    {addon?.name ?? addonId}{" "}
                                    <span className="font-semibold">
                                      × {quantity}
                                    </span>
                                  </span>
                                  <span className="shrink-0 font-semibold text-[#1a0f0b]">
                                    {addon
                                      ? formatRupiah(addon.price * quantity)
                                      : "—"}
                                  </span>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="rounded-xl bg-[#F8F5F0] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8a7d73]">
                      Catatan pelanggan
                    </p>
                    <p className="mt-1.5 text-sm leading-5 text-[#4f4542]">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                <div className="space-y-2 border-t border-[#F0EAE4] pt-4">
                  <div className="flex items-center justify-between border-t border-[#F0EAE4] pt-3">
                    <span className="font-bold text-[#1a0f0b]">
                      Total tagihan
                    </span>
                    <span className="font-display text-lg font-extrabold text-[#1a0f0b]">
                      {formatRupiah(selectedBooking.totalAmount)}
                    </span>
                  </div>
                </div>

                {selectedBooking.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => approveBooking(selectedBooking.bookingId)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#52724D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#415e3c] focus:outline-none focus:ring-4 focus:ring-[#52724D]/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Setujui booking & minta DP 50%
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
                        selectedBooking.status === "dp_paid"
                          ? "bg-[#EEF5EB] text-[#52724D]"
                          : selectedBooking.status === "cancelled"
                            ? "bg-[#FBEEEE] text-[#A8544E]"
                            : "bg-[#FFF4E7] text-[#9A5929]"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {statusLabels[selectedBooking.status]}
                    </div>
                    {selectedBooking.status === "awaiting_dp" && (
                      <>
                        <div className="rounded-xl border border-[#E7DFD4] bg-[#fffdfa] p-4">
                          <p className="mb-3 text-sm font-bold text-[#1a0f0b]">
                            QRIS pembayaran DP 50% ·{" "}
                            {formatRupiah(Math.ceil(selectedBooking.totalAmount / 2))}
                          </p>
                          <img
                            src={qrisImage}
                            alt="QRIS untuk pembayaran uang muka reservasi"
                            className="mx-auto max-h-64 w-auto rounded-lg border border-[#E7DFD4] object-contain"
                          />
                          <a
                            href={qrisImage}
                            download="QRIS-DLingga.jpg"
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E7DFD4] bg-white px-4 py-2.5 text-sm font-semibold text-[#635e53] hover:bg-[#F8F5F0]"
                          >
                            Unduh gambar QRIS untuk dilampirkan
                          </a>
                          <p className="mt-3 rounded-lg bg-[#FFF4E7] p-3 text-xs leading-5 text-[#8b531d]">
                            Pastikan gambar QRIS ini sudah diganti dengan QR
                            merchant yang benar dan dapat dipindai sebelum
                            dikirim. WhatsApp tidak melampirkan gambar secara
                            otomatis; unduh gambar lalu lampirkan di chat.
                          </p>
                        </div>
                        {getDpPaymentMessageUrl(selectedBooking) ? (
                          <a
                            href={getDpPaymentMessageUrl(selectedBooking) ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#20ba5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/20"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Buka WhatsApp untuk instruksi DP
                          </a>
                        ) : (
                          <p className="rounded-xl bg-[#FFF4E7] px-4 py-3 text-xs leading-5 text-[#8b531d]">
                            Nomor WhatsApp pelanggan tidak valid. Periksa nomor
                            booking untuk mengirim instruksi DP.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => confirmDpPayment(selectedBooking.bookingId)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#52724D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#415e3c] focus:outline-none focus:ring-4 focus:ring-[#52724D]/20"
                        >
                          <BadgeCheck className="h-4 w-4" />
                          Konfirmasi DP sudah dibayar
                        </button>
                        <p className="text-center text-[11px] leading-4 text-[#635e53]">
                          Tandai sudah dibayar hanya setelah admin memverifikasi
                          pembayaran masuk.
                        </p>
                      </>
                    )}
                    {selectedBooking.status === "dp_paid" &&
                      (getDpPaidMessageUrl(selectedBooking) ? (
                        <a
                          href={getDpPaidMessageUrl(selectedBooking) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#20ba5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/20"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Kirim konfirmasi pembayaran DP
                        </a>
                      ) : (
                        <p className="rounded-xl bg-[#FFF4E7] px-4 py-3 text-xs leading-5 text-[#8b531d]">
                          Nomor WhatsApp pelanggan tidak valid. Periksa nomor
                          booking untuk mengirim konfirmasi pembayaran.
                        </p>
                      ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-[#D9CFC5] bg-white p-8 text-center">
              <ClipboardList className="h-10 w-10 text-[#c4b8ad]" />
              <h2 className="mt-3 font-display text-lg font-bold text-[#1a0f0b]">
                Pilih booking untuk melihat detail
              </h2>
              <p className="mt-1 max-w-xs text-sm text-[#635e53]">
                Menu, data pelanggan, dan tombol approval akan tampil di sini.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

const StatusBadge: React.FC<{ status: ReservationData["status"] }> = ({
  status,
}) => {
  const styles: Record<ReservationData["status"], string> = {
    pending: "bg-[#FFF1DF] text-[#A85E1C]",
    awaiting_dp: "bg-[#FFF1DF] text-[#9A5929]",
    dp_paid: "bg-[#EAF3E7] text-[#52724D]",
    cancelled: "bg-[#F9E9E8] text-[#A8544E]",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

const InfoItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="min-w-0">
    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8a7d73]">
      <Icon className="h-3.5 w-3.5 text-[#D98A45]" />
      {label}
    </p>
    <p className="break-words text-xs font-semibold leading-5 text-[#1a0f0b] sm:text-sm">
      {value}
    </p>
  </div>
);

const PriceRow: React.FC<{ label: string; amount: number }> = ({
  label,
  amount,
}) => (
  <div className="flex items-center justify-between text-xs text-[#635e53]">
    <span>{label}</span>
    <span className="font-medium text-[#1a0f0b]">{formatRupiah(amount)}</span>
  </div>
);
