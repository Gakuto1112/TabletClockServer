/**
 * Webソケットを通じて指示される命令ID
 */
export const OPERATION_ID = {
    /** 情報メッセージ送信 */
    INFO: 0,
    /** 警告メッセージ送信 */
    WARN: 1,
    /** エラーメッセージ送信 */
    ERROR: 2,
    /** 温度データ送信 */
    TEMPERATURE: 3,
    /** 湿度データ送信 */
    HUMIDITY: 4,
    /** 温度履歴データ送信 */
    TEMPERATURE_HISTORY: 5,
    /** 湿度履歴データ送信 */
    HUMIDITY_HISTORY: 6
} as const;

/**
 * Webソケットを通じて指示される命令型
 */
export type OperationID = typeof OPERATION_ID[keyof typeof OPERATION_ID];

/**
 * Webソケットで受信されるメッセージデータ型
 */
export interface MessageData {
    id: OperationID,
    value: any
}