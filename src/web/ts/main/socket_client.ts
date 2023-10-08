import { TabletClock } from "../tablet_clock";
import { MessageBox } from "./message_box";

/**
 * Webソケットを通じて指示される命令ID
 */
const OPERATION_ID = {
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
}

/**
 * Webソケットを通じて指示される命令型
 */
type OperationID = typeof OPERATION_ID[keyof typeof OPERATION_ID];

/**
 * Webソケットで受信されるメッセージデータ型
 */
interface MessageData {
    type: OperationID,
    value: string
}

/**
 * Webソケットクライアントを管理するクラス
 */
export class SocketClient {
    /**
     * 接続先のポート番号
     */
    private readonly TARGET_PORT: number = 5001;

    /**
     * タブレットクロックのメインクラス
     */
    private readonly parent: TabletClock

    private webSocketClient: WebSocket | undefined;

    constructor(parent: TabletClock) {
        this.parent = parent
    }

    /**
     * Webソケットサーバーに接続を試みる。
     */
    public connect(): void {
        console.info("[SocketClient]: Connecting to the web socket server...");
        this.webSocketClient = new WebSocket(`ws://${location.hostname}:${this.TARGET_PORT}`);
        this.webSocketClient.addEventListener("open", () => {
            console.info("[SocketClient]: Connected to the web socket server.");
            this.parent.getMessageBox().addMessageQueue({
                content: "サーバーに接続しました。",
                type: "INFO"
            });
        });
        this.webSocketClient.addEventListener("message", (event: MessageEvent<any>) => {
            try {
                const eventData: {[key: string]: any} = JSON.parse(event.data);
                if("id" in eventData && "value" in eventData && eventData.id >= 0 && eventData.id < Object.keys(OPERATION_ID).length) {
                    console.groupCollapsed("[SocketClient]: Message received.");
                    console.info(`id: ${Object.keys(OPERATION_ID)[eventData.id]}`);
                    console.info(`value: ${eventData.value}`);
                    console.groupEnd();
                }
                else {
                    console.warn("Received invalid message.");
                    console.debug(eventData);
                }
            }
            catch {
                console.warn("Received unknown message.");
            }
        });
        this.webSocketClient.addEventListener("error", () => {
            console.error("[SocketClient]: Failed to connect to the web socket server.")
            this.parent.getMessageBox().addMessageQueue({
                content: "サーバーに接続できませんでした。再度接続ボタンを押して下さい。",
                type: "ERROR",
                name: "websocket_connection_error"
            });
        });
        this.webSocketClient.addEventListener("close", () => {
            console.info("[SocketClient]: Closed web socket.");
            const messageBox: MessageBox = this.parent.getMessageBox();
            if(!messageBox.contains("websocket_connection_error")) {
                messageBox.addMessageQueue({
                    content: "サーバーとの通信が切断されました。再度接続ボタンを押して下さい。",
                    type: "WARN"
                });
            }
        });
    }
}