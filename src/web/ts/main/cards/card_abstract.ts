import { Card } from "../card";

/**
 * カードの抽象クラス
 */
export abstract class CardAbstract {
    /**
     * カードマネージャー（親クラス）のインスタンス
     */
    protected readonly cardManager: Card;

    /**
     * コンストラクタ
     * @param cardManager カードマネージャーのインスタンス
     */
    constructor(cardManager: Card) {
        this.cardManager = cardManager;
    }

    /**
     * カード実行関数
     */
    public abstract run(): void;
}