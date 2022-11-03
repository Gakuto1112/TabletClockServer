const userAgent = window.navigator.userAgent;
const isSafari = !userAgent.includes("Chrome") && userAgent.includes("Safari");

//フルスクリーンのトグルボタンのクリックイベント
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

//時計の表示を更新する。
function refreshClock() {
	const dateTime = new Date();
	document.getElementById("clock_area_date_month").innerText = dateTime.getMonth() + 1;
	document.getElementById("clock_area_date_date").innerText = dateTime.getDate();
	const dayName = ["日", "月", "火", "水", "木", "金", "土"];
	document.getElementById("clock_area_date_day").innerText = dayName[dateTime.getDay()];
	document.getElementById("clock_area_time_hour").innerText = dateTime.getHours();
	document.getElementById("clock_area_time_minute").innerText = `0${dateTime.getMinutes()}`.slice(-2);
	console.info("時計が更新されました。");
}

if(isSafari) {
	document.addEventListener("webkitfullscreenchange", () => {
		const toggleFullscreenButton = document.getElementById("toggle_fullscreen")
		if(document.webkitFullscreenElement) toggleFullscreenButton.classList.add("hidden");
		else toggleFullscreenButton.classList.remove("hidden");
	});
}

refreshClock();
let now = new Date();
setTimeout(() => {
	refreshClock();
	setInterval(() => refreshClock(), 60000);
}, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());