import { WebServer } from "./WebServer";
import { SocketServer } from "./SocketServer";
import { Database } from "./Database";


/**
 * Webサーバーのインスタンス
 * @type {WebServer}
 */
const webServer: WebServer = new WebServer();

/**
 * WebSocketサーバーのインスタンス
 * @type {SocketServer}
 */
const socketServer: SocketServer = new SocketServer();

/**
 * データベースのインスタンス
 * @type {Database}
 */
const dataManager: Database = new Database();