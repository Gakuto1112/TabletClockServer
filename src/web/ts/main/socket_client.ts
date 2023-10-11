import { MessageData, OPERATION_ID } from "../global/socket_message_type";
import { SOCKET_PORT } from "../global/web_socket";
import { TabletClock } from "../tablet_clock";
import { MessageBox } from "./message_box";

/**
 * ソケットクライアントとのイベントリスナーのイベント型
 */
type SocketClientEvent = "open" | "error" | "close" | "temperature" | "humidity" | "temperature_history" | "humidity_history";

/**
 * ソケットの状態を示す型
 */
type SocketState = "CLOSED" | "CONNECTING" | "CONNECTED";

/**
 * AddEventListener()のeventFunctionのユニオン型
 */
type EventFunctionUnion = (() => void) | ((data: number) => void) | ((data: number[]) => void);

/**
 * Webソケットクライアントを管理するクラス
 */
export class SocketClient {
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
    private readonly eventFunctions: {[key: string]: EventFunctionUnion[]} = {
        open: [],
        error: [],
        close: [],
        temperature: [],
        humidity: [],
        temperature_history: [],
        humidity_history: []
    };

    /**
     * 現在のソケットの状態
     */
    private socketStatus: SocketState = "CLOSED";

    /**
     * コンストラクタ
     * @param parent 親クラスのインスタンス
     */
    constructor(parent: TabletClock) {
        this.parent = parent
    }

    /**
     * 現在のソケットの状態を返す。
     * @returns 現在のソケットの状態
     */
    public getSocketStatus(): SocketState {
        return this.socketStatus;
    }

    /**
     * ソケットクライアントにイベント関数を登録する。
     * @param eventType 登録対象のイベント
     * @param eventFunction 登録対象のイベント関数
     */
    addEventListener(eventType: SocketClientEvent, eventFunction: () => void): void;
    addEventListener(eventType: SocketClientEvent, eventFunction: (data: number) => void): void;
    addEventListener(eventType: SocketClientEvent, eventFunction: (data: number[]) => void): void;
    addEventListener(eventType: SocketClientEvent, eventFunction: EventFunctionUnion): void {
        this.eventFunctions[eventType].push(eventFunction);
    }

    /**
     * Webソケットサーバーに接続を試みる。
     */
    public connect(): void {
        if(this.webSocketClient == undefined) {
            console.info("[SocketClient]: Connecting to the web socket server...");
            this.socketStatus = "CONNECTING";
            this.webSocketClient = new WebSocket(`ws://${location.hostname}:${SOCKET_PORT}`);
            this.webSocketClient.addEventListener("open", () => {
                console.info("[SocketClient]: Connected to the web socket server.");
                this.socketStatus = "CONNECTED";
                this.parent.getMessageBox().addMessageQueue({
                    content: "サーバーに接続しました。",
                    type: "INFO"
                });
                this.eventFunctions.open.forEach((eventFunction: EventFunctionUnion) => (eventFunction as () => void)());
            });
            this.webSocketClient.addEventListener("message", (event: MessageEvent<any>) => {
                try {
                    const eventData: {[key: string]: any} = JSON.parse(event.data);
                    if("id" in eventData && "value" in eventData) {
                        if((eventData as MessageData).id >= 0 && (eventData as MessageData).id < Object.keys(OPERATION_ID).length) {
                            switch((eventData as MessageData).id) {
                                case OPERATION_ID.TEMPERATURE:
                                    //現在の温度データ
                                    this.eventFunctions.temperature.forEach((eventFunction: EventFunctionUnion) => (eventFunction as (data: number) => void)((eventData as MessageData).value as number));
                                    break;
                                case OPERATION_ID.HUMIDITY:
                                    //現在の湿度データ
                                    this.eventFunctions.humidity.forEach((eventFunction: EventFunctionUnion) => (eventFunction as (data: number) => void)((eventData as MessageData).value as number));
                                    break;
                                case OPERATION_ID.TEMPERATURE_HISTORY:
                                    //温度履歴データ
                                    this.eventFunctions.temperature_history.forEach((eventFunction: EventFunctionUnion) => (eventFunction as (data: number[]) => void)((eventData as MessageData).value as number[]));
                                    break;
                                case OPERATION_ID.TEMPERATURE_HISTORY:
                                    //湿度履歴データ
                                    this.eventFunctions.humidity_history.forEach((eventFunction: EventFunctionUnion) => (eventFunction as (data: number[]) => void)((eventData as MessageData).value as number[]));
                                    break;
                            }
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
                this.socketStatus = "CLOSED";
                this.parent.getMessageBox().addMessageQueue({
                    content: "サーバーに接続できませんでした。",
                    type: "ERROR",
                    name: "websocket_connection_error"
                });
                this.eventFunctions.error.forEach((eventFunction: EventFunctionUnion) => (eventFunction as () => void)());
            });
            this.webSocketClient.addEventListener("close", () => {
                console.info("[SocketClient]: Closed web socket.");
                this.socketStatus = "CLOSED";
                const messageBox: MessageBox = this.parent.getMessageBox();
                if(!messageBox.contains("websocket_connection_error")) {
                    if(!messageBox.contains("websocket_connection_closed")) {
                        console.warn("[SocketClient]: Disconnected by the server.");
                        messageBox.addMessageQueue({
                            content: "サーバーとの通信が切断されました。",
                            type: "WARN"
                        });
                    }
                    this.eventFunctions.close.forEach((eventFunction: EventFunctionUnion) => (eventFunction as () => void)());
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
            this.socketStatus = "CLOSED";
            this.parent.getMessageBox().addMessageQueue({
                content: "サーバーとの通信を切断しました。",
                type: "INFO",
                name: "websocket_connection_closed"
            });
        }
        else console.warn("[SocketClient]: Already disconnected from the server.");
    }
}