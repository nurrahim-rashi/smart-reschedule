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
    const { day, period, time, excludeSlotId } = validateRecommendationQuery(request.query);

    const timeSlots = (await getUpcomingAvailableSlots())
        .filter((slot) => slot.id !== excludeSlotId);

    const { matched, alternatives } = recommendSlots(timeSlots, { day, period, time });

    return {
        status: 'success',
        data: { matched, alternatives },
    };
};
