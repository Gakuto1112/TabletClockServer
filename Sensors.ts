import fs from "fs";
import { parse } from "jsonc-parser";
import * as i2c from "i2c-bus";
import { SensorsConfigObject } from "./Interfaces";
const mcpadc: any = require("mcp-spi-adc");

export class Sensors {
	/**
	 * センサーに関する設定
	 * @type {SensorsConfigObject}
	 */
	private readonly settings: SensorsConfigObject = parse(fs.readFileSync("config/sensors.jsonc", "utf-8"));

	/**
	 * センサーから温度を取得する。
	 * @return {Promise<number>} センサーから取得した温度
	 */
	public getTemperature(): Promise<number> {
		return new Promise((resolve, reject) => {
			i2c.openPromisified(this.settings.busNumber).then((bus: i2c.PromisifiedBus) => {
				bus.readWord(this.settings.adt7410Address, 0x00).then((wordData: number) => {
					let temperature: number = ((wordData & 0xff00) >> 8 | (wordData & 0xff) << 8) >> 3;
					temperature = Number(((temperature & 0x1000) == 0 ? temperature * 0.0625 : ((~ temperature & 0x1fff) + 1) * -0.0625).toFixed(1));
					console.group("[Sensors]: 温度情報を取得しました。");
					console.debug(`温度：${temperature}℃`);
					console.groupEnd();
					resolve(temperature);
				}).catch((error: any) => {
					console.error("[Sensors]: 温度情報の取得に失敗しました。");
					reject(error);
				});
			}).catch((error: any) => {
				console.error("[Sensors]: 温度情報の取得に失敗しました。");
				reject(error);
			});
		});
	}

	/**
	 * センサーから湿度を取得する。
	 * @return {Promise<number>} センサーから取得した湿度
	 */
	public getHumidity(): Promise<number> {
		return new Promise((resolve) => {
			//現在、湿度センサーを取り寄せ中で手元にないので、取り敢えず固定値を返す。
			console.group("[Sensors]: 湿度情報を取得しました。");
			console.debug("湿度：0%");
			console.groupEnd();
			resolve(0);
		});
	}

	/**
	 * センサーから明るさを取得する。
	 * @return {Promise<number>} センサーから取得した明るさ（0-1）
	 */
	public getBrightness(): Promise<number> {
		return new Promise((resolve, reject) => {
			const sensor: any = mcpadc.openMcp3208(0, (error: any) => {
				if(error) {
					console.error("[Sensors]: 明るさ情報の取得に失敗しました。");
					reject(error);
				}
				else {
					sensor.read((error: any, reading: any) => {
						if(error) {
							console.error("[Sensors]: 明るさ情報の取得に失敗しました。");
							reject(error);
						}
						else {
							const brightness: number = Number(reading.value.toFixed(2));
							console.group("[Sensors]: 明るさ情報を取得しました。");
							console.debug(`明るさ：${brightness}`);
							console.groupEnd();
							resolve(brightness);
						}
					});
				}
			});
		});
	}
}