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

refreshClock();
let now = new Date();
setTimeout(() => {
	refreshClock();
	setInterval(() => refreshClock(), 60000);
}, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());