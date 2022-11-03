import { NetworkInterfaceInfo, networkInterfaces } from "os";
import express from "express";

export class WebServer {
	/**
	 * Webサーバーのインスタンス
	 * @type {express.Express}
	 */
	private readonly server: express.Express = express();

	constructor() {
		//サーバーの設定
		this.server.set("view engine", "ejs");
		this.server.set("views", process.cwd());
		this.server.use(express.static("static"));
		let serverIP: string;
		const nets: NodeJS.Dict<NetworkInterfaceInfo[]> = networkInterfaces();
		Object.keys(nets).forEach((netName: string) => {
			nets[netName]?.forEach((net: NetworkInterfaceInfo) => {
			const family4Value: string | number = (typeof(net.family) == "string") ? "IPv4" : 4;
			if(net.family == family4Value && !net.internal) serverIP = net.address;
			});
		});
		this.server.get("/", (request: express.Request, response: express.Response) => response.render("TabletClock.ejs", {serverIP: serverIP}));
	}

	/**
	 * Webサーバーを起動する。
	 */
	public run() {
		this.server.listen(5000, () => console.info("ポート番号5000番でWebサーバーを起動します。"));
	}
}