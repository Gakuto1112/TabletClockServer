import { WebServer } from "./WebServer";
import { SocketServer } from "./SocketServer";

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

webServer.run();
socketServer.run();