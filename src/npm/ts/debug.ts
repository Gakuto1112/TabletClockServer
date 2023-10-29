import { execSync } from "child_process";
import { build } from "./build";

/**
 * デバッグモードでタブレットクロックシステムを実行する。
 */
function debug(): void {
    //システムのビルド
    console.info("Building the system...");
    build();

    //デバッグモードでシステムを起動
    console.info("Starting the system with debug mode...");
    execSync(`node .${process.platform == "win32" ? "\\" : "/"}tablet_clock_server.js -d`, {
        cwd: "./src/server/js"
    });
}

debug();