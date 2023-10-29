import { info, setColoredLog, setRootPath } from "@gakuto1112/nodejs-logger";
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
        Error.prepareStackTrace = (_error: Error, stackTraces: NodeJS.CallSite[]) => {
            const filePath: string | undefined = stackTraces[2].getFileName();
            if(filePath != null) return filePath;
        };
        Error.stackTraceLimit = 3;
        const result: string = ((new Error().stack as string).replace(/\\/g, "/").match(/(.+)\/src\/server\/[jt]s\/tablet_clock_server\.[jt]s/) as RegExpMatchArray)[1];
        Error.prepareStackTrace = undefined;
        Error.stackTraceLimit = 10;
        return result;
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

const tabletClockServer: TabletClockServer = new TabletClockServer();
tabletClockServer.main();