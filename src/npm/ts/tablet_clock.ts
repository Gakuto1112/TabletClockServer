#!/usr/bin/env node

import { exec, ChildProcess } from "child_process";
import { Readable } from "stream"

/**
 * タブレットクロックシステムの実行関数
 */
function tabletClock(): void {
    console.info("Starting the system...");
    const subprocess: ChildProcess = exec(`node .${process.platform == "win32" ? "\\" : "/"}tablet_clock_server.js`, {
        cwd: `${(__dirname.match(/^(.+)\/src\/npm\/js$/) as RegExpMatchArray)[1]}/src/server/js`
    });
    (subprocess.stdout as Readable).addListener("data", (chunk: any) => process.stdout.write(chunk));
    (subprocess.stderr as Readable).addListener("data", (chunk: any) => process.stdout.write(chunk));
}

tabletClock();