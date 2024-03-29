import { OneHourEvent } from "./global/one_hour_event";
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
     * 1時間おきに発火するイベントのインスタンス
     */
    private readonly oneHourEvent: OneHourEvent = new OneHourEvent();

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
     * Webソケットクライアントのインスタンスを返す。
     * @returns Webソケットクライアントのインスタンス
     */
    public getSocketClient(): SocketClient {
        return this.socketClient;
    }

    /**
     * 1時間おきに発火するイベントのインスタンスを返す。
     * @returns 1時間おきに発火するイベントのインスタンス
     */
    public getOneHourEvent(): OneHourEvent {
        return this.oneHourEvent;
    }

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
        this.oneHourEvent.run();
        this.messageBox.run();
        this.clock.run();
        this.cardManager.run();
        this.hamburgerMenu.run();
    }
}

const tabletClock: TabletClock = new TabletClock();
tabletClock.main();