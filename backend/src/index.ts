// signaling-server/src/signaling-server.ts
import { WebSocketServer, WebSocket } from "ws";

const PORT = 3004;

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

const wss = new WebSocketServer({ port: PORT });

interface Message {
    type: string;
    target?: "sender" | "receiver";
    [key: string]: any;
}

wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");

    ws.on("message", (raw) => {
        let message: Message;

        try {
            message = JSON.parse(raw.toString());
        } catch (e) {
            console.error("Invalid JSON received:", raw.toString());
            return;
        }

        // Identify the user
        if (message.type === "sender") {
            senderSocket = ws;
            console.log("Sender connected");
            return;
        }

        if (message.type === "receiver") {
            receiverSocket = ws;
            console.log("Receiver connected");
            return;
        }

        // Forward sign predictions (new)
        if (message.type === "signPrediction") {
            if (message.target === "receiver") {
                receiverSocket?.send(JSON.stringify(message));
            }
            return;
        }

        // Forward transcription messages
        if (message.type === "transcription") {
            if (message.target === "receiver") {
                receiverSocket?.send(JSON.stringify(message));
            } else if (message.target === "sender") {
                senderSocket?.send(JSON.stringify(message));
            }
            return;
        }

        // WebRTC signaling messages
        if (message.target === "receiver") {
            receiverSocket?.send(JSON.stringify(message));
        } else if (message.target === "sender") {
            senderSocket?.send(JSON.stringify(message));
        } else {
            // If unknown target → broadcast to both
            senderSocket?.send(JSON.stringify(message));
            receiverSocket?.send(JSON.stringify(message));
        }
    });

    ws.on("close", () => {
        if (ws === senderSocket) {
            console.log("Sender disconnected");
            senderSocket = null;
        }
        if (ws === receiverSocket) {
            console.log("Receiver disconnected");
            receiverSocket = null;
        }
    });
});

console.log(`Signaling server running on ws://localhost:${PORT}`);
