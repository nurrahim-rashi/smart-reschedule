import { getMyBookingsHandler, postBookingHandler } from "./controller.js";

const routes = [
    {
        method: 'POST',
        path: '/bookings',
        handler: postBookingHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },

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
