import { exec, ChildProcess } from "child_process";
import { Readable } from "stream"
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
    const subprocess: ChildProcess = exec(`node .${process.platform == "win32" ? "\\" : "/"}tablet_clock_server.js -d`, {
        cwd: "./src/server/js"
    });
    (subprocess.stdout as Readable).addListener("data", (chunk: any) => process.stdout.write(chunk));
    (subprocess.stderr as Readable).addListener("data", (chunk: any) => process.stdout.write(chunk));
}

debug();