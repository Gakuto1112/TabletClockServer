import fs from "fs";
import { parse } from "jsonc-parser";
import cron from "node-cron";
import { Database } from "./Database";
import { Sensors } from "./Sensors";
import { WebServer } from "./WebServer";
import { SocketServer } from "./SocketServer";
import { SensorsConfigObject } from "./Interfaces";

/**
 * データベースのインスタンス
 * @type {Database}
 */
const database: Database = new Database();

/**
 * 各種センサーマネージャーのインスタンス
 * @type {Sensors}
 */
const sensors: Sensors = new Sensors();

/**
 * Webサーバーのインスタンス
 * @type {WebServer}
 */
let webServer: WebServer;

/**
 * WebSocketサーバーのインスタンス
 * @type {SocketServer}
 */
const socketServer: SocketServer = new SocketServer();

//Webサーバーの立ち上げ
Promise.all([
	sensors.getTemperature(),
	sensors.getHumidity()
]).then((values: [number, number]) => {
	webServer = new WebServer(database, values[0], values[1]);
});

//現在の温湿度の更新
/**
 * センサーに関する設定
 * @type {SensorsConfigObject}
 */
const sensorConfig: SensorsConfigObject = parse(fs.readFileSync("config/sensors.jsonc", "utf-8"));
setInterval(() => {
	Promise.all([
		sensors.getTemperature(),
		sensors.getHumidity()
	]).then((values: [number, number]) => {
		if(values[0] != webServer.currentTemperature) {
			socketServer.sendMessage(`updateTemperature ${values[0]}`);
			webServer.currentTemperature = values[0];
		}
		if(values[1] != webServer.currentHumidity) {
			socketServer.sendMessage(`updateHumidity ${values[1]}`);
			webServer.currentHumidity = values[1];
		}
	});
}, sensorConfig.temperatureHumiditySensorInterval * 1000);

//1時間おきに温湿度を記録
cron.schedule("0 0 0 * * *", () => {
	Promise.all([
		sensors.getTemperature(),
		sensors.getHumidity()
	]).then((values: [number, number]) => database.insetData(values[0], values[1]));
});