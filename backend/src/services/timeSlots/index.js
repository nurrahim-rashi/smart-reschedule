import routes from "./routes.js";

export default {
    name: 'timeSlots',
    register: async (server) => {
        server.route(routes);
    },
};