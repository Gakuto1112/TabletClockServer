import { Clock } from "./clock";
import { CardManager } from "./card_manager";

/**
 * タブレットクロックメインクラス
 */
class TabletClock {
    /**
     * デジタル時計のインスタンス
     */
    private clock: Clock = new Clock();

    /**
     * カードマネージャーのインスタンス
     */
    private cardManager: CardManager = new CardManager();

    /**
     * メイン関数
     */
    public main(): void {
        this.clock.run();
        this.cardManager.run();
    }
}

const tabletClock: TabletClock = new TabletClock();
tabletClock.main();