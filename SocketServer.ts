import * as ws from "ws";
import { Logger } from "./Logger";

export class SocketServer {
	/**
	 * WebSocketサーバーのインスタンス
	 * @type {WebSocket.Server<WebSocket.WebSocket>}
	 */
	private readonly server: ws.Server<ws.WebSocket> = new ws.WebSocketServer({port: 5200});

	/**
	 * ロガーのインスタンス
	 * @type {Logger}
	 */
	private readonly logger: Logger = new Logger("SocketServer");

	/**
	 * WebSocketサーバーを起動する。
	 */
	public constructor() {
		this.server.addListener("connection", () => this.logger.info("クライアントと接続しました。"));
		this.logger.info("ポート番号5200番でWebSocketサーバーを起動しました。");
	}

	/**
	 * クライアントにメッセージを送信する。
	 * @param {string} message クライアントに送信するメッセージ
	 */
	public sendMessage(message: string) {
		this.server.clients.forEach((client: ws.WebSocket) => client.send(message));
		this.logger.info("クライアントにメッセージを送信しました。");
		this.logger.groupStart();
		this.logger.debug(`メッセージ：${message}`);
		this.logger.groupEnd();
	}
}