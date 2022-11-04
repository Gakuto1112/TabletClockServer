import { Database } from "./Database";
import { Sensors } from "./Sensors";
import { WebServer } from "./WebServer";
import { SocketServer } from "./SocketServer";

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

Promise.all([
	sensors.getTemperature(),
	sensors.getHumidity()
]).then((values: [number, number]) => {
	webServer = new WebServer(database, values[0], values[1]);
});