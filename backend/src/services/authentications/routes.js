import { postAuthenticationHandler } from "./controller.js";

const routes = [
    {
        method: 'POST',
        path: '/authentications',
        handler: postAuthenticationHandler,
    },
];

export default routes;