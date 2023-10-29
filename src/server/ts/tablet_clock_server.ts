import { info, setColoredLog, setLogDebugLevel, setRootPath } from "@gakuto1112/nodejs-logger";
import { OneHourEvent } from "./global/one_hour_event";
import { WebServer } from "./sub_modules/web_server";
import { Sensors } from "./sub_modules/sensors";

/**
 * タブレットクロックサーバーのメインクラス
 */
export class TabletClockServer {
    /**
     * 1時間おきに発火するイベントのインスタンス
     */
    private readonly oneHourEvent: OneHourEvent = new OneHourEvent();

    /**
     * Webサーバー本体のインスタンス
     */
    private readonly webServer: WebServer = new WebServer(this);

    /**
     * センサークラスのインスタンス
     */
    private readonly sensors: Sensors = new Sensors(this);

    /**
     * 1時間おきに発火するイベントのインスタンスを返す。
     * @returns 1時間おきに発火するイベントのインスタンス
     */
    public getOneHourEvent(): OneHourEvent {
        return this.oneHourEvent;
    }

    /**
     * Webサーバーのインスタンスを返す。
     * @returns Webサーバーのインスタンス
     */
    public getWebServer(): WebServer {
        return this.webServer;
    }

    /**
     * センサークラスのインスタンスを返す。
     * @returns センサークラスのインスタンス
     */
    public getSensors(): Sensors {
        return this.sensors;
    }

    /**
     * 実行ファイルのルートパスを取得する。
     */
    public getRootPath(): string {
        return (__dirname.replace(/\\/g, "/").match(/(.+)\/src\/server\/[jt]s/) as RegExpMatchArray)[1];
    }

    /**
     * メイン関数
     */
    public main(): void {
        setRootPath(`${this.getRootPath()}/src`);
        setColoredLog(true);
        info("System starting...");
        this.getOneHourEvent().run();
        this.webServer.run();
        this.sensors.init();
        info("System started!");
    }
}

//引数の確認
process.argv.forEach((arg: string, i: number) => {
    if(arg == "-d") setLogDebugLevel(true);
});

const tabletClockServer: TabletClockServer = new TabletClockServer();
tabletClockServer.main();