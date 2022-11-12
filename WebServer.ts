import { NetworkInterfaceInfo, networkInterfaces } from "os";
import * as express from "express";
import { Database } from "./Database";
import { RecordObject } from "./Database";
import { WeatherForecast } from "./WeatherForecast";
import { GoogleCalendar } from "./GoogleCalendar";
import { Logger } from "./Logger";

export class WebServer {
	/**
	 * Webサーバーのインスタンス
	 * @type {express.Express}
	 */
	private readonly server: express.Express = express();

	/**
	 * ロガーのインスタンス
	 * @type {Logger}
	 */
	private readonly logger: Logger = new Logger("WebServer");

	/**
	 * 天気予報クラスのインスタンス
	 */
	private readonly weatherForecast: WeatherForecast = new WeatherForecast();

	/**
	 * Googleカレンダーのインスタンス
	 */
	private readonly schedule: GoogleCalendar = new GoogleCalendar();

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
	 * ダークモードかどうか
	 * @type {boolean}
	 */
	public isDarkMode: boolean = false;

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
		this.schedule.setCalendarTask();
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
					this.logger.info("サーバーマシンのローカルUPアドレスを取得しました。");
					this.logger.groupStart();
					this.logger.debug(`IPアドレス：${serverIP}`);
					this.logger.groupEnd();
				}
			});
		});
		this.server.get("/", (request: express.Request, response: express.Response) => {
			response.render("TabletClock.ejs", {serverIP: serverIP, darkMode: this.isDarkMode, temperature: this.currentTemperature, humidity: this.currentHumidity});
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
		this.server.get("/getSchedule", (request: express.Request, response: express.Response) => {
			response.json(this.schedule.getScheduleData());
			this.logAccess(request, response);
		});
		this.server.listen(5000, () => this.logger.info("ポート番号5000番でWebサーバーを起動しました。"));
	}

	/**
	 * アクセスログを標準出力する。
	 * @param {express.Request} request リクエストオブジェクト
	 * @param {express.Response} response レスポンスオブジェクト
	 */
	private logAccess(request: express.Request, response: express.Response) {
		this.logger.info("クライアントからのリクエストを受信しました。");
		this.logger.groupStart();
		this.logger.debug(`クライアント：${request.hostname}`);
		this.logger.debug(`アドレス：${request.path}`);
		this.logger.debug(`レスポンス：${response.statusCode} ${response.statusMessage}`);
		this.logger.groupEnd();
	}
}