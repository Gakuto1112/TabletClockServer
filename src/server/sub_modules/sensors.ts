import AHT20 from "aht20-sensor";
import { connect } from "mcp-3xxx";
import { McpDevice } from "mcp-3xxx/build/types/mcp-3xxx";
import { debug, error } from "@gakuto1112/nodejs-logger";
import { SubModule } from "./sub_module";
import { TEMPERATURE_HUMIDITY_INTERVAL, BRIGHTNESS_INTERVAL } from "../global/sensor_intervals";

/**
 * センサーを管理するクラス
 */
export class Sensors extends SubModule {
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
        humidity: 0,
        brightness: 0
    };

    /**
     * データ履歴を更新するかどうか
     */
    private readonly isHistoryUpdateNext: {[key: string]: boolean} = {
        temperature: false,
        humidity: false
    };

    /**
     * 現在の温度データを返す。
     * @returns 現在の温度データ
     */
    public getCurrentTemperature(): number {
        return this.currentData.temperature;
    }

    /**
     * 現在の湿度データを返す。
     * @returns 現在の湿度データ
     */
    public getCurrentHumidity(): number {
        return this.currentData.humidity;
    }

    /**
     * 温度データの履歴を返す。
     * @returns 温度データの履歴
     */
    public getTemperatureHistory(): number[] {
        return this.dataHistories.temperature.map((element: number) => {
            return element;
        });
    }

    /**
     * 湿度データの履歴を返す。
     * @returns 湿度データの履歴
     */
    public getHumidityHistory(): number[] {
        return this.dataHistories.humidity.map((element: number) => {
            return element;
        });
    }

    /**
     * AHT20センサーから情報を取得する。
     */
    private async getAHT20Sensors(): Promise<void> {
        try {
            let errorOccurred: boolean = false;
            const aht20Sensor: AHT20 = await AHT20.open();
            try {
                const newTemperature: number = await aht20Sensor.temperature();
                debug(`Got new temperature: ${newTemperature}℃`);
                if(newTemperature != this.currentData.temperature) {
                    this.parent.getWebServer().getSocketServer().sendTemperature(newTemperature);
                    this.currentData.temperature = newTemperature;
                }
                if(this.isHistoryUpdateNext.temperature) {
                    this.dataHistories.temperature.push(newTemperature);
                    while(this.dataHistories.temperature.length > 24) this.dataHistories.temperature.shift();
                    this.parent.getWebServer().getSocketServer().sendTemperatureHistory(this.dataHistories.temperature);
                    this.isHistoryUpdateNext.temperature = false;
                    debug("Updated temperature history.");
                }
            }
            catch {
                error("Failed to get temperature data.");
                this.parent.getWebServer().getSocketServer().sendError("温度データの取得に失敗しました。");
                errorOccurred = true;
            }
            try {
                const newHumidity: number = await aht20Sensor.humidity();
                debug(`Got new humidity: ${newHumidity}%`);
                if(newHumidity != this.currentData.humidity) {
                    this.parent.getWebServer().getSocketServer().sendHumidity(newHumidity);
                    this.currentData.humidity = newHumidity;
                }
                if(this.isHistoryUpdateNext.humidity) {
                    this.dataHistories.humidity.push(newHumidity);
                    while(this.dataHistories.humidity.length > 24) this.dataHistories.humidity.shift();
                    this.parent.getWebServer().getSocketServer().sendHumidityHistory(this.dataHistories.humidity);
                    this.isHistoryUpdateNext.humidity = false;
                    debug("Updated temperature history.");
                }
            }
            catch {
                error("Failed to get humidity data.");
                this.parent.getWebServer().getSocketServer().sendError("湿度データの取得に失敗しました。");
                errorOccurred = true;
            }
            if(errorOccurred) aht20Sensor.reset();
        }
        catch {
            error("Cannot open AHT20 sensor.");
            this.parent.getWebServer().getSocketServer().sendError("温湿度センサーと通信できませんでした。");
        }
    }

    /**
     * センサーから明るさを取得する。
     * @returns 明るさ（0 - 4096）
     */
    private async getBrightness(): Promise<void> {
        try {
            const mcp: McpDevice = await connect("3208", 0);
            const newBrightness: number = await mcp.read();
            mcp.close();
            debug(`Got new brightness: ${newBrightness}`);
            if(newBrightness != this.currentData.brightness) {
                this.parent.getWebServer().getSocketServer().sendBrightness(newBrightness);
                this.currentData.brightness = newBrightness;
            }
        }
        catch(err: any) {
            error("Failed to get brightness.");
            console.log(err);
        }
    }

    /**
     * 初期化関数
     */
    public init(): void {
        this.getAHT20Sensors();
        this.getBrightness();
        setInterval(() => this.getAHT20Sensors(), TEMPERATURE_HUMIDITY_INTERVAL * 1000);
        setInterval(() => this.getBrightness(), BRIGHTNESS_INTERVAL * 1000);
        this.parent.getOneHourEvent().addEventListener(() => {
            this.isHistoryUpdateNext.temperature = true;
            this.isHistoryUpdateNext.humidity = true;
        });
    }
}