#!/usr/bin/env node

import { execSync } from "child_process";

/**
 * タブレットクロックシステムの実行関数
 */
function tabletClock(): void {
    console.info("Starting the system...");
    execSync(`node .${process.platform == "win32" ? "\\" : "/"}tablet_clock_server.js`, {
        cwd: `${(__dirname.match(/^(.+)\/src\/npm\/js$/) as RegExpMatchArray)[1]}/src/server/js`
    });
}

tabletClock();