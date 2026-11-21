import BookingsRepository from "./repository.js";
import { formatSlotLabel } from "../../utils/slot-label.js";
import { validateBookingPayload } from "./validator.js";

export const getMyBookingsHandler = async (request) => {
    const { id } = request.auth.credentials;
    const rows = await BookingsRepository.getActiveBookingsByCustomer(id);

    const bookings = rows.map((booking) => ({
        id: booking.id,
        slotId: booking.slot_id,
        sessionType: booking.session_type,
        startTime: booking.start_time,
        endTime: booking.end_time,
        schedule: formatSlotLabel(booking.start_time),
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
