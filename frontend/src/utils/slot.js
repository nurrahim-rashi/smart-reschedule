function getPeriod(hour) {
    if (hour < 11) return 'pagi';
    if (hour < 15) return 'siang';
    if (hour < 18) return 'sore';
    return 'malam';
}

function isSlotMatch(slot, preferredDay, preferredPeriod) {
    const [day, time] = slot.toLowerCase().split(' ');
    const hour = Number(time.split(':')[0]);

    if (preferredDay && day !== preferredDay) {
        return false;
    }

    if (preferredPeriod && getPeriod(hour) !== preferredPeriod) {
        return false;
    }

    return Boolean(preferredDay || preferredPeriod);
}

function getRecommendedSlots(slots, preferredDay, preferredPeriod) {
    const matched = slots.filter((slot) =>
    isSlotMatch(slot, preferredDay, preferredPeriod));
    const others = slots.filter((slot) =>
    !isSlotMatch(slot, preferredDay, preferredPeriod));

    return { matched, others };
}

export { getPeriod, getRecommendedSlots };