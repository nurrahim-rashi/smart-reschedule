import { postUserHandler, getMeHandler } from "./controller.js";

const routes = [
    {
        method: 'POST',
        path: '/users',
        handler: postUserHandler,
    },

    {
        method: 'GET',
        path: '/users/me',
        handler: getMeHandler,
        options: {
            auth: 'gymnasyum_jwt',
        },
    },
];

export default routes;