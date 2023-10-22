import { copyGlobalFiles } from "./copy_global_files";
import { build } from "./build";

/**
 * パッケージの初期化時に実行される関数
 */
export function init(): void {
    //グローバルファイルをコピー
    console.info("######## Copy phase (1/2) ########");
    copyGlobalFiles();

    //TypeScriptファイルのコンパイル
    console.info("######## Build phase (2/2) ########");
    build();
}

if(require.main == module) init();