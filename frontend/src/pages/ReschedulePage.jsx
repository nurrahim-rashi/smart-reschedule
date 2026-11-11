import { useState } from "react";
import { currentBooking, availableSlots } from "../utils/mock-data.js";
import { analyzeMessage, generateReply } from "../utils/ai.js";
import { getRecommendedSlots } from "../utils/slot.js";

function ReschedulePage() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [draftReply, setDraftReply] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    async function onSubmitHandler(event) {
        event.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setAnalysis(null);
        setDraftReply('');
        setSelectedSlot('');
        setSubmitted(false);

        try {
            const analyzeResult = await analyzeMessage(message);
            if (analyzeResult.error) {
                setErrorMessage('Gagal menganalisis pesan. Coba lagi nanti.');
                return;
            }
            setAnalysis(analyzeResult.data);

            const replyResult = await generateReply({
                intent: analyzeResult.data.intent,
                slots: availableSlots,
                message,
            });
            if (replyResult.error) {
                setErrorMessage('Gagal membuat draft balasan. Coba lagi nanti.');
                return;
            }
            setDraftReply(replyResult.data);
        } catch {
            setErrorMessage('Tidak bisa terhubung ke layanan AI.');
        } finally {
            setLoading(false);
        }
    }

    function onAjukanHandler() {
        console.log('Request reschedule:', {
            bookingId: currentBooking.id,
            message,
            selectedSlot,
        });
        setSubmitted(true);
    }

    const recommendation = analysis
    ? getRecommendedSlots(availableSlots, analysis.preferred_day, analysis.preferred_period)
    : null;

    return (
        <section>
            <h2>Ajukan Reschedule</h2>

            <p>
                Booking kamu sekarang: <strong>{currentBooking.sessionType}</strong>, {currentBooking.schedule}
            </p>

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
                <button type="submit" disabled={loading || !message}>
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