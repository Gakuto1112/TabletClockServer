import { setLogDebugLevel } from "@gakuto1112/nodejs-logger";
import { init } from "./init";

/**
 * デバッグモードでタブレットクロックシステムを実行する。
 */
function debug(): void {
    //システムの準備
    console.info("Preparing the system...");
    init();

    //デバッグモードでシステムを起動
    console.info("Starting the system with debug mode...");
    setLogDebugLevel(true);
    try {
        import("../server/tablet_clock_server");
    }
    catch {
        throw new Error("Failed to start the system.");
    }
}

debug();