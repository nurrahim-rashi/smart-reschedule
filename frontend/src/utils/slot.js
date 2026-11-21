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

export { groupSlotsByDate, splitSlotLabel };
