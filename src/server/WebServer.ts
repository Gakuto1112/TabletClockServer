import fs from "fs";
import express, { Express, Request, Response } from "express";
import { debug, info } from "@gakuto1112/nodejs-logger";

/**
 * Webサーバー本体を管理するクラス
 */
export class WebServer {
    /**
     * サーバーアプリケーションのインスタンス
     */
    private readonly app: Express = express();

    /**
     * プログラムのルートパス
     */
    private rootPath: string = "";

    /**
     * コンストラクタ
     */
    constructor() {
        //ルートパスの取得
        this.rootPath = ((new Error().stack as string).split("\n")[1].replace(/\\/g, "/").match(/\((.+)\/src\/server\/WebServer\.ts:\d+:\d+\)/) as RegExpMatchArray)[1];

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
                this.logHttpRequest(request, response);
            }
        });

        //stylesheetを返す。
        this.app.get("/css/*", (request: Request, response: Response) => {
            const filePath: string = `${this.rootPath}/src/web/css/${request.params[0]}.css`;
            if(fs.existsSync(filePath)) {
                response.type("text/css");
                response.sendFile(filePath);
                this.logHttpRequest(request, response);
            }
            else {
                response.status(404);
                response.end();
                this.logHttpRequest(request, response);
            }
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
     * 実行関数
     */
    public run(): void {
        this.app.listen(5000);
        info("Listening http requests at port 5000.");
    }
}