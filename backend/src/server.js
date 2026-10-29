import "dotenv/config";
import Hapi from "@hapi/hapi";
import { ClientError } from "./exceptions/index.js";
import users from "./services/users/index.js";
import authentications from "./services/authentications/index.js";

const init = async () => {
    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
    });

    server.route({
        method: 'GET',
        path: '/coba-error',
        handler: () => {
            return { status: 'success', message: 'Gymnasyum API jalan' };
        },
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

    await server.register(users);
    await server.register(authentications);
    await server.start();
    console.log(`Server berjalan di ${server.info.uri}`);
};

init();