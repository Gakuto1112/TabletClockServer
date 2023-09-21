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
        this.webServer.run();
    }
}

const tabletClockServer: TabletClockServer = new TabletClockServer();
tabletClockServer.main();