/**
 * デジタル時計を管理するクラス
 */
export class Clock {
    /**
     * 実行関数
     */
    public run(): void {
        const now: Date = new Date();
        console.log(now);
    }
}