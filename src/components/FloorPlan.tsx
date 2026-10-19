import React from 'react';
import { TableItem } from '../types/reservation';
import { Check, Lock, XCircle, Star, Sparkles } from 'lucide-react';

interface FloorPlanProps {
  tables: TableItem[];
  selectedTableId?: string;
  onSelectTable?: (table: TableItem) => void;
  interactive?: boolean;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  interactive = true,
}) => {
  const gardenTables = tables.filter((t) => t.zone === 'semi-outdoor');
  const indoorTables = tables.filter((t) => t.zone === 'indoor-lounge');

  const renderTableNode = (table: TableItem) => {
    const isSelected = selectedTableId === table.id;
    const isAvailable = table.status === 'available';
    const isReserved = table.status === 'reserved';
    const isOccupied = table.status === 'occupied';

    // Click handler
    const handleClick = () => {
      if (!interactive) return;
      if (isAvailable || isSelected) {
        onSelectTable?.(table);
      }
    };

    if (isSelected) {
      return (
        <button
          key={table.id}
          type="button"
          onClick={handleClick}
          className="rounded-xl bg-[#1a0f0b] text-white p-3 text-center ring-2 ring-[#D98A45] shadow-lg transform scale-105 transition-all cursor-pointer relative"
        >
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs font-bold text-[#ffdcc3]">{table.id}</span>
            {table.isFavorite && <Star className="w-3 h-3 fill-[#D98A45] text-[#D98A45]" />}
          </div>
          <p className="text-[10px] text-[#9c8983]">{table.seats} Kursi</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-[10px] bg-[#D98A45] text-white rounded font-bold">
            Terpilih
          </span>
        </button>
      );
    }

    if (isAvailable) {
      return (
        <button
          key={table.id}
          type="button"
          onClick={handleClick}
          className="rounded-xl border border-[#71916B] bg-[#71916B]/10 hover:bg-[#71916B]/20 p-3 text-center transition-all hover:shadow-md cursor-pointer group active:scale-95"
          title={`Klik untuk pilih ${table.name} (${table.seats} kursi)`}
        >
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs font-bold text-[#71916B] group-hover:text-[#557050]">
              {table.id}
            </span>
            {table.isFavorite && <Star className="w-3 h-3 fill-[#D98A45] text-[#D98A45]" />}
          </div>
          <p className="text-[10px] text-[#635e53]">{table.seats} Kursi</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-[10px] bg-[#71916B] text-white rounded font-semibold">
            Tersedia
          </span>
        </button>
      );
    }

    if (isReserved) {
      return (
        <div
          key={table.id}
          className="rounded-xl border border-[#D98A45] bg-[#D98A45]/10 p-3 text-center opacity-90 cursor-not-allowed"
          title={`${table.name} sudah direservasi tamu lain`}
        >
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs font-bold text-[#D98A45]">{table.id}</span>
          </div>
          <p className="text-[10px] text-[#635e53]">{table.seats} Kursi</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-[10px] bg-[#D98A45] text-white rounded font-semibold">
            Reserved
          </span>
        </div>
      );
    }

    // Occupied
    return (
      <div
        key={table.id}
        className="rounded-xl border border-[#C56A64] bg-[#C56A64]/10 p-3 text-center opacity-75 cursor-not-allowed"
        title={`${table.name} penuh`}
      >
        <span className="text-xs font-bold text-[#C56A64] block">{table.id}</span>
        <p className="text-[10px] text-[#635e53]">{table.seats} Kursi</p>
        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] bg-[#C56A64] text-white rounded font-semibold">
          Penuh
        </span>
      </div>
    );
  };

  return (
    <div className="bg-[#F8F5F0] rounded-2xl border border-[#E7DFD4] p-5 sm:p-6 shadow-xs overflow-x-auto">
      <div className="min-w-[640px] space-y-6">
        {/* Zone 1: Semi Outdoor Garden */}
        <div>
          <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#E7DFD4]">
            <span className="text-sm sm:text-base font-bold text-[#1a0f0b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#71916B] text-[20px]">yard</span>
              Zona Semi-Outdoor Garden (Sirkulasi Alami)
            </span>
            <span className="text-[#635e53] text-xs font-medium">Meja G-01 - G-06</span>
          </div>
          <div className="grid grid-cols-6 gap-3 sm:gap-4">
            {gardenTables.slice(0, 6).map(renderTableNode)}
          </div>
        </div>

        {/* Central Ambient Divider - Takjil Bar Landmark */}
        <div className="flex items-center justify-center my-2">
          <div className="w-full border-t border-dashed border-[#E7DFD4]" />
          <div className="px-4 py-1.5 rounded-full bg-[#faebe2] text-[#D98A45] text-xs font-bold whitespace-nowrap border border-[#E7DFD4] flex items-center gap-2 mx-2">
            <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
            BUFFET CENTRAL TAKJIL BAR & LIVE COOKING
          </div>
          <div className="w-full border-t border-dashed border-[#E7DFD4]" />
        </div>

        {/* Zone 2: Indoor Main Lounge */}
        <div>
          <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#E7DFD4]">
            <span className="text-sm sm:text-base font-bold text-[#1a0f0b] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1a0f0b] text-[20px]">ac_unit</span>
              Zona Indoor Main Lounge (Dekat Takjil Bar)
            </span>
            <span className="text-[#635e53] text-xs font-medium">Meja M-01 - M-06</span>
          </div>
          <div className="grid grid-cols-6 gap-3 sm:gap-4">
            {indoorTables.slice(0, 6).map(renderTableNode)}
          </div>
        </div>
      </div>
    </div>
  );
};
