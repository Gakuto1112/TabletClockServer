import { execSync } from "child_process";

/**
 * TypeScriptソースファイルをコンパイルする。
 * @throws コンパイルに失敗した場合
 */
export function build(): void {
    try {
        //npm実行ファイル
        console.info("Compiling npm scripts (1/3)...");
        execSync(`${process.env.INIT_CWD}/node_modules/.bin/tsc`, {
            cwd: "./src/npm"
        });

        //サーバー実行ファイル
        console.info("Compiling server scripts (2/3)...");
        execSync(`${process.env.INIT_CWD}/node_modules/.bin/tsc`, {
            cwd: "./src/server"
        });

        //webスクリプト
        console.info("Compiling web client scripts (3/3)...");
        execSync(`${process.env.INIT_CWD}/node_modules/.bin/tsc`, {
            cwd: "./src/web/ts"
        });
    }
    catch {
        throw new Error("Cannot compile TypeScript sources.");
    }
    console.info("Completed compiling TypeScript files.");
}

if(require.main == module) build();