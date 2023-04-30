class Graph {
	/**
	 * グラフの名前
	 * @type {string}
	 */
	#name;
	/**
	 * グラフ描画をするキャンバス
	 * @type {HTMLElement}
	 */
	#targetCanvas;
	/**
	 * グラフを描画するデータの配列
	 * @type {Array<number>}
	 */
	#data = [];
	/**
	 * 現在のデータ（センサーで取得し続けるデータ）
	 * @type {number|null}
	 */
	#currentData = null;
	/**
	 * データの上限と下限
	 * @type {Array<number>}
	 */
	#dataRange = [0, 0];
	/**
	 * グラフの上限と下限のオフセット
	 * @type {number}
	 */
	#rangeOffset = 0;

	/**
	 * 折れ線グラフを描画するクラス
	 * @param {string} name グラフの名前
	 * @param {HTMLElement} canvasToDrawGraph グラフを描画するキャンバス要素
	 * @param {number} rangeOffset グラフの上限と下限の範囲のオフセット
	 */
	constructor(name, canvasToDrawGraph, rangeOffset) {
		this.#name = name
		this.#targetCanvas = canvasToDrawGraph;
		this.#rangeOffset = rangeOffset;
		console.info(`グラフ「${this.#name}」のインスタンスが作成されました。`);
	}

	/**
	 * データをクリアして新たにデータを設定
	 * @param {Array} data 設定するデータ群
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
	 * 最古のデータを1件削除して、新たに最新のデータを挿入する。
	 * @param {number} data 新しいデータ
	 */
	swapData(data) {
		console.group(`（${this.#name}）データを入れ替えました。`);
		console.debug(`削除したデータ：${this.#data[0]}`);
		console.debug(`挿入したデータ：${data}`);
		console.groupEnd();
		this.#data.shift();
		this.#data.push(data);
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
	 * 現在のデータを更新する。（センサーで取得し続けるデータ）
	 * @param {number} 新しいデータ
	 */
	setCurrentData(currentData) {
		this.#currentData = currentData;
		this.#analyzeDataRange();
		this.draw();
	}

	/**
	 * データを分析して、データの範囲を決定する。
	 */
	#analyzeDataRange() {
		if(this.#data.length > 0 || this.#currentData) {
			this.#dataRange = new Array(2).fill(this.#data[0]);
			this.#data.forEach((record) => {
				if(this.#dataRange[0] < record) this.#dataRange[0] = record;
				else if(this.#dataRange[1] > record) this.#dataRange[1] = record;
			});
			if(this.#currentData) {
				if(this.#dataRange[0] < this.#currentData) this.#dataRange[0] = this.#currentData;
				else if(this.#dataRange[1] > this.#currentData) this.#dataRange[1] = this.#currentData;
			}
			this.#dataRange[0] = Math.ceil(this.#dataRange[0]) + this.#rangeOffset;
			this.#dataRange[1] = Math.floor(this.#dataRange[1]) - this.#rangeOffset;
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
			if(this.#currentData) {
				context.beginPath();
				context.moveTo(0, this.#targetCanvas.height * ((this.#dataRange[0] - this.#currentData) / (this.#dataRange[0] - this.#dataRange[1])));
				context.lineTo(this.#targetCanvas.width, this.#targetCanvas.height * ((this.#dataRange[0] - this.#currentData) / (this.#dataRange[0] - this.#dataRange[1])));
				context.strokeStyle = "white";
				context.lineWidth = 2;
				context.stroke();
			}
		}
		console.info(`（${this.#name}）グラフを描画しました。`);
	}
}