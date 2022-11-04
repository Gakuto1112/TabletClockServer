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
	public constructor() {
		this.server.addListener("connection", () => console.info(`[SocketServer]: （WebSocketサーバー）クライアントと接続しました。`));
		console.info("[SocketServer]: ポート番号5200番でWebSocketサーバーを起動しました。");
	}

	/**
	 * クライアントにメッセージを送信する。
	 * @param {string} message クライアントに送信するメッセージ
	 */
	public sendMessage(message: string) {
		this.server.clients.forEach((client: WebSocket.WebSocket) => {
			client.send(message);
		});
		console.group("[SocketServer]: クライアントにメッセージを送信しました。");
		console.debug(`メッセージ：${message}`);
		console.groupEnd();
	}
}