import { WebSocket, WebSocketServer } from "ws";
import { error, info } from "@gakuto1112/nodejs-logger";
import { MessageData, OPERATION_ID, OperationID } from "../global/socket_message_type";

/**
 * Webソケットを管理するクラス
 */
export class SocketServer {
    /**
     * Webソケットサーバーを開けるポート番号。他のサービスやWebサーバーと重複しないように注意する。
     */
    private readonly PORT: number = 5001;

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
    public sendInfo(message: string) {
        this.sendSocket(OPERATION_ID.INFO, message);
    }

    /**
     * クライアントに警告メッセージを送信する。クライアントが受信するとメッセージボックスにこれを表示する。
     * @param message 送信するメッセージ
     */
    public sendWarn(message: string) {
        this.sendSocket(OPERATION_ID.WARN, message);
    }

    /**
     * クライアントにエラーメッセージを送信する。クライアントが受信するとメッセージボックスにこれを表示する。
     * @param message 送信するメッセージ
     */
    public sendError(message: string) {
        this.sendSocket(OPERATION_ID.ERROR, message);
    }

    /**
     * クライアントに温度データを送信する。クライアントが受信するとクライアントに表示される温度データが更新される。
     * @param data 送信する温度データ
     */
    public sendTemperature(data: number) {
        this.sendSocket(OPERATION_ID.TEMPERATURE, data);
    }

    /**
     * クライアントに湿度データを送信する。クライアントが受信するとクライアントに表示される湿度データが更新される。
     * @param data 送信する湿度データ
     */
    public sendHumidity(data: number) {
        this.sendSocket(OPERATION_ID.HUMIDITY, data);
    }

    /**
     * Webソケットサーバーを実行する。
     */
    public run(): void {
        this.webSocketServer = new WebSocketServer({port: this.PORT});
        this.webSocketServer.addListener("listening", () => info(`Listening web socket at port ${this.PORT}.`));
        this.webSocketServer.addListener("connection", () => info("Connected to the web socket client."));
        this.webSocketServer.addListener("close", () => info("Web socket server closed."));
        this.webSocketServer.addListener("error", (err: Error) => error(`${err.message}\n${err.stack}`));
    }
}