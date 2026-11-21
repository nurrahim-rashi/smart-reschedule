import "dotenv/config";
import { createServer, ensureSlots } from "./app.js";

// Menjalankan backend sebagai server biasa (lokal / Railway).
// Di Vercel, entry point-nya api/index.js.
const init = async () => {
    const server = await createServer();
    await ensureSlots();
    await server.start();
    console.log(`Server berjalan di ${server.info.uri}`);
};

init();
