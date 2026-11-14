import { useState } from "react";
import { showFormattedDate } from "../utils/date.js";

function RequestItem({ request, onApprove, onReject }) {
    const [adminNote, setAdminNote] = useState('');

    return (
        <li>
            <p>
                <strong>{request.customer.name}</strong>, {request.sessionType}: {request.oldSchedule} → {request.newSchedule}
            </p>
            <p>Pesan: {request.message}</p>
            <p>Diajukan: {showFormattedDate(request.createdAt)}</p>

            {request.aiAnalysis && <p>Analisis AI: {request.aiAnalysis.intent}</p>}
            {request.draftReply && <p>Draft balasan: {request.draftReply.text}</p>}

            <label htmlFor={`note-${request.id}`}>Catatan admin (opsional)</label>
            <br />
            <textarea
            id={`note-${request.id}`}
            rows="2"
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            />
            <br />

            <button type="button" onClick={() => onApprove(request.id, adminNote)}>
                Setujui
            </button>
            <button type="button" onClick={() => onReject(request.id, adminNote)}>
                Tolak
            </button>
        </li>
    );
}

export default RequestItem;