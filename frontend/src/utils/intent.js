const INTENT_LABELS = {
    reschedule: 'Reschedule',
    cancel: 'Pembatalan',
    schedule_inquiry: 'Tanya Jadwal',
    confirmation: 'Konfirmasi',
    other: 'Lainnya',
};

function intentLabel(intent) {
    return INTENT_LABELS[intent] ?? intent;
}

export { INTENT_LABELS, intentLabel };
