import { NetworkInterfaceInfo, networkInterfaces } from "os";
import express from "express";
import { Database } from "./Database";
import { RecordObject } from "./Database";
import { WeatherForecast } from "./WeatherForecast";

export class WebServer {
	/**
	 * Webサーバーのインスタンス
	 * @type {express.Express}
	 */
	private readonly server: express.Express = express();

	/**
	 * 天気予報クラスのインスタンス
	 */
	private readonly weatherForecast: WeatherForecast = new WeatherForecast();

	/**
	 * 現在の室温
	 * @type {number}
	 */
	public currentTemperature: number;

	/**
	 * 現在の湿度
	 * @type {number}
	 */
	public currentHumidity: number;

	/**
	 * サーバー設定と接続
	 * @param {Database} database データベースのインスタンス
	 * @param {number} temperature 現在の室温
	 * @param {number} humidity 現在の湿度
	 */
	public constructor(database: Database, temperature: number, humidity: number) {
		//サーバーの設定
		this.currentTemperature = temperature;
		this.currentHumidity = humidity;
		this.server.set("view engine", "ejs");
		this.server.set("views", process.cwd());
		this.server.use(express.static("static"));
		let serverIP: string;
		const nets: NodeJS.Dict<NetworkInterfaceInfo[]> = networkInterfaces();
		Object.keys(nets).forEach((netName: string) => {
			nets[netName]?.forEach((net: NetworkInterfaceInfo) => {
				const family4Value: string | number = (typeof(net.family) == "string") ? "IPv4" : 4;
				if(net.family == family4Value && !net.internal) {
					serverIP = net.address;
					console.group("[WebServer]: サーバーマシンのローカルUPアドレスを取得しました。");
					console.debug(`IPアドレス：${serverIP}`);
					console.groupEnd();
				}
			});
		});
		this.server.get("/", (request: express.Request, response: express.Response) => {
			response.render("TabletClock.ejs", {serverIP: serverIP, temperature: this.currentTemperature, humidity: this.currentHumidity});
			this.logAccess(request, response);
		});
		this.server.get("/getTempHumidData", (request: express.Request, response: express.Response) => {
			database.getData(request.query.length ? Number(request.query.length) : 0).then((data: RecordObject[] | null) => {
				if(data != null) response.json(data);
				else response.json([]);
			}).catch(() => response.json([]));
			this.logAccess(request, response);
		});
		this.server.get("/getWeatherForecast", (request: express.Request, response: express.Response) => {
			response.json(this.weatherForecast.getWeatherData());
			this.logAccess(request, response);
		});
		this.server.listen(5000, () => console.info("[WebServer]: ポート番号5000番でWebサーバーを起動しました。"));
	}

	/**
	 * アクセスログを標準出力する。
	 * @param {express.Request} request リクエストオブジェクト
	 * @param {express.Response} response レスポンスオブジェクト
	 */
	private logAccess(request: express.Request, response: express.Response) {
		console.group("[WebServer]: クライアントからのリクエストを受信しました。");
		console.debug(`クライアント：${request.hostname}`);
		console.debug(`アドレス：${request.path}`);
		console.debug(`レスポンス：${response.statusCode} ${response.statusMessage}`);
		console.groupEnd();
	}
}