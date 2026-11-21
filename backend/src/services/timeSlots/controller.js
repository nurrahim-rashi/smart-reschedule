import TimeSlotsRepository from "./repository.js";
import { formatSlotLabel, getSlotParts } from "../../utils/slot-label.js";
import { recommendSlots } from "../../utils/slot-recommendation.js";
import { validateRecommendationQuery } from "./validator.js";

const mapSlot = (slot) => ({
    id: slot.id,
    sessionType: slot.session_type,
    startTime: slot.start_time,
    endTime: slot.end_time,
    remaining: slot.remaining,
    label: formatSlotLabel(slot.start_time),
    ...getSlotParts(slot.start_time),
});

export const getUpcomingAvailableSlots = async () => {
    await TimeSlotsRepository.ensureUpcomingSlots();
    const rows = await TimeSlotsRepository.getAvailableTimeSlots();
    return rows.map(mapSlot);
};

export const getTimeSlotsHandler = async () => {
    const timeSlots = await TimeSlotsRepository.getTimeSlots();

    return {
        status: 'success',
        data: { timeSlots },
    };
};

export const getAvailableTimeSlotsHandler = async () => {
    const timeSlots = await getUpcomingAvailableSlots();

    return {
        status: 'success',
        data: { timeSlots },
    };
};

export const getRecommendedTimeSlotsHandler = async (request) => {
    const { day, period, excludeSlotId } = validateRecommendationQuery(request.query);
    let { time } = validateRecommendationQuery(request.query);

    // excludeSlotId = jadwal customer saat ini. Jika customer tidak menyebut jam/waktu
    // (mis. "pindahin ke 3 minggu lagi"), anggap ingin jam yang sama dengan jadwalnya sekarang.
    let assumedHour = null;

    if (excludeSlotId && !time && !period) {
        const currentStart = await TimeSlotsRepository.getSlotStartTime(excludeSlotId);

        if (currentStart) {
            assumedHour = getSlotParts(currentStart).hour;
            time = `${assumedHour}:00`;
        }
    }

    const timeSlots = (await getUpcomingAvailableSlots())
        .filter((slot) => slot.id !== excludeSlotId);

    const { matched, alternatives } = recommendSlots(timeSlots, { day, period, time });

    return {
        status: 'success',
        data: { matched, alternatives, assumedHour },
    };
};
