#!/usr/bin/env node

import { execSync } from "child_process";

/**
 * タブレットクロックシステムの実行関数
 */
function tabletClock(): void {
    console.info("Starting the system...");
    execSync(`node .${process.platform == "win32" ? "\\" : "/"}tablet_clock_server.js`, {
        cwd: "./src/server/js"
    });
}

tabletClock();