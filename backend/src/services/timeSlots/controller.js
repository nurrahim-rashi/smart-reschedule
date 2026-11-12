import TimeSlotsRepository from "./repository.js";

export const getTimeSlotsHandler = async () => {
    const timeSlots = await TimeSlotsRepository.getTimeSlots();

    return {
        status: 'success',
        data: { timeSlots },
    };
};