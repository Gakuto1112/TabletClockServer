/**
 * デジタル時計を管理するクラス
 */
export class Clock {
    /**
     * 実行関数
     */
    public run(): void {
        /**
         * 時計を更新する。setTimeout()でこの関数は再帰的に呼ばれる。
         */
        function updateClock() {
            const now: Date = new Date();
            setTimeout(updateClock, 1000 - now.getMilliseconds());

            const monthElement: HTMLSpanElement = (document.getElementById("clock_month") as HTMLSpanElement);
            const monthName: string = new Intl.DateTimeFormat("en-US", {month: "short"}).format(now);
            if(monthElement.innerText.slice(0, -1) != monthName) monthElement.innerText = `${monthName}.`;
            const dayElement: HTMLSpanElement = (document.getElementById("clock_day") as HTMLSpanElement);
            const day: number = now.getDate();
            if(Number(dayElement.innerText.slice(0, -2)) != day) {
                const firstDigit: number = day % 10;
                dayElement.innerText = `${day}${firstDigit == 0 || firstDigit >= 4 || Math.floor(day / 10) == 1 ? "th" : (firstDigit == 1 ? "st" : (firstDigit == 2 ? "nd" : "rd"))}`;
                (document.getElementById("clock_weekday") as HTMLSpanElement).innerText = `${new Intl.DateTimeFormat("en-US", {weekday: "short"}).format(now)}.`;
            }
            const hourElement: HTMLSpanElement = (document.getElementById("clock_hour") as HTMLSpanElement);
            const hour = now.getHours();
            if(Number(hourElement.innerText) != hour) hourElement.innerText = hour.toString();
            const minuteElement: HTMLSpanElement = (document.getElementById("clock_minute") as HTMLSpanElement);
            const minute: number = now.getMinutes();
            if(Number(minuteElement.innerText) != minute) minuteElement.innerText = `0${minute.toString()}`.slice(-2);

            const dotElement: HTMLSpanElement = (document.getElementById("clock_dot") as HTMLSpanElement);
            if(now.getSeconds() % 2 == 0) dotElement.classList.add("clock_blink_animation");
            else dotElement.classList.remove("clock_blink_animation");
        }

        setTimeout(updateClock, 1000 - new Date().getMilliseconds());
    }
}