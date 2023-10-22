import fs from "fs";

/**
 * グローバルファイルをサーバーとクライアント双方にコピーする。
 */
export function copyGlobalFiles(): void {
    console.info("Copying global files...");
    try {
        fs.cpSync("./src/global", "./src/server/global", {recursive: true});
        fs.cpSync("./src/global", "./src/web/ts/global", {recursive: true});
    }
    catch(error: any) {
        switch(error.code) {
            case "ENOENT":
                //ソースが存在しない
                throw new Error("Global files not found.");
                break;
            case "EPERM":
                //ディレクトリの読み取り権限がない
                throw new Error("No permission to operate.");
                break;
            default:
                //その他エラー
                throw new Error("Cannot copy global files.");
                break;
        }
    }
    console.info("Completed copying global files.");
}

if(require.main == module) copyGlobalFiles();