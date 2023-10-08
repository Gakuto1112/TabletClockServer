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
            const aht20Sensor: AHT20 = await AHT20.open();
            try {
                this.currentTemperature = await aht20Sensor.temperature();
                this.currentHumidity = await aht20Sensor.humidity();
            }
            catch {
                error("Failed to get temperature and humidity data.");
                aht20Sensor.reset();
            }
        }
        catch {
            error("Cannot open AHT20 sensor.");
        }
    }

    /**
     * 初期化関数
     */
    public init(): void {
        this.getAHT20Sensors();
        setInterval(this.getAHT20Sensors, this.TEMPERATURE_HUMIDITY_INTERVAL * 1000);
    }
}