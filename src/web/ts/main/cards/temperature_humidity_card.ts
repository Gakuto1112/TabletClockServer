import { TEMPERATURE_HUMIDITY_INTERVAL } from "../../global/sensor_intervals";
import { CardAbstract } from "./card_abstract";
import { SocketClient } from "../socket_client";

/**
 * 測定温湿度カードのクラス
 */
export class TemperatureHumidityCard extends CardAbstract {
    /**
     * 測定データの履歴（直近24時間分）
     */
    private readonly dataHistories: {[key: string]: number[]} = {
        temperature: [],
        humidity: []
    };

    /**
     * 現在の測定データ
     */
    private readonly currentData: {[key: string]: number} = {
        temperature: 0,
        humidity: 0
    };

    /**
     * 現在の温度を取得する。
     */
    private async getCurrentTemperature(): Promise<void> {
        const currentTemperature: number | undefined = (await this.getApiData("get_current_temperature")) as number | undefined;
        if(currentTemperature != undefined) {
            this.currentData.temperature = currentTemperature;
            this.updateCurrentTemperature();
        }
    }

    /**
     * 現在の温度データを更新する。
     */
    private updateCurrentTemperature(): void {
        (document.getElementById("card_1_temperature") as HTMLSpanElement).innerText = (Math.round(this.currentData.temperature * 10) / 10).toString();
    }

    /**
     * 実行関数
     */
    public run(): void {
        const socketClient: SocketClient = this.cardManager.getParent().getSocketClient();
        socketClient.addEventListener("open", () => this.getCurrentTemperature());
        socketClient.addEventListener("temperature", (temperature: number) => {
            this.currentData.temperature = temperature;
            this.updateCurrentTemperature();
        });
        setInterval(async () => {
            if(this.cardManager.getParent().getSocketClient().getSocketStatus() == "CLOSED") this.getCurrentTemperature();
        }, TEMPERATURE_HUMIDITY_INTERVAL * 1000);
    }
}