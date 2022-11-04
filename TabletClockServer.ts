import { Database } from "./Database";
import { WebServer } from "./WebServer";
import { SocketServer } from "./SocketServer";

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