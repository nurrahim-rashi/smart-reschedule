import routes from "./routes.js";

export default {
    name: 'authentications',
    register: async (server) => {
        server.route(routes);
    },
};