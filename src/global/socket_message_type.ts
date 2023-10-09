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
    HUMIDITY: 4
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

/**
 * Webソケットで使用するポート
 */
export const SOCKET_PORT: number = 50011;