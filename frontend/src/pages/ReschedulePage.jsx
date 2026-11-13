import { useState, useEffect } from "react";
import { getDraftReply } from "../utils/ai.js";
import { getRecommendedSlots } from "../utils/slot.js";
import { getMyBookings, getAvailableSlots, addRescheduleRequests } from "../utils/api.js";

function ReschedulePage() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [draftReply, setDraftReply] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [booking, setBooking] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const bookingResult = await getMyBookings();
            const firstBooking = bookingResult.data[0];
            if (!firstBooking) {
                return;
            }
            setBooking(firstBooking);

            const slotResult = await getAvailableSlots(firstBooking.sessionType);
            setTimeSlots(slotResult.data.filter((slot) => slot.id !== firstBooking.slotId));
        }

        fetchData();
    }, []);

    const slotLabels = timeSlots.map((slot) => slot.label);
    
    async function onSubmitHandler(event) {
        event.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setAnalysis(null);
        setDraftReply('');
        setSelectedSlot('');
        setSubmitted(false);

        try {
            const result = await getDraftReply({ message, slots: slotLabels });

            if (result.error) {
                setErrorMessage('Gagal menganalisis pesan. Coba lagi nanti.');
                return;
            }
            setAnalysis(result.data);
            setDraftReply(result.data.draft_reply);
        } catch {
            setErrorMessage('Tidak bisa terhubung ke layanan AI.');
        } finally {
            setLoading(false);
        }
    }
    
    async function onAjukanHandler() {
        setErrorMessage('');
        const slot = timeSlots.find((item) => item.label === selectedSlot);

        const result = await addRescheduleRequests({
            bookingId: booking.id,
            requestedSlotId: slot.id,
            message,
        });

        if (result.error) {
            setErrorMessage(result.message);
            return;
        }

        setSubmitted(true);
    }

    const recommendation = analysis && analysis.intent === 'reschedule'
    ? getRecommendedSlots(slotLabels, analysis.preferred_day, analysis.preferred_period)
    : null;

    return (
        <section>
            <h2>Ajukan Reschedule</h2>

            {booking ? (
                <p>
                    Booking kamu sekarang: <strong>{booking.sessionType}</strong>, {booking.schedule}
                </p>
            ) : (
                <p>Kamu belum punya booking aktif.</p>
            )}

            <form onSubmit={onSubmitHandler}>
                <label htmlFor="message">Pesan ke admin</label>
                <br />
                <textarea
                id="message"
                rows="4"
                placeholder="Contoh: Rabu aku ada keperluan, tolong pindah ke Sabtu pagi yaa"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                />
                <br />
                <button type="submit" disabled={loading || !message || !booking}>
                    {loading ? 'Memproses...' : 'Kirim'}
                </button>
            </form>

            {errorMessage && <p>{errorMessage}</p>}

            {analysis && (
                <div>
                    <h3>Hasil Analisis AI</h3>
                    <p>Intent: {analysis.intent}</p>
                    <p>Hari diminta: {analysis.preferred_day || '-'}</p>
                    <p>Waktu diminta: {analysis.preferred_period || '-'}</p>
                    <p>Jam diminta: {analysis.preferred_time || '-'}</p>
                </div>
            )}

            {draftReply && (
                <div>
                    <h3>Draft Balasan</h3>
                    <p>{draftReply}</p>
                </div>
            )}
            {analysis && analysis.intent !== 'reschedule' && (
                <p>Pesan ini bukan permintaan reschedule, jadi tidak perlu pilih jadwal baru.</p>
            )}
            {recommendation && (
                <div>
                    <h3>Pilih Jadwal Baru</h3>

                    <p><strong>Rekomendasi</strong></p>
                    {recommendation.matched.length === 0 && <p>Tidak ada slot yang cocok dengan permintaanmu.</p>}
                    {recommendation.matched.map((slot) => (
                        <label key={slot}>
                            <input
                            type="radio"
                            name="slot"
                            value={slot}
                            checked={selectedSlot === slot}
                            onChange={(event) => setSelectedSlot(event.target.value)}
                            />
                            {slot}
                            <br />
                        </label>
                    ))}

                    <p><strong>Slot lain</strong></p>
                    {recommendation.others.map((slot) => (
                        <label key={slot}>
                            <input
                            type="radio"
                            name="slot"
                            value={slot}
                            checked={selectedSlot === slot}
                            onChange={(event) => setSelectedSlot(event.target.value)}
                            />
                            {slot}
                            <br />
                        </label>
                    ))}

                    <button type="button" onClick={onAjukanHandler} disabled={!selectedSlot || submitted}>
                        Ajukan
                    </button>

                    {submitted && <p>Request reschedule ke <strong>{selectedSlot}</strong> sudah dikirim. Tunggu persetujuan admin.</p>}
                </div>
            )}
        </section>
    );
}

export default ReschedulePage;