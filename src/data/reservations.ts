import { ReservationData, TableItem } from '../types/reservation';
import { requireSupabase } from '../lib/supabase';

interface ReservationRow {
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  time_slot: string;
  pax: number;
  package_id: string;
  package_selections: Record<string, number>;
  table_id: string;
  notes: string;
  addons: Record<string, number>;
  status: ReservationData['status'];
  created_at: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
}

const mapReservation = (row: ReservationRow): ReservationData => ({
  bookingId: row.booking_id,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  date: row.date,
  timeSlot: row.time_slot,
  pax: row.pax,
  packageId: row.package_id,
  packageSelections:
    Object.keys(row.package_selections ?? {}).length > 0
      ? row.package_selections
      : { [row.package_id]: row.pax },
  tableId: row.table_id,
  notes: row.notes,
  addons: row.addons,
  status: row.status,
  createdAt: row.created_at,
  subtotal: row.subtotal,
  taxAmount: 0,
  totalAmount: row.subtotal,
});

export const getTodayDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

export const getTomorrowDate = () => {
  const [year, month, day] = getTodayDate().split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
};

export const getReservations = async () => {
  const { data, error } = await requireSupabase()
    .rpc('list_reservations');

  if (error) throw error;
  return (data as ReservationRow[]).map(mapReservation);
};

export const getBookedTableIds = async (date: string) => {
  const { data, error } = await requireSupabase().rpc('get_booked_tables', {
    p_date: date,
  });

  if (error) throw error;
  return (data as { table_id: string }[]).map((row) => row.table_id);
};

export const createReservation = async (
  reservation: Omit<
    ReservationData,
    'bookingId' | 'createdAt' | 'status' | 'subtotal' | 'taxAmount' | 'totalAmount'
  >,
) => {
  const { data, error } = await requireSupabase().rpc('create_reservation', {
    payload: {
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      date: reservation.date,
      timeSlot: reservation.timeSlot,
      pax: reservation.pax,
      packageId: reservation.packageId,
      packageSelections: reservation.packageSelections,
      tableId: reservation.tableId,
      notes: reservation.notes ?? '',
      addons: reservation.addons,
    },
  });

  if (error) throw error;
  if (!data) throw new Error('Supabase tidak mengembalikan data booking.');
  return mapReservation(data as ReservationRow);
};

export const updateReservationOrder = async (
  bookingId: string,
  phone: string,
  pax: number,
  packageSelections: Record<string, number>,
  addons: Record<string, number>,
) => {
  const { data, error } = await requireSupabase().rpc('update_reservation_order', {
    p_booking_id: bookingId,
    p_phone: phone,
    p_pax: pax,
    p_package_selections: packageSelections,
    p_addons: addons,
  });

  if (error) throw error;
  if (!data) throw new Error('Supabase tidak mengembalikan data booking yang diperbarui.');
  return mapReservation(data as ReservationRow);
};

export const lookupReservation = async (bookingId: string, phone: string) => {
  const { data, error } = await requireSupabase().rpc('lookup_reservation', {
    p_booking_id: bookingId,
    p_phone: phone,
  });

  if (error) throw error;
  const rows = data as ReservationRow[];
  return rows.length > 0 ? mapReservation(rows[0]) : null;
};

export const isReservationEditable = (
  reservation: ReservationData,
  now = new Date(),
) => {
  if (reservation.status === 'cancelled') return false;

  const localParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const parts = Object.fromEntries(localParts.map(({ type, value }) => [type, value]));
  const jakartaDate = `${parts.year}-${parts.month}-${parts.day}`;

  return reservation.date > jakartaDate ||
    (reservation.date === jakartaDate && Number(parts.hour) < 12);
};

export const updateReservationStatus = async (
  bookingId: string,
  status: ReservationData['status'],
) => {
  const { data, error } = await requireSupabase().rpc('set_reservation_status', {
    p_booking_id: bookingId,
    p_status: status,
  });

  if (error) throw error;
  if (!data) throw new Error('Supabase tidak mengembalikan data booking.');
  return mapReservation(data as ReservationRow);
};

export const isTableCapacitySuitable = (pax: number, table: TableItem) =>
  table.seats >= pax;
