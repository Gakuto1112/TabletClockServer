class SocketClient {
	/**
	 * WebSocketの接続先
	 * @type {string}
	 */
	#uri;
	/**
	 * WebSocketのインスタンス
	 */
	#socket;

	/**
	 * Socketサーバーと通信を行うクラス
	 * @param {string} uri WebSocketの接続先
	 */
	constructor(uri) {
		this.#uri = uri;
		console.group("ソケットサーバーのインスタンスが作成されました。");
		console.info(`URI：${this.#uri}`);
		console.groupEnd();
	}

	/**
	 * WebSocketサーバーに接続する
	 */
	connect() {
		console.info("ソケットサーバーに接続中です。");
		this.#socket = new WebSocket(this.#uri);
		this.#socket.addEventListener("open", () => {
			console.info(`${this.#uri}に接続しました。`);
			this.#socket.addEventListener("message", (event) => {
				console.group("ソケットサーバーからメッセージを受信しました。");
				console.info(`メッセージ：${event.data}`);
				console.groupEnd();
			});
		});
		this.#socket.addEventListener("error", () => console.error(`${this.#uri}への接続に失敗しました。`));
		this.#socket.addEventListener("close", (event) => {
			console.group(`${this.#uri}との接続を終了しました。`);
			console.info(`終了コード：${event.code}`);
			console.groupEnd();
		});
	}
}