import WebSocket, { WebSocketServer } from "ws";

export class SocketServer {
	/**
	 * WebSocketサーバーのインスタンス
	 * @type {WebSocket.Server<WebSocket.WebSocket>}
	 */
	private server: WebSocket.Server<WebSocket.WebSocket> = new WebSocketServer({port: 5200});

	/**
	 * WebSocketサーバーを起動する。
	 */
	constructor() {
		this.server.addListener("connection", () => console.info(`[SocketServer]: （WebSocketサーバー）クライアントと接続しました。`));
		console.info("[SocketServer]: ポート番号5200番でWebSocketサーバーを起動しました。");
	}
}