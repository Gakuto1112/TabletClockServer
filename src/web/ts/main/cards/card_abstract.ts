import { JsonResponse } from "../../global/response_data";
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
     * WebサーバーからAPIを通じたデータを取得する。
     * @param apiName APIの名前（"http://localhost:5000/api/**"の"**"の部分）
     * @returns
     */
    protected async getApiData(apiName: string): Promise<number | number[] | undefined> {
        try {
            return ((await (await fetch(`./api/${apiName}`)).json()) as JsonResponse).value;
        }
        catch {
            console.error(`Failed to get API "${apiName}".`);
        }
    }

    /**
     * カード実行関数
     */
    public abstract run(): void;
}