import {
    getMyBookingsHandler,
    getMyCancelledBookingsHandler,
    postBookingHandler,
    cancelBookingHandler,
} from "./controller.js";

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
        method: 'POST',
        path: '/bookings/{id}/cancel',
        handler: cancelBookingHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },

    {
        method: 'GET',
        path: '/bookings/me/cancelled',
        handler: getMyCancelledBookingsHandler,
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
