import { useState, useEffect } from "react";
import { getRescheduleRequests, approveRescheduleRequest, rejectRescheduleRequest } from "../utils/api.js";
import RequestItem from "../components/RequestItem.jsx";

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
    async function onApproveHandler(id, adminNote) {
        setErrorMessage('');
        const result = await approveRescheduleRequest(id, adminNote);

        if (result.error) {
            setErrorMessage(result.message);
            return;
        }

        removeRequest(id);
    }

    async function onRejectHandler(id, adminNote) {
        setErrorMessage('');
        const result = await rejectRescheduleRequest(id, adminNote);

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
                        <RequestItem
                        key={request.id}
                        request={request}
                        onApprove={onApproveHandler}
                        onReject={onRejectHandler}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

export default AdminPage;