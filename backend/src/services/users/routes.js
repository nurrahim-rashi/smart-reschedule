import { postUserHandler } from "./controller.js";

const routes = [
    {
        method: 'POST',
        path: '/users',
        handler: postUserHandler,
    },
];

export default routes;