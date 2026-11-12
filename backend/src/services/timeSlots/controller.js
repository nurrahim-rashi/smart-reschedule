import TimeSlotsRepository from "./repository.js";
import { formatSlotLabel } from "../../utils/slot-label.js";

export const getTimeSlotsHandler = async () => {
    const timeSlots = await TimeSlotsRepository.getTimeSlots();

    return {
        status: 'success',
        data: { timeSlots },
    };
};

export const getAvailableTimeSlotsHandler = async (request) => {
    const { sessionType } = request.query;
    const rows = await TimeSlotsRepository.getAvailableTimeSlots(sessionType);

    const timeSlots = rows.map((slot) => ({
        id: slot.id,
        sessionType: slot.session_type,
        startTime: slot.start_time,
        endTime: slot.end_time,
        remaining: slot.remaining,
        label: formatSlotLabel(slot.start_time),
    }));

    return {
        status: 'success',
        data: { timeSlots },
    };
};