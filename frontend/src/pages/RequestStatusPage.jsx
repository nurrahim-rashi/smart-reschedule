import { useState, useEffect } from "react";
import { getMyRescheduleRequests } from "../utils/api.js";

const statusLabels = {
    pending: 'Menunggu persetujuan admin',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

function RequestStatusPage() {
    const [rescheduleRequests, setRescheduleRequests] = useState([]);

    useEffect(() => {
        async function fetchRequests() {
            const { data } = await getMyRescheduleRequests();
            setRescheduleRequests(data); 
        }

        fetchRequests();
    }, []);
    
    return (
        <section>
            <h2>Status Request Reschedule</h2>

            {rescheduleRequests.length === 0 ? (
                <p>Kamu belum pernah mengajukan reschedule.</p>
            ) : (
                <ul>
                    {rescheduleRequests.map((request) => (
                        <li key={request.id}>
                            <p>
                                <strong>{request.sessionType}</strong>: {request.oldSchedule} → {request.newSchedule} 
                            </p>
                            <p>Pesan: {request.message}</p>
                            <p>Status: {statusLabels [request.status]}</p>
                            {request.adminNote && <p>Catatan admin: {request.adminNote}</p>}
                            <p>Diajukan: {request.createdAt}</p>
                        </li>
                    ))}
                </ul>
            )}        
        </section>
    );
}

export default RequestStatusPage;