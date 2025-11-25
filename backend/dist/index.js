"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// signaling-server/src/signaling-server.ts
const ws_1 = require("ws");
const PORT = 3004;
let senderSocket = null;
let receiverSocket = null;
const wss = new ws_1.WebSocketServer({ port: PORT });
wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (raw) => {
        let message;
        try {
            message = JSON.parse(raw.toString());
        }
        catch (e) {
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
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify(message));
            }
            return;
        }
        // Forward transcription messages
        if (message.type === "transcription") {
            if (message.target === "receiver") {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify(message));
            }
            else if (message.target === "sender") {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify(message));
            }
            return;
        }
        // WebRTC signaling messages
        if (message.target === "receiver") {
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify(message));
        }
        else if (message.target === "sender") {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify(message));
        }
        else {
            // If unknown target → broadcast to both
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify(message));
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify(message));
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
