import { info, setColoredLog, setLogDebugLevel } from "@gakuto1112/nodejs-logger";
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
     * メイン関数
     */
    public main(): void {
        setColoredLog(true);
        setLogDebugLevel(true);
        info("System starting...");
        this.getOneHourEvent().run();
        this.webServer.run();
        this.sensors.init();
        info("System started!");
    }
}

const tabletClockServer: TabletClockServer = new TabletClockServer();
tabletClockServer.main();