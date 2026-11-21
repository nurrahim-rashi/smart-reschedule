import { useState } from "react";
import { groupSlotsByDate, splitSlotLabel } from "../utils/slot.js";

function SlotPicker({ slots, selectedId, onSelect }) {
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
        {currentSlots.map((slot) => (
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
