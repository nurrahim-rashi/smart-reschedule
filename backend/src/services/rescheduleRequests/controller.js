import RescheduleRequestsRepository from "./repository.js";
import UsersRepository from "../users/repository.js";
import { validateRequestPayload, validateReviewPayload, validateRequestQuery, validateRequestParams } from "./validator.js";
import { InvariantError, NotFoundError } from "../../exceptions/index.js";
import { verifyAdmin } from "../../security/authorization.js";
import { getDraftReply } from "../../ai/ai-client.js";
import { formatSlotLabel } from "../../utils/slot-label.js";

const mapRequest = (row) => ({
    id: row.id,
    sessionType: row.session_type,
    oldSchedule: formatSlotLabel(row.old_start_time),
    newSchedule: formatSlotLabel(row.new_start_time),
    message: row.message,
    status: row.status,
    adminNote: row.admin_note,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
});

export const postRequestHandler = async (request, h) => {
    const { id: customerId } = request.auth.credentials;
    const { bookingId, requestedSlotId, message } = validateRequestPayload(request.payload);

    const booking = await RescheduleRequestsRepository.getBookingWithSlot(bookingId);
    if (!booking || booking.customer_id !== customerId) {
        throw new NotFoundError('Booking tidak ditemukan');
    }

    if (booking.status !== 'active') {
        throw new InvariantError('Booking ini sudah dibatalkan');
    }

    const slot = await RescheduleRequestsRepository.getSlotWithRemaining(requestedSlotId);
    if (!slot || !slot.is_active || !slot.is_upcoming || slot.remaining <= 0) {
        throw new InvariantError('Slot yang dipilih sudah penuh atau tidak tersedia');
    }

    if (slot.id === booking.slot_id) {
        throw new InvariantError('Slot yang dipilih sama dengan jadwal sekarang');
    }

    if (slot.session_type !== booking.session_type) {
        throw new InvariantError('Slot yang dipilih harus untuk sesi yang sama');
    }

    const requestId = await RescheduleRequestsRepository.addRequest({
        customerId,
        bookingId,
        oldSlotId: booking.slot_id,
        requestedSlotId,
        message,
    });

    // Analisis AI untuk admin. Jika gagal, request tetap tersimpan tanpa analisis.
    const customer = await UsersRepository.getUserById(customerId);
    const aiResult = await getDraftReply({
        message,
        slots: [formatSlotLabel(slot.start_time)],
        customerName: customer?.name,
        currentSchedule: formatSlotLabel(booking.start_time),
    });

    if (aiResult) {
        try {
            await RescheduleRequestsRepository.addAiResult(requestId, aiResult);
        } catch (error) {
            console.error('Gagal menyimpan hasil AI:', error.message);
        }
    }

    return h.response({
        status: 'success',
        message: 'Request reschedule berhasil diajukan',
        data: { requestId },
    }).code(201);
};

export const getMyRequestsHandler = async (request) => {
    const { id } = request.auth.credentials;
    const rows = await RescheduleRequestsRepository.getRequestsByCustomer(id);

    return {
        status: 'success',
        data: { rescheduleRequests: rows.map(mapRequest) },
    };
};

export const getRequestsHandler = async (request) => {
    verifyAdmin(request.auth.credentials);
    const { status } = validateRequestQuery(request.query);

    const rows = await RescheduleRequestsRepository.getRequests(status);

    const rescheduleRequests = rows.map((row) => ({
        ...mapRequest(row),
        customer: {
            id: row.customer_id,
            name: row.customer_name,
            phone: row.customer_phone,
        },
        aiAnalysis: row.intent ? {
            intent: row.intent,
            confidence: row.confidence,
            preferredDay: row.preferred_day,
            preferredPeriod: row.preferred_period,
            preferredTime: row.preferred_time,
        } : null,
        draftReply: row.draft_text ? {
            text: row.draft_text,
            source: row.draft_source,
            needsReview: row.needs_review,
        } : null,
    }));

    return {
        status: 'success',
        data: { rescheduleRequests },
    };
};

export const approveRequestHandler = async (request) => {
    verifyAdmin(request.auth.credentials);
    const { id } = validateRequestParams(request.params);
    const { adminNote } = validateReviewPayload(request.payload);

    await RescheduleRequestsRepository.approveRequest({
        requestId: id,
        adminId: request.auth.credentials.id,
        adminNote,
    });

    return {
        status: 'success',
        message: 'Request reschedule disetujui',
    };
};

export const rejectRequestHandler = async (request) => {
    verifyAdmin(request.auth.credentials);
    const { id } = validateRequestParams(request.params);
    const { adminNote } = validateReviewPayload(request.payload);

    await RescheduleRequestsRepository.rejectRequest({
        requestId: id,
        adminId: request.auth.credentials.id,
        adminNote,
    });

    return {
        status: 'success',
        message: 'Request reschedule ditolak',
    };
};
