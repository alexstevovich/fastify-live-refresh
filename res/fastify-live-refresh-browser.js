// 🔹 Only enable WebSocket if running on localhost
if (window.location.hostname === 'localhost') {
    const SCRIPT_VERSION = 1; // 🔹 Must match the server's version

    const reservedRoute = '/ws-FASTIFY-LIVE-REFRESH-RESERVED-ROUTE';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'; // 🔹 Use `wss` if on HTTPS
    const wsHost = `${wsProtocol}://${window.location.host}${reservedRoute}`; // 🔹 Auto-generate WebSocket URL

    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectInterval = 30000; // 🔹 Maximum wait time between reconnect attempts (30s)
    let stopped = false; // 🔹 Prevents reconnecting if script version is mismatched

    // 🔹 Single log message on initial connection attempt
    console.log('%c DEVELOPER %c Live Refresh: %c Connecting...', 
        'background: orange; color: white; font-weight: bold; padding: 2px 4px;',
        'color: white; font-weight: bold;',
        'color: aqua; font-weight: bold;'
    );

    // 🔹 Function to establish WebSocket connection
    function connectWebSocket() {
        if (stopped) return; // 🔹 Stop if script version mismatch

        socket = new WebSocket(wsHost);

        socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "connection-confirmation") {
                    
                    if (data.scriptVersion !== SCRIPT_VERSION) {
                        console.error(`❌ Live Refresh: Script version mismatch! Expected ${SCRIPT_VERSION}, but server requires ${data.scriptVersion}. Please update the client script.`);
                        stopped = true; // 🔹 Stop reconnect attempts
                        socket.close();
                        return;
                    }
                    else
                    {
                        console.log('%c DEVELOPER %c Live Refresh: %c Connected...', 
                            'background: orange; color: white; font-weight: bold; padding: 2px 4px;',
                            'color: white; font-weight: bold;',
                            'color: lime; font-weight: bold;'
                        );
                    
                    }
                } else if (data.type === "refresh") {
                    console.log('%c DEVELOPER %c Live Refresh: %c Refreshing page...', 
                        'background: orange; color: white; font-weight: bold; padding: 2px 4px;', 
                        'color: white; font-weight: bold;', 
                        'color: purple; font-weight: bold;'
                    );
                    window.location.reload();
                }
            } catch (error) {
                console.error('❌ Live Refresh: Error processing WebSocket message:', error);
            }
        });

        socket.addEventListener('close', () => {
            scheduleReconnect();
        });
    }

    // 🔹 Function to schedule a reconnect attempt
    function scheduleReconnect() {
        if (stopped) return; // 🔹 Stop reconnects on version mismatch

        reconnectAttempts++;
        const delay = Math.min(5000 * reconnectAttempts, maxReconnectInterval); // 🔹 Exponential backoff (caps at 30s)

        setTimeout(() => {
            if (!socket || socket.readyState === WebSocket.CLOSED) {
                connectWebSocket();
            }
        }, delay);
    }

    // 🔹 Initial WebSocket Connection
    connectWebSocket();
}
