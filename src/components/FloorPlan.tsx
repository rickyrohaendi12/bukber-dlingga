import React from 'react';
import { Armchair, Check, Lock, Snowflake, Star, UtensilsCrossed } from 'lucide-react';
import { TableItem } from '../types/reservation';

interface FloorPlanProps {
  tables: TableItem[];
  selectedTableId?: string;
  onSelectTable?: (table: TableItem) => void;
  interactive?: boolean;
}

const STATUS_STYLES = {
  available: {
    label: 'Tersedia',
    color: '#71916B',
    border: 'border-[#71916B]/40',
    background: 'bg-[#71916B]/[0.06]',
    badge: 'bg-[#71916B] text-white',
  },
  reserved: {
    label: 'Dipesan',
    color: '#D98A45',
    border: 'border-[#D98A45]/50',
    background: 'bg-[#D98A45]/[0.07]',
    badge: 'bg-[#D98A45] text-white',
  },
  occupied: {
    label: 'Penuh',
    color: '#C56A64',
    border: 'border-[#C56A64]/50',
    background: 'bg-[#C56A64]/[0.07]',
    badge: 'bg-[#C56A64] text-white',
  },
} as const;

export const FloorPlan: React.FC<FloorPlanProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  interactive = true,
}) => {
  const gardenTables = tables.filter((table) => table.zone === 'semi-outdoor');
  const indoorTables = tables.filter((table) => table.zone === 'indoor-lounge');

  const renderTableNode = (table: TableItem) => {
    const isAvailable = table.status === 'available';
    const isSelected = isAvailable && selectedTableId === table.id;
    const statusStyle = STATUS_STYLES[table.status];
    const tableClassName = `group relative flex min-h-[166px] flex-col rounded-2xl border p-3 text-left transition-all ${
      isSelected
        ? 'border-[#D98A45] bg-[#1a0f0b] text-white shadow-lg shadow-[#1a0f0b]/15 ring-2 ring-[#D98A45]/30'
        : `${statusStyle.border} ${statusStyle.background} ${
            isAvailable && interactive
              ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]'
              : 'cursor-default'
          }`
    }`;

    const content = (
      <>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#1a0f0b]'}`}>
              {table.id}
            </p>
            <p className={`mt-0.5 text-[10px] ${isSelected ? 'text-white/65' : 'text-[#635e53]'}`}>
              {table.name}
            </p>
          </div>
          {table.isFavorite && (
            <span
              className={`rounded-full p-1.5 ${
                isSelected ? 'bg-white/10 text-[#ffb77d]' : 'bg-[#faebe2] text-[#D98A45]'
              }`}
              title="Meja favorit"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
            </span>
          )}
        </div>

        <div
          className={`my-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 ${
            isSelected ? 'text-[#ffb77d]' : ''
          }`}
          aria-label={`${table.seats} kursi, ${
            isAvailable ? 'kosong' : 'terisi'
          }`}
        >
          {Array.from({ length: table.seats }, (_, index) => (
            <Armchair
              key={`${table.id}-seat-${index}`}
              className="h-4 w-4"
              style={{
                color: isSelected ? '#ffb77d' : statusStyle.color,
                opacity: isAvailable ? 0.75 : 1,
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
              isSelected ? 'bg-[#D98A45] text-white' : statusStyle.badge
            }`}
          >
            {isSelected ? (
              <Check className="h-3 w-3" />
            ) : isAvailable ? (
              <Armchair className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            {isSelected ? 'Dipilih' : statusStyle.label}
          </span>
          <span className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-[#635e53]'}`}>
            {table.seats} kursi
          </span>
        </div>
      </>
    );

    if (!isAvailable) {
      return (
        <div
          key={table.id}
          className={tableClassName}
          title={`${table.name} ${statusStyle.label.toLowerCase()}`}
        >
          {content}
        </div>
      );
    }

    return (
      <button
        key={table.id}
        type="button"
        onClick={() => interactive && onSelectTable?.(table)}
        disabled={!interactive}
        className={`${tableClassName} ${!interactive ? 'cursor-default' : ''}`}
        title={
          interactive
            ? `Pilih ${table.name} (${table.seats} kursi)`
            : `${table.name} — ${statusStyle.label}`
        }
        aria-pressed={isSelected}
      >
        {content}
      </button>
    );
  };

  const renderZone = (
    label: string,
    description: string,
    zoneTables: TableItem[],
    icon: React.ReactNode,
  ) => (
    <section className="rounded-2xl border border-[#E7DFD4] bg-white/75 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#E7DFD4] pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faebe2] text-[#D98A45]">
            {icon}
          </span>
          <div>
            <h3 className="text-sm font-bold text-[#1a0f0b] sm:text-base">{label}</h3>
            <p className="text-[11px] text-[#635e53]">{description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#F8F5F0] px-2.5 py-1 text-[10px] font-semibold text-[#635e53]">
          {zoneTables.length} meja
        </span>
      </div>
      {zoneTables.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {zoneTables.map(renderTableNode)}
        </div>
      ) : (
        <p className="rounded-xl bg-[#F8F5F0] p-4 text-center text-xs text-[#635e53]">
          Belum ada meja di zona ini.
        </p>
      )}
    </section>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E7DFD4] bg-gradient-to-br from-[#FBF8F3] via-[#F8F5F0] to-[#F2E9DE] p-3 shadow-xs sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D98A45]">
            Denah tempat duduk
          </p>
          <p className="mt-1 text-[11px] text-[#635e53]">
            Setiap ikon kursi menunjukkan kapasitas meja.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
          {Object.entries(STATUS_STYLES).map(([status, style]) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-2.5 py-1 text-[#635e53]"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />
              {style.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {renderZone(
          'Semi-Outdoor Garden',
          'Sirkulasi alami, suasana taman',
          gardenTables,
          <span className="material-symbols-outlined text-[21px]" aria-hidden="true">yard</span>,
        )}

        <div className="flex items-center gap-3 px-2 py-1">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D98A45]/40 to-[#D98A45]/60" />
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E7DFD4] bg-[#faebe2] px-3 py-2 text-[10px] font-bold tracking-wide text-[#9a5929] sm:text-xs">
            <UtensilsCrossed className="h-4 w-4" />
            BUFFET TAKJIL & LIVE COOKING
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D98A45]/40 to-[#D98A45]/60" />
        </div>

        {renderZone(
          'Indoor Main Lounge',
          'Area ber-AC, dekat buffet',
          indoorTables,
          <Snowflake className="h-5 w-5" aria-hidden="true" />,
        )}
      </div>
    </div>
  );
};
