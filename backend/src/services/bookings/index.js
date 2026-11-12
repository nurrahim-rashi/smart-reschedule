import routes from "./routes.js";

export default {
    name: 'bookings',
    register: async (server) => {
        server.route(routes);
    },
};
