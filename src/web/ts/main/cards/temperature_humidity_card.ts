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
     * 現在の湿度を取得する。
     */
    private async getCurrentHumidity(): Promise<void> {
        const currentHumidity: number | undefined = (await this.getApiData("get_current_humidity")) as number | undefined;
        if(currentHumidity != undefined) {
            this.currentData.humidity = currentHumidity;
            this.updateCurrentHumidity();
        }
    }

    /**
     * 温度履歴データを取得する。
     */
    private async getTemperatureHistory(): Promise<void> {
        const temperatureHistory: number[] | undefined = (await this.getApiData("get_temperature_history")) as number[] | undefined;
        if(temperatureHistory != undefined) {
            this.dataHistories.temperature = temperatureHistory;
            this.updateTemperatureGraph();
        }
    }

    /**
     * 現在の温度データを更新する。
     */
    private updateCurrentTemperature(): void {
        (document.getElementById("card_1_temperature") as HTMLSpanElement).innerText = (Math.round(this.currentData.temperature * 10) / 10).toFixed(1);
        this.updateTemperatureGraph();
        this.updateDiscomfortIndex();
    }

    /**
     * 現在の湿度データを更新する。
     */
    private updateCurrentHumidity(): void {
        (document.getElementById("card_1_humidity") as HTMLSpanElement).innerText = (Math.round(this.currentData.humidity * 10) / 10).toFixed(1);
        this.updateDiscomfortIndex();
    }

    /**
     * 温度データグラフを更新する。
     */
    private updateTemperatureGraph(): void {
        const graphElements: HTMLDivElement = document.getElementById("card_1_temperature_graph_elements") as HTMLDivElement;
        let maxElementDiff = 0;
        this.dataHistories.temperature.forEach((element: number) => maxElementDiff = Math.max(Math.abs(element - this.currentData.temperature), maxElementDiff));
        for(let i = 0; i < 24; i++) {
            const graphElement: HTMLDivElement = graphElements.children.item(i) as HTMLDivElement;
            if(this.dataHistories.temperature[i] != undefined) {
                graphElement.style.marginBottom = `${maxElementDiff > 0 ? 66.07 * ((this.dataHistories.temperature[i] - (this.currentData.temperature - maxElementDiff)) / (maxElementDiff * 2)) : 33.03}px`;
                graphElement.classList.remove("invisible");
            }
            else graphElement.classList.add("invisible");
        }
    }

    /**
     * 不快指数を更新する。
     */
    private updateDiscomfortIndex(): void {
        const discomfortIndex: number = 0.81 * this.currentData.temperature + 0.01 * this.currentData.humidity * (0.99 * this.currentData.temperature - 14.3) + 46.3;
        (document.getElementById("card_1_discomfort_index") as HTMLSpanElement).innerText = discomfortIndex.toFixed(1);
        (document.getElementById("card_1_discomfort_index_text") as HTMLSpanElement).innerText = discomfortIndex < 50 ? "寒くてたまらない" : (discomfortIndex < 55 ? "寒い" : (discomfortIndex < 60) ? "肌寒い" : (discomfortIndex < 65 ? "何も感じない" : (discomfortIndex < 70 ? "快適": (discomfortIndex < 75 ? "暑くない" : (discomfortIndex < 80 ? "やや熱い" : (discomfortIndex < 85 ? "暑くて汗が出る" : "暑くてたまらない"))))));
        const discomfortIndexArrowElement: HTMLDivElement = document.getElementById("card_1_discomfort_index_arrow") as HTMLDivElement;
        discomfortIndexArrowElement.style.marginLeft = `${Math.min(Math.max((discomfortIndex - 50) / 35, 0), 1) * 100}%`;
        discomfortIndexArrowElement.classList.remove("invisible");
    }

    /**
     * 実行関数
     */
    public run(): void {
        const socketClient: SocketClient = this.cardManager.getParent().getSocketClient();
        socketClient.addEventListener("open", () => {
            this.getCurrentTemperature();
            this.getCurrentHumidity();
            this.getTemperatureHistory();
        });
        socketClient.addEventListener("temperature", (temperature: number) => {
            this.currentData.temperature = temperature;
            this.updateCurrentTemperature();
        });
        socketClient.addEventListener("humidity", (humidity: number) => {
            this.currentData.humidity = humidity;
            this.updateCurrentHumidity();
        });
        socketClient.addEventListener("temperature_history", (temperatureHistory: number[]) => {
            this.dataHistories.temperature = temperatureHistory;
            this.updateTemperatureGraph();
        });
        setInterval(async () => {
            if(this.cardManager.getParent().getSocketClient().getSocketStatus() == "CLOSED") {
                this.getCurrentTemperature();
                this.getCurrentHumidity();
            }
        }, TEMPERATURE_HUMIDITY_INTERVAL * 1000);
        this.cardManager.getParent().getOneHourEvent().addEventListener(() => {
            if(this.cardManager.getParent().getSocketClient().getSocketStatus() == "CLOSED") {
                this.getTemperatureHistory();
            }
        });
    }
}