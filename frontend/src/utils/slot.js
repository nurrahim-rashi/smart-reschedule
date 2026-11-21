// Kelompokkan slot per tanggal: [[dateKey, [slot, ...]], ...], urutan tetap
function groupSlotsByDate(slots) {
    const groups = new Map();

    for (const slot of slots) {
        if (!groups.has(slot.dateKey)) {
            groups.set(slot.dateKey, []);
        }

        groups.get(slot.dateKey).push(slot);
    }

    return [...groups.entries()];
}

// "Sabtu, 28 Nov 08:00" -> { dateLabel: "Sabtu, 28 Nov", time: "08:00" }
function splitSlotLabel(label) {
    const index = label.lastIndexOf(' ');

    return {
        dateLabel: label.slice(0, index),
        time: label.slice(index + 1),
    };
}

// "11:00" -> "11:00 – 12:00", slot selalu berdurasi 1 jam
function formatTimeRange(time) {
    const hour = Number(time.split(':')[0]);
    return `${time} – ${String(hour + 1).padStart(2, '0')}:00`;
}

/**
 * Gabungkan slot tersedia dengan jadwal milik member, supaya jadwal sendiri
 * tetap tampil di grid (walaupun slotnya sudah penuh).
 * Slot milik member ditandai bookingId-nya.
 */
function mergeBookedSlots(timeSlots, bookings) {
    const bookingBySlot = new Map(bookings.map((booking) => [booking.slotId, booking]));

    const merged = timeSlots.map((slot) => (bookingBySlot.has(slot.id)
        ? { ...slot, bookingId: bookingBySlot.get(slot.id).id }
        : slot));

    const listedIds = new Set(timeSlots.map((slot) => slot.id));

    for (const booking of bookings) {
        if (!listedIds.has(booking.slotId)) {
            merged.push({
                id: booking.slotId,
                label: booking.schedule,
                startTime: booking.startTime,
                dateKey: booking.dateKey,
                bookingId: booking.id,
            });
        }
    }

    return merged.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

export { groupSlotsByDate, splitSlotLabel, formatTimeRange, mergeBookedSlots };
