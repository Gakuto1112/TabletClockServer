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
		const reconnectButton = document.getElementById("no_socket");
		reconnectButton.classList.add("invisible");
		this.#socket.addEventListener("open", () => {
			console.info(`${this.#uri}に接続しました。`);
			this.#socket.addEventListener("message", (event) => {
				console.group("ソケットサーバーからメッセージを受信しました。");
				console.info(`メッセージ：${event.data}`);
				console.groupEnd();
				const messageArgs = event.data.split(" ");
				switch(messageArgs[0]) {
					case "updateTemperature":
						document.getElementById("temperature").innerText = messageArgs[1];
						console.group("現在の室温を更新しました。");
						console.debug(`新しい室温：${messageArgs[1]}`);
						console.groupEnd();
						break;
					case "updateHumidity":
						document.getElementById("humidity").innerText = messageArgs[1];
						console.group("現在の湿度を更新しました。");
						console.debug(`新しい湿度：${messageArgs[1]}`);
						console.groupEnd();
						break;
					case "setDarkMode":
						const darkModeElements = document.querySelectorAll(".darkmode");
						if(Number(messageArgs[1]) == 1) {
							darkModeElements.forEach((element) => element.classList.remove("hidden"));
							console.info("ダークモードを有効にしました。");
						}
						else {
							darkModeElements.forEach((element) => element.classList.add("hidden"));
							console.info("ダークモードを無効にしました。");
						}
				}
			});
		});
		this.#socket.addEventListener("error", () => console.error(`${this.#uri}への接続に失敗しました。`));
		this.#socket.addEventListener("close", (event) => {
			reconnectButton.classList.remove("invisible");
			console.group(`${this.#uri}との接続を終了しました。`);
			console.info(`終了コード：${event.code}`);
			console.groupEnd();
		});
	}
}