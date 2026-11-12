const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Minta analisis + draft balasan ke ai-service.
 * Mengembalikan null jika ai-service gagal, supaya request customer tetap tersimpan.
 */
export const getDraftReply = async ({ message, slots, customerName, currentSchedule }) => {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/draft-reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                slots,
                customer_name: customerName,
                current_schedule: currentSchedule,
            }),
            signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
            console.error(`ai-service membalas ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Gagal menghubungi ai-service:', error.message);
        return null;
    }
};
