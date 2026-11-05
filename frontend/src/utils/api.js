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

export { register, login, putAccessToken, getAccessToken, removeAccessToken };