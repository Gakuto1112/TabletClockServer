import { WebSocket, WebSocketServer } from "ws";
import { error, info } from "@gakuto1112/nodejs-logger";
import { MessageData, OPERATION_ID, OperationID } from "../global/socket_message_type";
import { SOCKET_PORT } from "../global/web_socket";

/**
 * Webソケットを管理するクラス
 */
export class SocketServer {
    /**
     * Webソケットサーバーのインスタンス
     */
    private webSocketServer: WebSocketServer | undefined;

    /**
     * クライアントにWebSocketを通じて命令を送信する。
     * @param operationID 送信する命令ID
     * @param value 命令と一緒に送信する値
     */
    private sendSocket(operationID: OperationID, value: any): void {
        this.webSocketServer?.clients.forEach((client: WebSocket) => {
            if(client.readyState == WebSocket.OPEN) client.send(JSON.stringify({id: operationID, value: value} as MessageData));
        });
    }

    /**
     * クライアントに情報メッセージを送信する。クライアントが受信するとメッセージボックスにこれを表示する。
     * @param message 送信するメッセージ
     */
    public sendInfo(message: string): void {
        this.sendSocket(OPERATION_ID.INFO, message);
    }

    /**
     * クライアントに警告メッセージを送信する。クライアントが受信するとメッセージボックスにこれを表示する。
     * @param message 送信するメッセージ
     */
    public sendWarn(message: string): void {
        this.sendSocket(OPERATION_ID.WARN, message);
    }

    /**
     * クライアントにエラーメッセージを送信する。クライアントが受信するとメッセージボックスにこれを表示する。
     * @param message 送信するメッセージ
     */
    public sendError(message: string): void {
        this.sendSocket(OPERATION_ID.ERROR, message);
    }

    /**
     * クライアントに温度データを送信する。クライアントが受信するとクライアントに表示される温度データが更新される。
     * @param data 送信する温度データ
     */
    public sendTemperature(data: number): void {
        this.sendSocket(OPERATION_ID.TEMPERATURE, data);
    }

    /**
     * クライアントに湿度データを送信する。クライアントが受信するとクライアントに表示される湿度データが更新される。
     * @param data 送信する湿度データ
     */
    public sendHumidity(data: number): void {
        this.sendSocket(OPERATION_ID.HUMIDITY, data);
    }

    /**
     * クライアントに温度データの履歴を送信する。クライアントが受信するとクライアントに表示される湿度グラフが更新される。
     */
    public sendTemperatureHistory(data: number[]): void {
        this.sendSocket(OPERATION_ID.TEMPERATURE_HISTORY, data);
    }

    /**
     * クライアントに湿度データの履歴を送信する。クライアントが受信するとクライアントに表示される湿度グラフが更新される。
     */
    public sendHumidityHistory(data: number[]): void {
        this.sendSocket(OPERATION_ID.HUMIDITY_HISTORY, data);
    }

    /**
     * クライアントに明るさデータを送信する。クライアントが受信すると表示モードに応じてライト/ダークモードを切り替える。
     */
    public sendBrightness(data: number): void {
        this.sendSocket(OPERATION_ID.BRIGHTNESS, data);
    }

    /**
     * Webソケットサーバーを実行する。
     */
    public run(): void {
        this.webSocketServer = new WebSocketServer({port: SOCKET_PORT});
        this.webSocketServer.addListener("listening", () => info(`Listening web socket at port ${SOCKET_PORT}.`));
        this.webSocketServer.addListener("connection", () => info("Connected to the web socket client."));
        this.webSocketServer.addListener("close", () => info("Web socket server closed."));
        this.webSocketServer.addListener("error", (err: Error) => error(`${err.message}\n${err.stack}`));
    }
}