class Graph {
	/**
	 * グラフの名前
	 * @type {String}
	 */
	#name;
	/**
	 * グラフ描画をするキャンバス
	 * @type {HTMLElement}
	 */
	#targetCanvas;
	/**
	 * グラフを描画するデータの配列
	 * @type {Array}
	 */
	#data = [];
	/**
	 * データの上限と下限
	 * @type {Array}
	 */
	#dataRange = [0, 0];

	/**
	 * 折れ線グラフを描画するクラス
	 * @param {String} name グラフの名前
	 * @param {HTMLElement} canvasToDrawGraph グラフを描画するキャンバス要素
	 */
	constructor(name, canvasToDrawGraph) {
		this.#name = name
		this.#targetCanvas = canvasToDrawGraph;
		console.info(`グラフ「${this.#name}」のインスタンスが作成されました。`);
	}

	/**
	 * データをクリアして新たにデータを設定
	 * @param {Array} data
	 */
	setData(data) {
		this.#data = [];
		data.forEach((record) => this.#data.push(record));
		console.group(`（${this.#name}）データを設定しました。`);
		console.debug(this.#data);
		console.groupEnd();
		this.#analyzeDataRange();
		this.draw();
	}

	/**
	 * データをクリアしてする。
	 */
	clearData() {
		this.#data = [];
		console.info(`（${this.#name}）データを消去しました。`);
		this.#analyzeDataRange();
		this.draw();
	}

	/**
	 * データを分析して、データの範囲を決定する。
	 */
	#analyzeDataRange() {
		if(this.#data.length > 0) {
			this.#dataRange = new Array(2).fill(this.#data[0]);
			this.#data.forEach((record) => {
				if(this.#dataRange[0] < record) this.#dataRange[0] = record;
				if(this.#dataRange[1] > record) this.#dataRange[1] = record;
			});
			this.#dataRange[0] = Math.ceil(this.#dataRange[0] / 10) * 10;
			this.#dataRange[1] = Math.floor(this.#dataRange[1] / 10) * 10;
			console.group(`（${this.#name}）データ描画範囲を更新しました。`);
			console.debug(`上限：${this.#dataRange[0]}`);
			console.debug(`下限：${this.#dataRange[1]}`);
			console.groupEnd();
		}
		else {
			this.#dataRange = [0, 0];
			console.group(`（${this.#name}）データ描画範囲を更新しました。`);
			console.debug("データが存在しないため、初期値にリセットされました。");
			console.groupEnd();
		}
	}

	/**
	 * グラフを描画する
	 */
	draw() {
		const context = this.#targetCanvas.getContext("2d");
		context.clearRect(0, 0, this.#targetCanvas.width, this.#targetCanvas.height);
		if(this.#data.length > 0) {
			context.beginPath();
			this.#data.forEach((record, index) => {
				if(index == 0) context.moveTo(0, this.#targetCanvas.height * ((this.#dataRange[0] - record) / (this.#dataRange[0] - this.#dataRange[1])));
				else context.lineTo(this.#targetCanvas.width * (index / (this.#data.length - 1)), this.#targetCanvas.height * ((this.#dataRange[0] - record) / (this.#dataRange[0] - this.#dataRange[1])));
			});
			context.lineTo(this.#targetCanvas.width, this.#targetCanvas.height);
			context.lineTo(0, this.#targetCanvas.height);
			context.closePath();
			const gradation = context.createLinearGradient(0, 0, 0, this.#targetCanvas.height);
			gradation.addColorStop(0, "rgba(255, 255, 255, 100%)");
			gradation.addColorStop(0.5, "rgba(255, 255, 255, 75%)");
			gradation.addColorStop(1, "rgba(255, 255, 255, 0%)");
			context.fillStyle = gradation;
			context.fill();
		}
		console.info(`（${this.#name}）グラフを描画しました。`);
	}
}