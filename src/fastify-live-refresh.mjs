import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptFilePath = path.join(__dirname, '../res/fastify-live-refresh-browser.js'); // 🔹 Path to the client script

export class FastifyLiveRefresh {
    constructor(fastify, options = {}) {
        this.clients = new Set();
        this.scriptVersion = 1; // 🔹 Increment when making breaking changes
        const route = options.route || '/ws-FASTIFY-LIVE-REFRESH-RESERVED-ROUTE';
        const scriptRoute = '/AUTO-INJECTED-BY-FASTIFY-LIVE-REFRESH.js'; // 🔹 URL where the script will be served

        // 🔹 Serve `fastify-live-refresh-browser.js` dynamically when requested
        fastify.get(scriptRoute, async (request, reply) => {
            try {
                const scriptContent = await fs.readFile(scriptFilePath, 'utf-8');
                reply.header('Content-Type', 'application/javascript').send(scriptContent);
            } catch (_error) {
                reply.code(500).send('Error: Could not load fastify-live-refresh-browser.js');
            }
        });

        // 🔹 WebSocket route setup
        fastify.register(async (fastify) => {
            fastify.get(route, { websocket: true }, (socket, _req) => {
                this.clients.add(socket);
                console.log(`✅ Client connected on ${route}`);

                socket.on('message', message => {
                    console.log(`📩 Received:`, message.toString());
                });

                socket.on('close', () => {
                    this.clients.delete(socket);
                    console.log(`❌ Client disconnected from ${route}`);
                });

                socket.on('error', (err) => {
                    console.error(`⚠️ WebSocket error on ${route}:`, err);
                    this.clients.delete(socket);
                    socket.close();
                });

                // 🔹 Send script version on connection
                socket.send(JSON.stringify({
                    type: "connection-confirmation",
                    scriptVersion: this.scriptVersion
                }));
            });
        });

        // 🔹 Middleware to inject the WebSocket script into HTML responses
        fastify.addHook('onSend', (request, reply, payload, done) => {
            if (reply.getHeader('content-type')?.includes('text/html')) {
                // Inject the script reference dynamically
                const scriptTag = `<script src="${scriptRoute}"></script>`;
                payload = payload.toString().replace('</head>', scriptTag + '\n</head>');
            }
            done(null, payload);
        });
    }

    refresh() {
        console.log(`🔄 Refresh triggered for all clients`);
        this.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({ type: "refresh" }));
            } else {
                this.clients.delete(client);
            }
        });
    }
}

export default FastifyLiveRefresh;
