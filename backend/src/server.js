import 'dotenv/config';
import Hapi from '@hapi/hapi';

const init = async () => {
    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: () => {
            return { status: 'success', message: 'Gymnasyum API jalan' };
        },
    });

    await server.start();
    console.log(`Server berjalan di ${server.info.uri}`);
};

init();