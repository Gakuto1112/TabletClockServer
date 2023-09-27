import { Clock } from "./clock";
import { CardManager } from "./card_manager";
import { HamburgerMenu } from "./hamburger_menu";

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
     * ハンバーガーメニューのインスタンス
     */
    private hamburgerMenu: HamburgerMenu = new HamburgerMenu();

    /**
     * メイン関数
     */
    public main(): void {
        this.clock.run();
        this.cardManager.run();
        this.hamburgerMenu.run();
    }
}

const tabletClock: TabletClock = new TabletClock();
tabletClock.main();