import { info, setColoredLog, setLogDebugLevel } from "@gakuto1112/nodejs-logger";
import { WebServer } from "./sub_modules/web_server";

/**
 * タブレットクロックサーバーのメインクラス
 */
export class TabletClockServer {
    /**
     * Webサーバー本体のインスタンス
     */
    private readonly webServer: WebServer = new WebServer(this);

    /**
     * メイン関数
     */
    public main(): void {
        setColoredLog(true);
        setLogDebugLevel(true);
        info("System starting...");
        this.webServer.run();
    }
}

const tabletClockServer: TabletClockServer = new TabletClockServer();
tabletClockServer.main();