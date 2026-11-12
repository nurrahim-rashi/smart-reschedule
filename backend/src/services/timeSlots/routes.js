import { getTimeSlotsHandler } from "./controller.js";

const routes = [
    {
        method: 'GET',
        path: '/time-slots',
        handler: getTimeSlotsHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },
];

export default routes;