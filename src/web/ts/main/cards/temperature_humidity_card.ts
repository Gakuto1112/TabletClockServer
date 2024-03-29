import { TEMPERATURE_HUMIDITY_INTERVAL } from "../../global/sensor_intervals";
import { getApiData } from "../server_api";
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
     * ブラウザがキャンバス描画に対応しているかどうか。
     */
    private isCanvasSupported: boolean | undefined;

    /**
     * 現在の温度を取得する。
     */
    private async getCurrentTemperature(): Promise<void> {
        const currentTemperature: number | undefined = (await getApiData("get_current_temperature")) as number | undefined;
        if(currentTemperature != undefined) {
            this.currentData.temperature = currentTemperature;
            this.updateCurrentTemperature();
        }
    }

    /**
     * 現在の湿度を取得する。
     */
    private async getCurrentHumidity(): Promise<void> {
        const currentHumidity: number | undefined = (await getApiData("get_current_humidity")) as number | undefined;
        if(currentHumidity != undefined) {
            this.currentData.humidity = currentHumidity;
            this.updateCurrentHumidity();
        }
    }

    /**
     * 温度履歴データを取得する。
     */
    private async getTemperatureHistory(): Promise<void> {
        const temperatureHistory: number[] | undefined = (await getApiData("get_temperature_history")) as number[] | undefined;
        if(temperatureHistory != undefined) {
            this.dataHistories.temperature = temperatureHistory;
            this.updateTemperatureGraph();
        }
    }

    /**
     * 湿度履歴データを取得する。
     */
    private async getHumidityHistory(): Promise<void> {
        const humidityHistory: number[] | undefined = (await getApiData("get_humidity_history")) as number[] | undefined;
        if(humidityHistory != undefined) {
            this.dataHistories.humidity = humidityHistory;
            this.updateHumidityGraph();
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
        this.updateHumidityGraph();
        this.updateDiscomfortIndex();
    }

    /**
     * グラフ表示を更新する。
     * @param graphCanvas 更新対象のグラフのキャンバス要素
     * @param historyData 履歴データセット
     * @param centeredData グラフの中央にする値
     */
    private updateGraph(graphCanvas: HTMLCanvasElement, historyData: number[], centeredData: number): void {
        if(this.isCanvasSupported && historyData.length >= 2) {
            let maxElementDiff: number = 0;
            historyData.forEach((data: number) => maxElementDiff = Math.max(Math.abs(data - centeredData), maxElementDiff));
            const context: CanvasRenderingContext2D = graphCanvas.getContext("2d") as CanvasRenderingContext2D;
            context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
            context.lineWidth = 1;
            context.strokeStyle = "black";
            context.beginPath();
            for(let i = 0; i < historyData.length; i++) {
                if(i == 0) context.moveTo(graphCanvas.width, maxElementDiff > 0 ? graphCanvas.height * (1 - ((historyData[historyData.length - 1] - (centeredData - maxElementDiff)) / (maxElementDiff * 2))) : graphCanvas.height / 2);
                else context.lineTo(graphCanvas.width * (1 / 24 * (23 - i)), maxElementDiff > 0 ? graphCanvas.height * (1 - ((historyData[historyData.length - i - 1] - (centeredData - maxElementDiff)) / (maxElementDiff * 2))) : graphCanvas.height / 2);
                console.log(graphCanvas.width *  (1 / 24 * (23 - i)), maxElementDiff > 0 ? graphCanvas.height * (1 - ((historyData[historyData.length - i - 1] - (centeredData - maxElementDiff)) / (maxElementDiff * 2))) : graphCanvas.height / 2)
            }
            context.stroke();
        }
    }

    /**
     * 温度データグラフを更新する。
     */
    private updateTemperatureGraph(): void {
        this.updateGraph(document.getElementById("card_1_temperature_graph") as HTMLCanvasElement, this.dataHistories.temperature, this.currentData.temperature);
    }

    /**
     * 湿度データグラフを更新する。
     */
    private updateHumidityGraph(): void {
        this.updateGraph(document.getElementById("card_1_humidity_graph") as HTMLCanvasElement, this.dataHistories.humidity, this.currentData.humidity);
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
        //キャンバス初期化
        (document.querySelectorAll("canvas") as NodeListOf<HTMLCanvasElement>).forEach((element: HTMLCanvasElement) => {
            element.width = element.clientWidth;
            element.height = element.clientHeight;
        });

        //キャンバス描画対応の確認
        this.isCanvasSupported = (document.querySelector("canvas") as HTMLCanvasElement).getContext != undefined;
        if(!this.isCanvasSupported) console.warn("[TemperatureHumidityCard]: Canvas is not supported on your browser. Temperature and humidity graph will not rendered.");

        //各種イベント登録
        const socketClient: SocketClient = this.cardManager.getParent().getSocketClient();
        socketClient.addEventListener("open", () => {
            this.getCurrentTemperature();
            this.getCurrentHumidity();
            this.getTemperatureHistory();
            this.getHumidityHistory();
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
        socketClient.addEventListener("humidity_history", (humidityHistory: number[]) => {
            this.dataHistories.humidity = humidityHistory;
            this.updateHumidityGraph();
        });
        setInterval(async () => {
            if(this.cardManager.getParent().getSocketClient().getSocketStatus() == "CLOSED") {
                this.getCurrentTemperature();
                this.getCurrentHumidity();
            }
        }, TEMPERATURE_HUMIDITY_INTERVAL * 1000);
        this.cardManager.getParent().getOneHourEvent().addEventListener(() => {
            setTimeout(() => {
                if(this.cardManager.getParent().getSocketClient().getSocketStatus() == "CLOSED") {
                    this.getTemperatureHistory();
                    this.getHumidityHistory();
                }
            }, 20000);
        });
    }
}