const userAgent = window.navigator.userAgent;
/**
 * ブラウザがSafariならtrue、そうでなければfalse
 * @type {boolean}
 */
const isSafari = !userAgent.includes("Chrome") && userAgent.includes("Safari");

/**
 * WebSocketクライアントのインスタンス
 * @type {SocketClient}
 */
const socketClient = new SocketClient(`ws://${serverIP}:5200`);

/**
 * グラフのインスタンスを格納する配列
 * @type {Array}
 */
const graph = [new Graph("温度", document.querySelector("#temperature_area > canvas")), new Graph("湿度", document.querySelector("#humidity_area > canvas"))];

/**
 * 時計の更新の処理が最初の処理かどうか
 * @type {boolean}
 */
let initClock = true;

/**
 * 温湿度のデータを取得した最新のデータ
 * @type {string}
 */
let latestTempHumidTime;

/**
 * フルスクリーンのトグルボタンのクリックされた時に発火するイベント
 */
function onToggleFullscreenButtonClick() {
	if(isSafari) {
		if(document.webkitFullscreenElement) document.exitFullscreen();
		else document.body.webkitRequestFullscreen();
	}
	else {
		if(document.fullscreenElement) document.exitFullscreen();
		else document.body.requestFullscreen();
	}
}

/**
 * 時計の表示を更新する。
 */
function refreshClock() {
	const dateTime = new Date();
	const month = dateTime.getMonth() + 1;
	const date = dateTime.getDate();
	const dayName = ["日", "月", "火", "水", "木", "金", "土"];
	const day = dayName[dateTime.getDay()];
	const hour = dateTime.getHours();
	const minute = `0${dateTime.getMinutes()}`.slice(-2);
	document.getElementById("date_month").innerText = month;
	document.getElementById("date_date").innerText = date;
	document.getElementById("date_day").innerText = day;
	document.getElementById("time_hour").innerText = hour;
	document.getElementById("time_minute").innerText = minute;
	console.group("時計が更新されました。");
	console.debug(`日付：${month}月${date}日（${day}）`);
	console.debug(`時刻：${hour}：${minute}`);
	if(!initClock) {
		const second = dateTime.getSeconds();
		const millisecond = dateTime.getMilliseconds();
		if(second <= 30) console.debug(`誤差：${second * 1000 + millisecond}ms`);
		else console.debug(`誤差：${(second - 60) * 1000 + millisecond}ms`);
	}
	console.groupEnd();
	if(minute == 0 && !initClock) {
		setTimeout(() => {
			fetch("./getTempHumidData?length=1").then((response) => {
				response.json().then((data) => {
					if(data.length == 1) {
						if(data[0].date != latestTempHumidTime) {
							graph[0].swapData(data[0].temperature);
							graph[1].swapData(data[0].humidity);
							latestTempHumidTime = data[0].date;
						}
					}
				});
			});
		}, 1000);
	}
	if(initClock) initClock = false;
}

/**
 * グラフのキャンバスの大きさを更新する。
 */
function refreshCanvasSize() {
	const graphCanvas = document.querySelectorAll(".graph > canvas");
	Array.prototype.forEach.call(graphCanvas, (element) => {
		element.width = 0;
		element.height = 0;
	});
	const temperatureHumidityPanels = document.getElementById("temperature_humidity_panel");
	const canvasSize = [temperatureHumidityPanels.clientWidth - 20, temperatureHumidityPanels.clientHeight / 2 - 14];
	Array.prototype.forEach.call(graphCanvas, (element) => {
		element.width = canvasSize[0];
		element.height = canvasSize[1];
	});
	graph.forEach((element) => element.draw());
	console.group("グラフサイズが更新されました。");
	console.debug(`縦：${canvasSize[0]}px`);
	console.debug(`横：${canvasSize[1]}px`);
	console.groupEnd();
}

if(isSafari) {
	document.addEventListener("webkitfullscreenchange", () => {
		const toggleFullscreenButton = document.getElementById("toggle_fullscreen")
		if(document.webkitFullscreenElement) toggleFullscreenButton.classList.add("hidden");
		else toggleFullscreenButton.classList.remove("hidden");
	});
}

window.addEventListener("resize", () => refreshCanvasSize());

fetch("./getTempHumidData?length=24").then((response) => {
	response.json().then((data) => {
		const temperatureData = new Array(24 - data.length).fill(0);
		const humidityData = new Array(24 - data.length).fill(0);
		data.reverse().forEach((record, index) => {
			if(index == data.length - 1) latestTempHumidTime = record.date;
			temperatureData.push(record.temperature);
			humidityData.push(record.humidity);
		});
		graph[0].setData(temperatureData);
		graph[1].setData(humidityData);
	});
});

socketClient.connect();
refreshClock();
let now = new Date();
setTimeout(() => {
	refreshClock();
	setInterval(() => refreshClock(), 60000);
}, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());
refreshCanvasSize();