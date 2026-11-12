import routes from "./routes.js";

export default {
    name: 'rescheduleRequests',
    register: async (server) => {
        server.route(routes);
    },
};
