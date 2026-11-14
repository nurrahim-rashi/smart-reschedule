import { useState, useEffect } from "react";
import { getRescheduleRequests, approveRescheduleRequest, rejectRescheduleRequest } from "../utils/api.js";
import { showFormattedDate } from "../utils/date.js";

function AdminPage() {
    const [rescheduleRequests, setRescheduleRequests] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function fetchRequests() {
            const { data } = await getRescheduleRequests();
            setRescheduleRequests(data);
        }

        fetchRequests();
    }, []);

    function removeRequest(id) {
        setRescheduleRequests(rescheduleRequests.filter((request) => request.id !== id));
    }
    async function onApproveHandler(id) {
        setErrorMessage('');
        const result = await approveRescheduleRequest(id);

        if (result.error) {
            setErrorMessage(result.message);
            return;
        }

        removeRequest(id);
    }

    async function onRejectHandler(id) {
        setErrorMessage('');
        const result = await rejectRescheduleRequest(id);

        if (result.error) {
            setErrorMessage(result.message);
            return;
        }

        removeRequest(id);
    }

    return (
        <section>
            <h2>Request Reschedule Masuk</h2>

            {errorMessage && <p>{errorMessage}</p>}

            {rescheduleRequests.length === 0 ? (
                <p>Tidak ada request yang menunggu persetujuan.</p>
            ) : (
                <ul>
                    {rescheduleRequests.map((request) => (
                        <li key={request.id}>
                            <p>
                                <strong>{request.customer.name}</strong>, {request.sessionType}: {request.oldSchedule} → {request.newSchedule}
                            </p>
                            <p>Pesan: {request.message}</p>
                            <p>Diajukan: {showFormattedDate(request.createdAt)}</p>

                            {request.aiAnalysis && <p>Analisis AI: {request.aiAnalysis.intent}</p>}
                            {request.draftReply && <p>Draft balasan: {request.draftReply.text}</p>}

                            <button type="button" onClick={() => onApproveHandler(request.id)}>
                                Setujui
                            </button>
                            <button type="button" onClick={() => onRejectHandler(request.id)}>
                                Tolak
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default AdminPage;