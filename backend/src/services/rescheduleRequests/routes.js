import {
    postRequestHandler,
    getMyRequestsHandler,
    getRequestsHandler,
    approveRequestHandler,
    rejectRequestHandler,
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
];

export default routes;
