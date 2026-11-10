const AI_BASE_URL = 'http://127.0.0.1:8000';

async function analyzeMessage(message) {
    const response = await fetch(`${AI_BASE_URL}/analyze-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        return { error: true, data: null };
    }

    const responseJson = await response.json();
    return { error: false, data: responseJson };
}

async function generateReply({ intent, slots, message }) {
    const response = await fetch(`${AI_BASE_URL}/generate-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ intent, slots, message }),
    });

    if (!response.ok) {
        return { error: true, data: null };
    }

    const responseJson = await response.json();
    return { error: false, data: responseJson.draft_reply };
}

export { analyzeMessage, generateReply };