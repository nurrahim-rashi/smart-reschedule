import RescheduleRequestsRepository from "./repository.js";
import UsersRepository from "../users/repository.js";
import {
    validateRequestPayload,
    validateReviewPayload,
    validateRequestQuery,
    validateRequestParams,
    validateDecisionDraftPayload,
} from "./validator.js";
import { InvariantError, NotFoundError } from "../../exceptions/index.js";
import { verifyAdmin } from "../../security/authorization.js";
import { getDraftReply, getDecisionReply } from "../../ai/ai-client.js";
import { getUpcomingAvailableSlots } from "../timeSlots/controller.js";
import { recommendSlots } from "../../utils/slot-recommendation.js";
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

const MAX_DRAFT_ALTERNATIVES = 3;

export const postDecisionDraftHandler = async (request, h) => {
    verifyAdmin(request.auth.credentials);
    const { id } = validateRequestParams(request.params);
    const { decision, reason } = validateDecisionDraftPayload(request.payload);

    const detail = await RescheduleRequestsRepository.getRequestDetail(id);
    if (!detail) {
        throw new NotFoundError('Request reschedule tidak ditemukan');
    }

    if (detail.status !== 'pending') {
        throw new InvariantError(`Request ini sudah ${detail.status}`);
    }

    // Saat menolak, tawarkan slot lain yang paling dekat dengan preferensi customer
    let alternatives = [];

    if (decision === 'rejected') {
        const excluded = new Set([detail.old_slot_id, detail.requested_slot_id]);
        const slots = (await getUpcomingAvailableSlots()).filter((slot) => !excluded.has(slot.id));

        const { matched, alternatives: others } = recommendSlots(slots, {
            day: detail.preferred_day,
            period: detail.preferred_period,
            time: detail.preferred_time,
        });

        alternatives = [...matched, ...others]
            .slice(0, MAX_DRAFT_ALTERNATIVES)
            .map((slot) => slot.label);
    }

    const aiResult = await getDecisionReply({
        decision,
        oldSchedule: formatSlotLabel(detail.old_start_time),
        newSchedule: formatSlotLabel(detail.new_start_time),
        alternatives,
        customerName: detail.customer_name,
        message: detail.message,
        reason: reason || null,
    });

    if (!aiResult) {
        throw new InvariantError('Layanan AI sedang tidak tersedia, silakan tulis catatan secara manual');
    }

    const draftReply = {
        text: aiResult.draft_reply,
        source: aiResult.source,
        needsReview: aiResult.source !== 'gemini',
    };

    await RescheduleRequestsRepository.addDraft(id, draftReply);

    return h.response({
        status: 'success',
        data: { draftReply, alternatives },
    }).code(201);
};
