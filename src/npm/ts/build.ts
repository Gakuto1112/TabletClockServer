import { exec, ChildProcess } from "child_process";
import { Readable } from "stream"

/**
 * コマンドを子プロセスで実行する。
 * @param command 実行するコマンド。Linux・Mac・Windowsとの互換性に注意。
 */
function execCommand(command: string): Promise<void> {
    return new Promise((resolve: () => void, reject: (reason: any) => void) => {
        const subprocess: ChildProcess = exec(command, {
            cwd: "./src/shell"
        });
        subprocess.addListener("error", (error: Error) => {
            reject(error);
        });
        subprocess.addListener("exit", (code: number | null) => {
            if(code != null && code == 0) resolve();
        });
        (subprocess.stdout as Readable).addListener("data", (chunk: any) => process.stdout.write(chunk));
        (subprocess.stderr as Readable).addListener("data", (chunk: any) => process.stdout.write(chunk));
    });
}

/**
 * システムのビルドを行う。
 */
export async function build(): Promise<void> {
    const isWindows: boolean = process.platform == "win32";

    //グローバルファイルをコピー
    console.info("#### Copy global files ####");
    await execCommand(isWindows ? ".\\update_global_files.bat" : "sh ./update_global_files.sh");

    //TypeScriptファイルをコンパイル
    console.info("\n#### Compile TypeScript files ####");
    await execCommand(isWindows ? ".\\build.bat" : "sh ./build.sh");
}

if(require.main == module) build();