import { useState } from "react";
import { Link } from "react-router-dom";
import { groupSlotsByDate, splitSlotLabel } from "../utils/slot.js";

// activeBookingId: jadwal yang sedang di-reschedule, ditampilkan tanpa tombol Reschedule
function SlotPicker({ slots, selectedId, onSelect, activeBookingId }) {
  const groups = groupSlotsByDate(slots);
  const [activeDate, setActiveDate] = useState(null);

  if (groups.length === 0) {
    return (
      <div className="alert alert-warning">
        <span>Belum ada slot yang tersedia.</span>
      </div>
    );
  }

  const currentDate = activeDate ?? groups[0][0];
  const currentSlots =
    groups.find(([dateKey]) => dateKey === currentDate)?.[1] ?? [];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {groups.map(([dateKey, daySlots]) => (
          <button
            key={dateKey}
            type="button"
            onClick={() => setActiveDate(dateKey)}
            className={`btn btn-sm shrink-0 ${
              dateKey === currentDate ? "btn-success" : "btn-outline"
            }`}
          >
            {splitSlotLabel(daySlots[0].label).dateLabel}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-4">
        {currentSlots.map((slot) => slot.bookingId ? (
          // Slot milik member: tidak bisa dipilih, tapi bisa langsung di-reschedule
          <div
            key={slot.id}
            className="flex flex-col items-center justify-center gap-1 rounded-field border border-success/40 bg-success/10 py-2"
          >
            {slot.bookingId === activeBookingId ? (
              <>
                <span className="font-semibold opacity-60">
                  {splitSlotLabel(slot.label).time}
                </span>

                <span className="text-xs text-success font-medium">
                  Jadwal sekarang
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-success font-medium">
                  Sudah di-booking
                </span>

                <span className="font-semibold opacity-60">
                  {splitSlotLabel(slot.label).time}
                </span>
              </>
            )}

            {slot.bookingId !== activeBookingId && (
              <Link
                to="/reschedule"
                state={{ bookingId: slot.bookingId }}
                className="btn btn-xs btn-success btn-outline"
              >
                Reschedule
              </Link>
            )}
          </div>
        ) : (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelect(slot)}
            className={`btn h-auto py-2 flex-col gap-0 ${
              slot.id === selectedId ? "btn-success" : "btn-ghost border-base-300"
            }`}
          >
            <span className="font-semibold">
              {splitSlotLabel(slot.label).time}
            </span>

            <span className="text-xs opacity-70">
              sisa {slot.remaining}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SlotPicker;
