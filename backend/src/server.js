import "dotenv/config";
import Hapi from "@hapi/hapi";
import { ClientError } from "./exceptions/index.js";
import users from "./services/users/index.js";
import authentications from "./services/authentications/index.js";
import Jwt from '@hapi/jwt';
import timeSlots from "./services/timeSlots/index.js";
import bookings from "./services/bookings/index.js";
import rescheduleRequests from "./services/rescheduleRequests/index.js";

const init = async () => {
    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: () => ({
                status: 'success', 
                message: 'Gymnasyum API jalan', 
        }),
    });

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof ClientError) {
            return h.response({
                status: 'fail',
                message: response.message,
            }).code(response.statusCode);
        }

        if (response.isBoom && response.isServer) {
            console.error(response);
            return h.response({
                status: 'error',
                message: 'Terjadi kesalahan pada server',
            }).code(500);
        }

        return h.continue;
    });

    await server.register(Jwt);

    server.auth.strategy('gymnasyum_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
                role: artifacts.decoded.payload.role,
            },
        }),
    });

    await server.register(users);
    await server.register(authentications);
    await server.register(timeSlots);
    await server.register(bookings);
    await server.register(rescheduleRequests);

    await server.start();
    console.log(`Server berjalan di ${server.info.uri}`);
};

init();