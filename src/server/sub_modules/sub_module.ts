import { TabletClockServer } from "../tablet_clock_server";

export abstract class SubModule {
    /**
     * メインモジュールのインスタンス
     */
    protected readonly parent: TabletClockServer;

    /**
     * コンストラクタ
     * @param parent タブレットクロックのメインクラス
     */
    constructor(parent: TabletClockServer) {
        this.parent = parent;
    }
}