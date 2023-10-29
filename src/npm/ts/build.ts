import { execSync } from "child_process";

/**
 * システムのビルドを行う。
 */
export function build(): void {
    const isWindows: boolean = process.platform == "win32";

    //グローバルファイルをコピー
    execSync(isWindows ? ".\\update_global_files.bat" : "sh ./update_global_files.sh", {
        cwd: "./src/shell"
    });

    //TypeScriptファイルをコンパイル
    execSync(isWindows ? ".\\build.bat" : "sh ./build.sh", {
        cwd: "./src/shell"
    });
}

if(require.main == module) build();