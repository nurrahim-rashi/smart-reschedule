const BASE_URL = 'http://localhost:5000';

async function register({ name, email, password }) {
    const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, message: responseJson.message };
    }

    return { error: false, data: responseJson.data };
}

async function login({ email, password }) {
    const response = await fetch(`${BASE_URL}/authentications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, message: responseJson.message };
    }

    return { error: false, data: responseJson.data };
}

function putAccessToken(accessToken) {
    localStorage.setItem('accessToken', accessToken);
}

function getAccessToken() {
    return localStorage.getItem('accessToken');
}

function removeAccessToken() {
    localStorage.removeItem('accessToken');
}

async function fetchWithToken(url, options = {}) {
    return fetch(url, { ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${getAccessToken()}`,
        },
    });
}

async function getUserLogged() {
    const response = await fetchWithToken(`${BASE_URL}/users/me`);
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, data: null };
    }

    return { error: false, data: responseJson.data.user };
}

async function getMyRescheduleRequests() {
    const response = await fetchWithToken(`${BASE_URL}/reschedule-requests/me`);
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, data: [] };
    }

    return { error: false, data: responseJson.data.rescheduleRequests };
}

async function getMyBookings() {
    const response = await fetchWithToken(`${BASE_URL}/bookings/me`);
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, data: [] };
    }

    return { error: false, data: responseJson.data.bookings };
}

async function getAvailableSlots(sessionType) {
    const response = await fetchWithToken(`${BASE_URL}/time-slots/available?sessionType=${sessionType}`);
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, data: [] };
    }

    return { error: false, data: responseJson.data.timeSlots };
}

async function addRescheduleRequests({ bookingId, requestedSlotId, message }) {
    const response = await fetchWithToken(`${BASE_URL}/reschedule-requests`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, requestedSlotId, message }),
    });
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, message: responseJson.message };
    }

    return { error: false, data: responseJson.data };
}

async function getRescheduleRequests() {
    const response = await fetchWithToken(`${BASE_URL}/reschedule-requests?status=pending`);
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, data: [] };
    }

    return { error: false, data: responseJson.data.rescheduleRequests};
}

async function approveRescheduleRequest(id) {
    const response = await fetchWithToken(`${BASE_URL}/reschedule-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, message: responseJson.message }; 
    }

    return { error: false };
}

async function rejectRescheduleRequest(id) {
    const response = await fetchWithToken(`${BASE_URL}/reschedule-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    const responseJson = await response.json();

    if (responseJson.status !== 'success') {
        return { error: true, message: responseJson.message }; 
    }

    return { error: false };
}

export { register, login, putAccessToken, getAccessToken, removeAccessToken, getUserLogged, getMyRescheduleRequests, getMyBookings, getAvailableSlots, addRescheduleRequests, getRescheduleRequests, approveRescheduleRequest, rejectRescheduleRequest };