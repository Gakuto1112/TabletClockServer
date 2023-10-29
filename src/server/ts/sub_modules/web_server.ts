import fs from "fs";
import express, { Express, Request, Response, request } from "express";
import { debug, info } from "@gakuto1112/nodejs-logger";
import { JsonResponse } from "../global/response_data";
import { SubModule } from "./sub_module";
import { TabletClockServer } from "../tablet_clock_server";
import { SocketServer } from "./socket_server";

/**
 * Webサーバー本体を管理するクラス
 */
export class WebServer extends SubModule {
    /**
     * Webサーバーを開けるポート番号。他のサービスやWebソケットと重複しないように注意する。
     */
    private readonly PORT: number = 5000;

    /**
     * サーバーアプリケーションのインスタンス
     */
    private readonly app: Express = express();

    /**
     * Webソケットサーバーのインスタンス
     */
    private readonly socketServer: SocketServer = new SocketServer();

    /**
     * プログラムのルートパス
     */
    private rootPath: string = "";

    /**
     * コンストラクタ
     */
    constructor(parent: TabletClockServer) {
        super(parent);

        //ルートパスの取得
        this.rootPath = this.parent.getRootPath();

        //サーバールーティングの設定
        //時計画面
        this.app.get("/", (request: Request, response: Response) => {
            response.type("html");
            response.sendFile("./src/web/html/tablet_clock.html", {root: this.rootPath});
            this.logHttpRequest(request, response);
        });

        //javascriptを返す。
        this.app.get("/js/*", (request: Request, response: Response) => {
            const filePath: string = `${this.rootPath}/src/web/js/${request.params[0]}.js`;
            if(fs.existsSync(filePath)) {
                response.type("text/javascript");
                response.sendFile(filePath);
                this.logHttpRequest(request, response);
            }
            else {
                response.status(404);
                response.end();
            }
            this.logHttpRequest(request, response);
        });

        //stylesheetを返す。
        this.app.get("/css/*", (request: Request, response: Response) => {
            const filePath: string = `${this.rootPath}/src/web/css/${request.params[0]}.css`;
            if(fs.existsSync(filePath)) {
                response.type("text/css");
                response.sendFile(filePath);
            }
            else {
                response.status(404);
                response.end();
            }
            this.logHttpRequest(request, response);
        });

        //アイコン画像を返す。
        this.app.get("/icons/*", (request: Request, response: Response) => {
            const filePath: string = `${this.rootPath}/src/web/icons/${request.params[0]}`;
            if(fs.existsSync(filePath)) {
                response.type("image/svg+xml");
                response.sendFile(filePath);
            }
            else {
                response.status(404);
                response.end();
            }
            this.logHttpRequest(request, response);
        });

        //API
        //現在の温度を取得
        this.app.get("/api/get_current_temperature", (request: Request, response: Response) => {
            response.type("application/json");
            response.send({value: this.parent.getSensors().getCurrentTemperature()} as JsonResponse);
            this.logHttpRequest(request, response);
        });

        //現在の湿度を取得
        this.app.get("/api/get_current_humidity", (request: Request, response: Response) => {
            response.type("application/json");
            response.send({value: this.parent.getSensors().getCurrentHumidity()} as JsonResponse);
            this.logHttpRequest(request, response);
        });

        //温度履歴を取得
        this.app.get("/api/get_temperature_history", (request: Request, response: Response) => {
            response.type("application/json");
            response.send({value: this.parent.getSensors().getTemperatureHistory()} as JsonResponse);
            this.logHttpRequest(request, response);
        });

        //湿度履歴を取得
        this.app.get("/api/get_humidity_history", (request: Request, response: Response) => {
            response.type("application/json");
            response.send({value: this.parent.getSensors().getHumidityHistory()} as JsonResponse);
            this.logHttpRequest(request, response);
        });

        //明るさを取得
        this.app.get("/api/get_brightness", (request: Request, response: Response) => {
            response.type("application/json");
            response.send({value: this.parent.getSensors().getBrightness()} as JsonResponse);
            this.logHttpRequest(request, response);
        });
    }

    /**
     * サーバーが受信したhttpリクエストのログを出力する。
     * @param request httpリクエスト
     * @param response httpレスポンス
     */
    private logHttpRequest(request: Request, response: Response): void {
        debug(`${request.url} -> ${response.statusCode < 400 ? "\u001b[32m" : "\u001b[31m"}${response.statusCode}\u001b[0m`);
    }

    /**
     * Webソケットサーバーのインスタンスを返す。
     * @returns Webソケットサーバーのインスタンス
     */
    public getSocketServer(): SocketServer {
        return this.socketServer;
    }

    /**
     * 実行関数
     */
    public run(): void {
        this.app.listen(this.PORT);
        info(`Listening http requests at port ${this.PORT}.`);
        this.socketServer.run();
    }
}