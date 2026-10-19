import { ReservationData, TableItem } from '../types/reservation';

const BOOKING_DATA_RESET_VERSION = '2026-10-empty-bookings';

export const ensureBookingDataReset = () => {
  if (localStorage.getItem('bukber_booking_data_reset_version') === BOOKING_DATA_RESET_VERSION) {
    return;
  }

  localStorage.removeItem('bukber_reservations');
  localStorage.removeItem('bukber_tables');
  localStorage.setItem('bukber_booking_data_reset_version', BOOKING_DATA_RESET_VERSION);
};

export const getSmallestSuitableTableCapacity = (pax: number, tables: TableItem[]) =>
  tables
    .map((table) => table.seats)
    .filter((seats) => seats >= pax)
    .sort((a, b) => a - b)[0];

export const isTableCapacitySuitable = (pax: number, table: TableItem, tables: TableItem[]) =>
  table.seats === getSmallestSuitableTableCapacity(pax, tables);

export const findTableBookingConflict = (
  reservations: ReservationData[],
  date: string,
  tableId: string,
  excludedBookingId?: string,
): ReservationData | undefined =>
  reservations.find(
    (reservation) =>
      reservation.bookingId !== excludedBookingId &&
      reservation.date === date &&
      reservation.tableId === tableId &&
      reservation.status !== 'cancelled',
  );
