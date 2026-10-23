export type TableStatus = 'available' | 'reserved' | 'occupied';

export type ZoneType = 'semi-outdoor' | 'indoor-lounge';

export interface TableItem {
  id: string; // e.g. 'G-01', 'M-01'
  name: string;
  zone: ZoneType;
  zoneName: string;
  seats: number;
  status: TableStatus;
  isFavorite?: boolean;
  minPax?: number;
  maxPax?: number;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'package' | 'beverage' | 'snack';
  price: number;
  minPax?: number;
  description: string;
  isPopular?: boolean;
  isVip?: boolean;
  features: string[];
}

export interface AddonItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  unit?: string;
}

export interface SelectedAddon {
  addonId: string;
  quantity: number;
}

export interface ReservationData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  pax: number;
  packageId: string;
  packageSelections: { [packageId: string]: number };
  tableId: string;
  notes?: string;
  addons: { [addonId: string]: number };
  status: 'pending' | 'awaiting_dp' | 'dp_paid' | 'cancelled';
  createdAt: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}
