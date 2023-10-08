import { MessageBox } from "./main/message_box";
import { Clock } from "./main/clock";
import { Card } from "./main/card";
import { HamburgerMenu } from "./main/hamburger_menu";
import { SocketClient } from "./main/socket_client";

/**
 * タブレットクロックメインクラス
 */
export class TabletClock {
    /**
     * Webソケットクライアントのインスタンス
     */
    private readonly socketClient: SocketClient = new SocketClient(this);

    /**
     * メッセージボックスのインスタンス
     */
    private readonly messageBox: MessageBox = new MessageBox(this);

    /**
     * デジタル時計のインスタンス
     */
    private readonly clock: Clock = new Clock(this);

    /**
     * カードマネージャーのインスタンス
     */
    private readonly cardManager: Card = new Card(this);

    /**
     * ハンバーガーメニューのインスタンス
     */
    private readonly hamburgerMenu: HamburgerMenu = new HamburgerMenu(this);

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
        this.socketClient.connect();
        this.messageBox.run();
        this.clock.run();
        this.cardManager.run();
        this.hamburgerMenu.run();
    }
}

const tabletClock: TabletClock = new TabletClock();
tabletClock.main();