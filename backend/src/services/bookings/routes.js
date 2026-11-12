import { getMyBookingsHandler } from "./controller.js";

const routes = [
    {
        method: 'GET',
        path: '/bookings/me',
        handler: getMyBookingsHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },
];

export default routes;
