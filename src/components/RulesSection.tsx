import React from "react";
import { CalendarCheck, Clock3, ShieldCheck, Utensils } from "lucide-react";

const reservationRules = [
  {
    icon: CalendarCheck,
    title: "Reservasi terkonfirmasi",
    description:
      "Reservasi berlaku setelah menerima konfirmasi resmi atau e-tiket dari admin melalui WhatsApp.",
  },
  {
    icon: Clock3,
    title: "Datang tepat waktu",
    description:
      "Mohon hadir 15 menit sebelum waktu yang dipilih. Toleransi keterlambatan tanpa konfirmasi adalah 20 menit.",
  },
  {
    icon: ShieldCheck,
    title: "Pembatalan & reschedule",
    description:
      "Refund penuh dapat diajukan maksimal H-1. Pembatalan pada hari-H dapat dikenai biaya operasional 50% dari DP. Reschedule mengikuti ketersediaan meja.",
  },
  {
    icon: Utensils,
    title: "Sajian halal",
    description:
      "Seluruh sajian dipersiapkan menggunakan bahan halal tersertifikasi.",
  },
];

export const RulesSection: React.FC = () => (
  <section
    id="rules"
    className="border-b border-[#E7DFD4] bg-[#F8F5F0] py-12 md:py-16"
    aria-labelledby="rules-heading"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-8 text-center">
        <span className="inline-flex rounded-full bg-[#faebe2] px-3.5 py-1.5 text-xs font-semibold text-[#9a5929]">
          Sebelum Berkunjung
        </span>
        <h2
          id="rules-heading"
          className="mt-3 font-display text-2xl font-bold text-[#1a0f0b] sm:text-3xl"
        >
          Rules & Ketentuan Reservasi
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#635e53] sm:text-base">
          Beberapa hal penting agar momen buka bersama berjalan nyaman untuk
          semua tamu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reservationRules.map(({ icon: Icon, title, description }, index) => (
          <article
            key={title}
            className="rounded-2xl border border-[#E7DFD4] bg-white p-5 shadow-xs"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#faebe2] text-[#9a5929]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#D98A45]">
              Aturan {index + 1}
            </p>
            <h3 className="font-display text-base font-bold text-[#1a0f0b]">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#635e53]">
              {description}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
