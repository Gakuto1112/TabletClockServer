import { info, setColoredLog, setLogDebugLevel } from "@gakuto1112/nodejs-logger";
import { WebServer } from "./sub_modules/web_server";
import { Sensors } from "./sub_modules/sensors";

/**
 * タブレットクロックサーバーのメインクラス
 */
export class TabletClockServer {
    /**
     * Webサーバー本体のインスタンス
     */
    private readonly webServer: WebServer = new WebServer(this);

    /**
     * センサークラスのインスタンス
     */
    private readonly sensors: Sensors = new Sensors(this);

    /**
     * メイン関数
     */
    public main(): void {
        setColoredLog(true);
        setLogDebugLevel(true);
        info("System starting...");
        this.sensors.init();
        this.webServer.run();
    }
}

const tabletClockServer: TabletClockServer = new TabletClockServer();
tabletClockServer.main();