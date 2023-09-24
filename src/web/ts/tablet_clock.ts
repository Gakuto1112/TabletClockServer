import { Clock } from "./clock";

/**
 * タブレットクロックメインクラス
 */
class TabletClock {
    /**
     * デジタル時計のインストール
     */
    private clock: Clock = new Clock();

    /**
     * メイン関数
     */
    public main(): void {
        this.clock.run();
    }
}

const tabletClock: TabletClock = new TabletClock();
tabletClock.main();