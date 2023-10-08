import AHT20 from "aht20-sensor";
import { error } from "@gakuto1112/nodejs-logger";
import { SubModule } from "./sub_module";

/**
 * センサーを管理するクラス
 */
export class Sensors extends SubModule {
    /**
     * 温度・湿度を取得する間隔（秒）
     */
    private readonly TEMPERATURE_HUMIDITY_INTERVAL: number = 15;

    /**
     * 現在の温度データ
     */
    private currentTemperature: number = 0;

    /**
     * 現在の湿度データ
     */
    private currentHumidity: number = 0;

    /**
     * AHT20センサーから情報を取得する。
     */
    private async getAHT20Sensors(): Promise<void> {
        try {
            let errorOccurred: boolean = false;
            const aht20Sensor: AHT20 = await AHT20.open();
            try {
                const newTemperature: number = await aht20Sensor.temperature();
                if(newTemperature != this.currentTemperature) {
                    this.parent.getWebServer().getSocketServer().sendTemperature(newTemperature);
                    this.currentTemperature = newTemperature;
                }
            }
            catch {
                error("Failed to get temperature data.");
                this.parent.getWebServer().getSocketServer().sendError("温度データの取得に失敗しました。");
                errorOccurred = true;
            }
            try {
                const newHumidity: number = await aht20Sensor.humidity();
                if(newHumidity != this.currentHumidity) {
                    this.parent.getWebServer().getSocketServer().sendHumidity(newHumidity);
                    this.currentHumidity = newHumidity;
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
     * 初期化関数
     */
    public init(): void {
        this.getAHT20Sensors();
        setInterval(() => this.getAHT20Sensors(), this.TEMPERATURE_HUMIDITY_INTERVAL * 1000);
    }
}