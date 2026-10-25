import React, { useMemo, useState } from "react";
import { AddonItem, MenuItem, ReservationData } from "../types/reservation";
import { AlertCircle, Minus, Plus, X } from "lucide-react";
import { isReservationEditable } from "../data/reservations";

interface EditReservationOrderModalProps {
  reservation: ReservationData;
  packages: MenuItem[];
  addons: AddonItem[];
  onClose: () => void;
  onSave: (
    pax: number,
    packageSelections: Record<string, number>,
    addons: Record<string, number>,
  ) => Promise<ReservationData>;
}

const getEditErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("RESERVATION_EDIT_WINDOW_CLOSED")) {
    return "Batas waktu mengubah pesanan telah terlewati. Perubahan hanya bisa dilakukan sebelum pukul 12.00 WIB pada tanggal reservasi.";
  }
  if (message.includes("NO_AVAILABLE_TABLE_FOR_GUEST_COUNT")) {
    return "Tidak ada meja tersedia yang sesuai dengan jumlah tamu baru. Kurangi jumlah tamu atau coba lagi nanti.";
  }
  if (message.includes("RESERVATION_NOT_EDITABLE")) {
    return "Pesanan ini tidak dapat diubah karena status reservasinya sudah dibatalkan.";
  }
  if (message.includes("RESERVATION_NOT_FOUND")) {
    return "Tiket tidak ditemukan. Cari kembali tiket menggunakan Booking ID dan nomor WhatsApp yang benar.";
  }
  if (message.includes("INVALID_GUEST_COUNT")) {
    return "Jumlah tamu harus antara 2 hingga 12 orang.";
  }
  if (message.includes("PACKAGE_SELECTIONS_MUST_AT_LEAST_MATCH_GUEST_COUNT")) {
    return "Jumlah paket minimal harus sama dengan jumlah tamu.";
  }
  return message || "Gagal menyimpan perubahan pesanan. Silakan coba lagi.";
};

export const EditReservationOrderModal: React.FC<EditReservationOrderModalProps> = ({
  reservation,
  packages,
  addons,
  onClose,
  onSave,
}) => {
  const [packageSelections, setPackageSelections] = useState(
    reservation.packageSelections,
  );
  const [pax, setPax] = useState(reservation.pax);
  const [selectedAddons, setSelectedAddons] = useState(reservation.addons);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const packageCount = Object.values(packageSelections).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const addonsTotal = useMemo(
    () =>
      Object.entries(selectedAddons).reduce((total, [addonId, quantity]) => {
        const addon = addons.find((item) => item.id === addonId);
        return total + (addon ? addon.price * quantity : 0);
      }, 0),
    [addons, selectedAddons],
  );
  const packageTotal = useMemo(
    () =>
      packages.reduce(
        (total, item) =>
          total + item.price * (packageSelections[item.id] ?? 0),
        0,
      ),
    [packageSelections, packages],
  );
  const total = packageTotal + addonsTotal;
  const updatePackageQuantity = (packageId: string, quantity: number) => {
    setPackageSelections((current) => {
      const currentQuantity = current[packageId] ?? 0;
      const nextQuantity = Math.min(30, Math.max(0, Math.floor(quantity)));

      const next = { ...current };
      if (nextQuantity === 0) delete next[packageId];
      else next[packageId] = nextQuantity;
      if (nextQuantity === currentQuantity) return current;
      return next;
    });
    setFormError("");
  };

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    setSelectedAddons((current) => {
      const nextQuantity = Math.min(20, Math.max(0, Math.floor(quantity)));
      const next = { ...current };
      if (nextQuantity === 0) delete next[addonId];
      else next[addonId] = nextQuantity;
      return next;
    });
    setFormError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (pax < 2 || pax > 12) {
      setFormError("Jumlah tamu harus antara 2 hingga 12 orang.");
      return;
    }
    if (packageCount < pax) {
      setFormError(
        `Jumlah paket minimal harus sama dengan jumlah tamu. Pilih setidaknya ${pax} paket.`,
      );
      return;
    }
    if (!isReservationEditable(reservation)) {
      setFormError("Batas waktu mengubah pesanan telah terlewati.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(pax, packageSelections, selectedAddons);
      onClose();
    } catch (error) {
      setFormError(getEditErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-order-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E7DFD4] bg-[#F8F5F0] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7DFD4] bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-[#9a5929]">
              Booking #{reservation.bookingId}
            </p>
            <h2
              id="edit-order-title"
              className="font-display text-xl font-bold text-[#1a0f0b]"
            >
              Ubah pesanan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup"
            className="rounded-lg p-2 text-[#635e53] transition hover:bg-[#F8F5F0] hover:text-[#1a0f0b] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          <div className="rounded-xl border border-[#E7DFD4] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-[#1a0f0b]">Jumlah tamu</h3>
              <span className="rounded-full bg-[#faebe2] px-3 py-1 text-sm font-bold text-[#8c4d20]">
                {pax} tamu
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#fffdfa] p-3">
              <span className="text-sm text-[#635e53]">
                Kapasitas meja mengikuti jumlah tamu
              </span>
              <QuantityControl
                label="Jumlah tamu"
                quantity={pax}
                min={2}
                max={12}
                canDecrease={pax > 2}
                canIncrease={pax < 12}
                onChange={(quantity) =>
                  setPax(Math.min(12, Math.max(2, quantity)))
                }
              />
            </div>
            <h3 className="mb-2 mt-5 font-semibold text-[#1a0f0b]">
              Jumlah paket
            </h3>
            <div className="space-y-3">
              {packages.map((item) => {
                const quantity = packageSelections[item.id] ?? 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-t border-[#F0EAE4] pt-3"
                  >
                    <div>
                      <p className="font-semibold text-[#1a0f0b]">{item.name}</p>
                      <p className="text-xs text-[#635e53]">
                        Rp{item.price.toLocaleString("id-ID")} / orang
                      </p>
                    </div>
                    <QuantityControl
                      label={item.name}
                      quantity={quantity}
                      min={0}
                      max={30}
                      canDecrease={quantity > 0}
                      canIncrease={quantity < 30}
                      onChange={(nextQuantity) =>
                        updatePackageQuantity(item.id, nextQuantity)
                      }
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#635e53]">
              Minimal pesan satu paket per tamu. Jumlah paket boleh melebihi
              jumlah tamu; jumlah tamu maksimal 12 orang.
            </p>
          </div>

          <div className="rounded-xl border border-[#E7DFD4] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#1a0f0b]">Menu tambahan</h3>
                <p className="text-xs text-[#635e53]">
                  Pilih minuman atau camilan jika diinginkan.
                </p>
              </div>
              <span className="rounded-full bg-[#faebe2] px-3 py-1 text-xs font-bold text-[#8c4d20]">
                Opsional
              </span>
            </div>
            <div className="space-y-3">
              {addons.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-t border-[#F0EAE4] pt-3"
                >
                  <div>
                    <p className="font-semibold text-[#1a0f0b]">{item.name}</p>
                    <p className="text-xs text-[#635e53]">
                      Rp{item.price.toLocaleString("id-ID")} / {item.unit ?? "item"}
                    </p>
                  </div>
                  <QuantityControl
                    label={item.name}
                    quantity={selectedAddons[item.id] ?? 0}
                    min={0}
                    max={20}
                    canDecrease={(selectedAddons[item.id] ?? 0) > 0}
                    canIncrease={(selectedAddons[item.id] ?? 0) < 20}
                    onChange={(nextQuantity) =>
                      updateAddonQuantity(item.id, nextQuantity)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#30231f] px-4 py-3 text-white">
            <span className="text-sm font-semibold">Total baru</span>
            <span className="font-display text-xl font-bold">
              Rp{total.toLocaleString("id-ID")}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-[#635e53]">
            Perubahan dapat disimpan sampai sebelum pukul 12.00 WIB pada tanggal
            reservasi. Meja akan disesuaikan otomatis dengan jumlah tamu dan
            ketersediaan.
          </p>

          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-[#C56A64]/40 bg-[#FBEEEE] p-3 text-sm text-[#8f3f3b]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-11 rounded-xl border border-[#E7DFD4] bg-white px-5 text-sm font-semibold text-[#635e53] hover:bg-[#F8F5F0] disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || pax < 2 || pax > 12}
              className="min-h-11 rounded-xl bg-[#9a5929] px-5 text-sm font-bold text-white transition hover:bg-[#78451f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

interface QuantityControlProps {
  label: string;
  quantity: number;
  min: number;
  max: number;
  canDecrease: boolean;
  canIncrease: boolean;
  onChange: (quantity: number) => void;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  label,
  quantity,
  min,
  max,
  canDecrease,
  canIncrease,
  onChange,
}) => (
  <div className="flex shrink-0 items-center gap-2">
    <button
      type="button"
      aria-label={`Kurangi ${label}`}
      disabled={!canDecrease}
      onClick={() => onChange(quantity - 1)}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cfc4b7] text-[#1a0f0b] hover:bg-[#F8F5F0] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Minus className="h-4 w-4" />
    </button>
    <input
      type="number"
      min={min}
      max={max}
      step={1}
      inputMode="numeric"
      aria-label={`Jumlah ${label}`}
      value={quantity}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
      className="h-10 w-16 rounded-lg border border-[#E7DFD4] bg-white text-center text-sm font-bold text-[#1a0f0b] outline-none focus:border-[#D98A45]"
    />
    <button
      type="button"
      aria-label={`Tambah ${label}`}
      disabled={!canIncrease}
      onClick={() => onChange(quantity + 1)}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9a5929] text-white hover:bg-[#78451f] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);
