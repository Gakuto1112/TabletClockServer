import fs from "fs";
import express, { Express, Request, Response } from "express";

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
        this.app.get("/", (_request: Request, response: Response) => {
            response.type("html");
            response.sendFile("./src/web/html/tablet_clock.html", {root: this.rootPath});
        });
        this.app.get("/js/*", (request: Request, response: Response) => {
            const filePath: string = `${this.rootPath}/src/web/js/${request.params[0]}.js`;
            if(fs.existsSync(filePath)) {
                response.type("text/javascript");
                response.sendFile(filePath);
            }
            else {
                response.status(404);
                response.end();
            }
        });

        //javascriptを返す。
        this.app.get("/js/*", (request: Request, response: Response) => {
            const filePath: string = `${this.rootPath}/src/web/js/${request.params[0]}.js`;
            if(fs.existsSync(filePath)) {
                response.type("text/javascript");
                response.sendFile(filePath);
            }
            else {
                response.status(404);
                response.end();
            }
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
        });
    }

    /**
     * 実行関数
     */
    public run(): void {
        this.app.listen(5000);
        console.info("Listening http request at port 5000...");
    }
}