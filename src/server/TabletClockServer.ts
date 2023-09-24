import { info, setColoredLog, setLogDebugLevel } from "@gakuto1112/nodejs-logger";
import { WebServer } from "./WebServer";

/**
 * タブレットクロックサーバーのメインクラス
 */
class TabletClockServer {
    /**
     * Webサーバー本体のインスタンス
     */
    private readonly webServer: WebServer = new WebServer();

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