import { JsonResponse } from "../global/response_data";

/**
 * WebサーバーからAPIを通じたデータを取得する。
 * @param apiName APIの名前（"http://localhost:5000/api/**"の"**"の部分）
 * @returns
 */
export async function getApiData(apiName: string): Promise<number | number[] | undefined> {
    try {
        return ((await (await fetch(`./api/${apiName}`)).json()) as JsonResponse).value;
    }
    catch {
        console.error(`Failed to get API "${apiName}".`);
    }
}