import { MessageBox } from "./main/message_box";
import { Clock } from "./main/clock";
import { Card } from "./main/card";
import { HamburgerMenu } from "./main/hamburger_menu";

/**
 * タブレットクロックメインクラス
 */
export class TabletClock {
    /**
     * メッセージボックスのインスタンス
     */
    private messageBox: MessageBox = new MessageBox(this);

    /**
     * デジタル時計のインスタンス
     */
    private clock: Clock = new Clock(this);

    /**
     * カードマネージャーのインスタンス
     */
    private cardManager: Card = new Card(this);

    /**
     * ハンバーガーメニューのインスタンス
     */
    private hamburgerMenu: HamburgerMenu = new HamburgerMenu(this);

    /**
     * メッセージボックスのインスタンスを返す。
     * @returns メッセージボックスのインスタンス
     */
    public getMessageBox(): MessageBox {
        return this.messageBox;
    }

    /**
     * メイン関数
     */
    public main(): void {
        this.messageBox.run();
        this.clock.run();
        this.cardManager.run();
        this.hamburgerMenu.run();
    }
}

const tabletClock: TabletClock = new TabletClock();
tabletClock.main();