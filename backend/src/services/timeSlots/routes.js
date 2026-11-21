import { getTimeSlotsHandler, getAvailableTimeSlotsHandler, getRecommendedTimeSlotsHandler } from "./controller.js";

const routes = [
    {
        method: 'GET',
        path: '/time-slots',
        handler: getTimeSlotsHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },

    {
        method: 'GET',
        path: '/time-slots/available',
        handler: getAvailableTimeSlotsHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },

    {
        method: 'GET',
        path: '/time-slots/recommendations',
        handler: getRecommendedTimeSlotsHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },
];

export default routes;