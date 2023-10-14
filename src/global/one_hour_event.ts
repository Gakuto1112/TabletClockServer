/**
 * 各時0分0秒に実行されるイベントを管理するクラス
 */
export class OneHourEvent {
    /**
     * イベント関数
     */
    private readonly eventFunctions: (() => void)[] = [];

    /**
     * イベントに関数を登録する。
     * @param eventFunction 登録するイベント関数
     */
    public addEventListener(eventFunction: () => void): void {
        this.eventFunctions.push(eventFunction);
    }

    /**
     * 実行関数
     */
    public run(): void {
        /**
         * 1秒おきに実行される関数
         * @param thisClass このクラスのインスタンス
         */
        function onSeconds(thisClass: OneHourEvent): void {
            const now: Date = new Date();
            setTimeout(() => onSeconds(thisClass), 1000 - now.getMilliseconds());

            if(now.getMinutes() == 0 && now.getSeconds() == 0) {
                thisClass.eventFunctions.forEach((eventFunction: () => void) => eventFunction());
            }

        }

        setTimeout(() => onSeconds(this), 1000 - new Date().getMilliseconds());
    }
}