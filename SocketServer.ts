import WebSocket, { WebSocketServer } from "ws";

/**
 * WebSocketサーバーのインスタンス
 * @type {WebSocket.Server<WebSocket.WebSocket>}
 */
let socketServer: WebSocket.Server<WebSocket.WebSocket>;

export function runSocketServer() {
	socketServer = new WebSocketServer({port: 5200});
}