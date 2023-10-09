import { MessageData, OPERATION_ID } from "../global/socket_message_type";
import { TabletClock } from "../tablet_clock";
import { MessageBox } from "./message_box";

/**
 * ソケットクライアントとのイベントリスナーのイベント型
 */
type SocketClientEvent = "open" | "error" | "close";

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

    /**
     * Webソケットのインスタンス
     */
    private webSocketClient: WebSocket | undefined;

    /**
     * イベント時に実行するコールバック関数
     */
    private readonly eventFunctions: {[key: string]: (() => void)[]} = {
        open: [],
        error: [],
        close: [],
    };

    constructor(parent: TabletClock) {
        this.parent = parent
    }

    /**
     * ソケットクライアントにイベント関数を登録する。
     * @param eventType 登録対象のイベント
     * @param eventFunction 登録対象のイベント関数
     */
    public addEventListener(eventType: SocketClientEvent, eventFunction: () => void): void {
        this.eventFunctions[eventType].push(eventFunction);
    }

    /**
     * Webソケットサーバーに接続を試みる。
     */
    public connect(): void {
        if(this.webSocketClient == undefined) {
            console.info("[SocketClient]: Connecting to the web socket server...");
            this.webSocketClient = new WebSocket(`ws://${location.hostname}:${this.TARGET_PORT}`);
            this.webSocketClient.addEventListener("open", () => {
                console.info("[SocketClient]: Connected to the web socket server.");
                this.parent.getMessageBox().addMessageQueue({
                    content: "サーバーに接続しました。",
                    type: "INFO"
                });
                this.eventFunctions.open.forEach((eventFunction: () => void) => eventFunction());
            });
            this.webSocketClient.addEventListener("message", (event: MessageEvent<any>) => {
                try {
                    const eventData: {[key: string]: any} = JSON.parse(event.data);
                    if("id" in eventData && "value" in eventData) {
                        if((eventData as MessageData).id >= 0 && (eventData as MessageData).id < Object.keys(OPERATION_ID).length) {
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
                console.error("[SocketClient]: Failed to connect to the web socket server.");
                this.parent.getMessageBox().addMessageQueue({
                    content: "サーバーに接続できませんでした。",
                    type: "ERROR",
                    name: "websocket_connection_error"
                });
                this.eventFunctions.error.forEach((eventFunction: () => void) => eventFunction());
            });
            this.webSocketClient.addEventListener("close", () => {
                console.info("[SocketClient]: Closed web socket.");
                const messageBox: MessageBox = this.parent.getMessageBox();
                if(!messageBox.contains("websocket_connection_error")) {
                    if(!messageBox.contains("websocket_connection_closed")) {
                        console.warn("[SocketClient]: Disconnected by the server.");
                        messageBox.addMessageQueue({
                            content: "サーバーとの通信が切断されました。",
                            type: "WARN"
                        });
                    }
                    this.eventFunctions.close.forEach((eventFunction: () => void) => eventFunction());
                }
            });
        }
        else console.warn("[SocketClient]: Already connected or connecting to the server.");
    }

    /**
     * Webソケットサーバーから切断する。
     */
    public close(): void {
        if(this.webSocketClient != undefined) {
            this.webSocketClient.close();
            this.webSocketClient = undefined;
            console.info("Disconnected from the server.");
            this.parent.getMessageBox().addMessageQueue({
                content: "サーバーとの通信を切断しました。",
                type: "INFO",
                name: "websocket_connection_closed"
            });
        }
        else console.warn("[SocketClient]: Already disconnected from the server.");
    }
}