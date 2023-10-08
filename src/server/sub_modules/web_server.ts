import fs from "fs";
import express, { Express, Request, Response } from "express";
import { debug, info } from "@gakuto1112/nodejs-logger";
import { SubModule } from "./sub_module";
import { TabletClockServer } from "../tablet_clock_server";

/**
 * Webサーバー本体を管理するクラス
 */
export class WebServer extends SubModule {
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
    constructor(parent: TabletClockServer) {
        super(parent);

        //ルートパスの取得
        Error.prepareStackTrace = (_error: Error, stackTraces: NodeJS.CallSite[]) => {
            const filePath: string | null = stackTraces[2].getFileName();
            if(filePath != null) return filePath;
        };
        Error.stackTraceLimit = 3;
        this.rootPath = ((new Error().stack as string).replace(/\\/g, "/").match(/(.+)\/src\/server\/tablet_clock_server\.ts/) as RegExpMatchArray)[1];
        Error.prepareStackTrace = undefined;
        Error.stackTraceLimit = 10;

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

        //アイコン画像を返す。
        this.app.get("/icons/*", (request: Request, response: Response) => {
            const filePath: string = `${this.rootPath}/src/web/icons/${request.params[0]}`;
            if(fs.existsSync(filePath)) {
                response.type("image/svg+xml");
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