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
 * 最初の処理かどうか
 * @type {boolean}
 */
let init = true;

/**
 * 温湿度のデータを取得した最新のデータ
 * @type {string}
 */
let latestTempHumidTime;

/**
 * 現在の天気
 * @type {string | undefined}
 */
let latestWeather;

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
 * 背景を更新する。
 */
function refreshBackground() {
	/**
	 * 背景のグラデーションを設定する。
	 * @param {number} h 色相
	 * @param {number} s 彩度
	 * @param {number} l 明度
	 */
	function setBackground(h, s, l) {
		const backgroundBefore = document.getElementById("background_before");
		if(init) backgroundBefore.style.background = `linear-gradient(hsl(${h}, ${s * 100}%, ${l * 100}%), hsl(${h}, ${s * 100}%, ${Math.min(l + 0.2, 1) * 100}%))`;
		else {
			const backgroundAfter = document.getElementById("background_after");
			backgroundAfter.style.background = `linear-gradient(hsl(${h}, ${s * 100}%, ${l * 100}%), hsl(${h}, ${s * 100}%, ${Math.min(l + 0.2, 1) * 100}%))`;
			backgroundAfter.style.transition = "3s";
			backgroundAfter.style.opacity = "100%";
			backgroundAfter.addEventListener("transitionend", () => {
				backgroundBefore.style.background = `linear-gradient(hsl(${h}, ${s * 100}%, ${l * 100}%), hsl(${h}, ${s * 100}%, ${Math.min(l + 0.2, 1) * 100}%))`;
				backgroundAfter.style.transition = "";
				backgroundAfter.style.opacity = "0%";
			}, {
				once: true
			});
		}
		console.group("背景を更新しました。");
		console.debug(`h：${h}`);
		console.debug(`s：${s}`);
		console.debug(`l：${l}`);
		console.groupEnd();
	}

	const hour = new Date().getHours();
	if(!latestWeather || latestWeather == "sunny" || latestWeather == "partly_cloudy" || latestWeather == "cloudy" || latestWeather == "unknown") {
		if(hour >= 7 && hour <= 16) setBackground(200, 0.97, 0.45);
		else if(hour >= 19 || hour <= 4) setBackground(260, 0.54, 0.45);
		else setBackground(33, 1, 0.49);
	}
	else {
		if(hour >= 6 && hour <= 18) setBackground(0, 0, 0.46);
		else setBackground(200, 0.19, 0.18);
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
	if(!init) {
		const second = dateTime.getSeconds();
		const millisecond = dateTime.getMilliseconds();
		if(second <= 30) console.debug(`誤差：${second * 1000 + millisecond}ms`);
		else console.debug(`誤差：${(second - 60) * 1000 + millisecond}ms`);
	}
	console.groupEnd();
	if(minute == 0 && !init) {
		refreshBackground();
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
			refreshWeatherForecast();
		}, 10000);
	}
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

/**
 * 天気予報を更新する。
 */
function refreshWeatherForecast() {
	/**
	 * 天気コードから天気名を取得する。
	 * @param {number} weatherCode 天気コード
	 * @return {string} 天気アイコンのパス
	 */
	function getWeatherString(weatherCode) {
		switch(weatherCode) {
			case 0:
			case 1:
				return "sunny";
			case 2:
				return "partly_cloudy";
			case 3:
				return "clouldy";
			case 45:
			case 48:
				return "fog";
			case 51:
			case 53:
			case 55:
			case 56:
			case 57:
			case 61:
			case 63:
			case 65:
			case 66:
			case 67:
				return "rain";
			case 71:
			case 73:
			case 75:
			case 77:
				return "snow";
			case 80:
			case 81:
			case 82:
				return "heavy_rain";
			case 85:
			case 86:
				return "snow_rain";
			default:
				return "unknown";
		}
	}

	const weatherForecastInit = init;
	fetch("./getWeatherForecast").then((response) => {
		response.json().then((data) => {
			//document.getElementById("test")
			document.querySelector("#weather_timewind > .weather_time").innerText = `${new Date(data[0].time * 1000).getHours()}:00`;
			document.getElementById("weather_wind_direction").style.rotate = `${data[0].winddirection_10m}deg`;
			document.getElementById("weather_wind_speed").innerText = data[0].windspeed_10m;
			const currentWeather = getWeatherString(data[0].weathercode);
			document.querySelector("#current_weather > .weather_icon").src = `images/weather/${currentWeather}.svg`;
			latestWeather = currentWeather;
			document.getElementById("weather_temperature").innerText = data[0].temperature_2m;
			document.getElementById("weather_humidity").innerText = data[0].relativehumidity_2m;
			document.getElementById("weather_precipitation_value").innerText = data[0].precipitation;
			document.querySelectorAll("#weather_forecast > div > .weather_time").forEach((element, index) => element.innerHTML = new Date(data[index + 1].time * 1000).getHours());
			document.querySelectorAll("#weather_forecast > div > .weather_icon").forEach((element, index) => element.src = `images/weather/${getWeatherString(data[index + 1].weathercode)}.svg`);
			if(weatherForecastInit) document.querySelectorAll(".weather_icon").forEach((element) => element.classList.remove("invisible"));
			console.group("天気予報を更新しました。");
			data.forEach((record) => console.debug(record));
			console.groupEnd();
			refreshBackground();
		});
	});
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
refreshBackground();
if(darkModeInit) document.querySelectorAll(".darkmode").forEach((element) => element.classList.remove("hidden"));
refreshClock();
refreshWeatherForecast();
let now = new Date();
setTimeout(() => {
	refreshClock();
	setInterval(() => refreshClock(), 60000);
}, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());
refreshCanvasSize();
init = false;