import {
    postRequestHandler,
    getMyRequestsHandler,
    getRequestsHandler,
    approveRequestHandler,
    rejectRequestHandler,
    postDecisionDraftHandler,
} from "./controller.js";

const options = {
    auth: 'gymnasyum_jwt',
};

const routes = [
    {
        method: 'POST',
        path: '/reschedule-requests',
        handler: postRequestHandler,
        options,
    },

    {
        method: 'GET',
        path: '/reschedule-requests/me',
        handler: getMyRequestsHandler,
        options,
    },

    {
        method: 'GET',
        path: '/reschedule-requests',
        handler: getRequestsHandler,
        options,
    },

    {
        method: 'POST',
        path: '/reschedule-requests/{id}/approve',
        handler: approveRequestHandler,
        options,
    },

    {
        method: 'POST',
        path: '/reschedule-requests/{id}/reject',
        handler: rejectRequestHandler,
        options,
    },

    {
        method: 'POST',
        path: '/reschedule-requests/{id}/decision-draft',
        handler: postDecisionDraftHandler,
        options,
    },
];

export default routes;
