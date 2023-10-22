#!/usr/bin/env node

/**
 * タブレットクロックシステムの実行関数
 */
function tabletClock(): void {
    console.info("Starting the system...");
    try {
        import("../server/tablet_clock_server");
    }
    catch {
        throw new Error("Failed to start the system.");
    }
}

tabletClock();