import { NetworkInterfaceInfo, networkInterfaces } from "os";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";

/**
 * サーバーのIPアドレス
 * @type {string}
 */
let serverIP: string;

/**
 * ネットワークインターフェースのリスト（サーバーのIPアドレスを取得するために使用）
 * @type {NodeJS.Dict<NetworkInterfaceInfo[]>}
 */
const nets: NodeJS.Dict<NetworkInterfaceInfo[]> = networkInterfaces();
Object.keys(nets).forEach((netName: string) => {
	nets[netName]?.forEach((net: NetworkInterfaceInfo) => {
		const family4Value: string | number = (typeof(net.family) == "string") ? "IPv4" : 4;
		if(net.family == family4Value && !net.internal) serverIP = net.address;
	});
});

/**
 * Webサーバーのインスタンス
 * @type {express.Express}
 */
const webServer: express.Express = express();

webServer.set("view engine", "ejs");
webServer.set("views", process.cwd());
webServer.use(express.static("static"));
webServer.get("/", (request: express.Request, response: express.Response) => response.render("TabletClock.ejs", {serverIP: serverIP}));

webServer.listen(5000, () => console.info("ポート番号5000番でWebサーバーを起動します。"));

/**
 * WebSocketサーバーのインスタンス
 * @type {WebSocket.Server<WebSocket.WebSocket>}
 */
const socketServer: WebSocket.Server<WebSocket.WebSocket> = new WebSocketServer({port: 5200});