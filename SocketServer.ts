import WebSocket, { WebSocketServer } from "ws";

export class SocketServer {
	/**
	 * WebSocketサーバーのインスタンス
	 * @type {WebSocket.Server<WebSocket.WebSocket>}
	 */
	private server: WebSocket.Server<WebSocket.WebSocket> | null = null;

	/**
	 * WebSocketサーバーを起動する。
	 */
	public run() {
		this.server = new WebSocketServer({port: 5200});
		this.server.addListener("connection", () => console.info(`（WebSocketサーバー）クライアントと接続しました。`));
		console.info("ポート番号5200番でWebSocketサーバーを起動しました。");
	}
}