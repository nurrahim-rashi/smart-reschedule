import BookingsRepository from "./repository.js";
import { formatSlotLabel, getSlotParts } from "../../utils/slot-label.js";
import { validateBookingPayload, validateBookingParams } from "./validator.js";

export const getMyBookingsHandler = async (request) => {
    const { id } = request.auth.credentials;
    const rows = await BookingsRepository.getActiveBookingsByCustomer(id);

    // dateKey, day, dan hour dipakai frontend untuk menampilkan jadwal di grid slot
    const bookings = rows.map((booking) => ({
        id: booking.id,
        slotId: booking.slot_id,
        sessionType: booking.session_type,
        startTime: booking.start_time,
        endTime: booking.end_time,
        schedule: formatSlotLabel(booking.start_time),
        ...getSlotParts(booking.start_time),
    }));

    return {
        status: 'success',
        data: { bookings },
    };
};

export const getMyCancelledBookingsHandler = async (request) => {
    const { id } = request.auth.credentials;
    const rows = await BookingsRepository.getCancelledBookingsByCustomer(id);

    const bookings = rows.map((booking) => ({
        id: booking.id,
        slotId: booking.slot_id,
        sessionType: booking.session_type,
        startTime: booking.start_time,
        endTime: booking.end_time,
        schedule: formatSlotLabel(booking.start_time),
        cancelledAt: booking.cancelled_at,
    }));

    return {
        status: 'success',
        data: { bookings },
    };
};

export const postBookingHandler = async (request, h) => {
    const { id: customerId } = request.auth.credentials;
    const { slotId } = validateBookingPayload(request.payload);

    const bookingId = await BookingsRepository.addBooking({ customerId, slotId });

    return h.response({
        status: 'success',
        message: 'Booking berhasil dibuat',
        data: { bookingId },
    }).code(201);
};

export const cancelBookingHandler = async (request) => {
    const { id: customerId } = request.auth.credentials;
    const { id: bookingId } = validateBookingParams(request.params);

    const closedRequests = await BookingsRepository.cancelBooking({ bookingId, customerId });

    return {
        status: 'success',
        message: 'Booking berhasil dibatalkan',
        data: { closedRequests },
    };
};
