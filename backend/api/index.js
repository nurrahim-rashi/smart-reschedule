import { createServer, ensureSlots } from "../src/app.js";

// Fungsi serverless Vercel: server Hapi dibuat sekali per instance,
// lalu setiap request diteruskan ke listener Hapi tanpa server.start().
let serverPromise;

const getServer = () => {
    if (!serverPromise) {
        serverPromise = (async () => {
            const server = await createServer();
            await server.initialize();
            await ensureSlots();
            return server;
        })();
    }

    return serverPromise;
};

export default async function handler(req, res) {
    // vercel.json mengirim path asli lewat query __path
    const url = new URL(req.url, 'http://localhost');
    const originalPath = url.searchParams.get('__path');

    if (originalPath !== null) {
        url.searchParams.delete('__path');
        const query = url.searchParams.toString();
        req.url = (originalPath.startsWith('/') ? originalPath : `/${originalPath}`) + (query ? `?${query}` : '');
    }

    const server = await getServer();
    server.listener.emit('request', req, res);
}
