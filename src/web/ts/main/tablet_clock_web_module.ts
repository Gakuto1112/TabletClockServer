import { TabletClock } from "../tablet_clock";
import { WebModule } from "../abstract/web_module";

export abstract class TabletClockWebModule implements WebModule {
    /**
     * タブレットクロックのメインクラス
     */
    private readonly parent: TabletClock;

    /**
     * コンストラクタ
     * @param parent タブレットクロックのメインクラス
     */
    constructor(parent: TabletClock) {
        this.parent = parent;
    }

    /**
     * 実行関数
     */
    public abstract run(): void;
}