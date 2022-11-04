import { Database } from "./Database";
import { WebServer } from "./WebServer";
import { SocketServer } from "./SocketServer";
import { Sensors } from "./Sensors";

/**
 * データベースのインスタンス
 * @type {Database}
 */
 const database: Database = new Database();

/**
 * Webサーバーのインスタンス
 * @type {WebServer}
 */
const webServer: WebServer = new WebServer(database);

/**
 * WebSocketサーバーのインスタンス
 * @type {SocketServer}
 */
const socketServer: SocketServer = new SocketServer();

/**
 * 各種センサーマネージャーのインスタンス
 * @type {Sensors}
 */
const sensors: Sensors = new Sensors();