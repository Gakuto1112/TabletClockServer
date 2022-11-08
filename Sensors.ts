import fs from "fs";
import { parse } from "jsonc-parser";
import i2c from "i2c-bus";
const mcpadc: any = require("mcp-spi-adc");

export interface SensorsConfigObject {
	busNumber: number;
	temperatureHumiditySensorInterval: number;
	brightnessSensorInterval: number;
	darkModeThreshold: number;
}

export class Sensors {
	/**
	 * センサーに関する設定
	 * @type {SensorsConfigObject}
	 */
	private readonly config: SensorsConfigObject = parse(fs.readFileSync("config/sensors.jsonc", "utf-8"));

	public constructor() {
		i2c.openPromisified(this.config.busNumber).then((bus: i2c.PromisifiedBus) => {
			bus.readByte(0x38, 0x71).then((initData: number) => {
				if(initData != 0x18) {
					Promise.all([0x1b, 0x1c, 0x1e].map((byte: number) => {
						return new Promise<void>((resolve, reject) => {
							bus.i2cWrite(0x38, 4, Buffer.from([0x70, byte, 0x00, 0x00])).then(() => {
								setTimeout(() => {
									bus.i2cWrite(0x38, 1, Buffer.from([0x71])).then(() => {
										bus.i2cRead(0x38, 3, Buffer.alloc(3)).then((data: i2c.BytesRead) => {
											setTimeout(() => {
												bus.i2cWrite(0x38, 4, Buffer.from([0x70, 0xb8, data.buffer[1], data.buffer[2]])).then(() => {
													resolve();
												});
											}, 10);
										});
									});
								}, 5);
							});
						});
					}));
				}
			});
		});
	}

	/**
	 * センサーの測定トリガーを書き込む。
	 * @return {Promise<void>}
	 */
	public triggerMeasurement(): Promise<void> {
		return new Promise((resolve, reject) => {
			i2c.openPromisified(this.config.busNumber).then((bus: i2c.PromisifiedBus) => {
				bus.i2cWrite(0x38, 3, Buffer.from([0xac, 0x33, 0x00])).then(() => setTimeout(() => resolve(), 80)).catch((error: any) => reject(error));
			}).catch((error: any) => reject(error));
		});
	}

	/**
	 * センサーから温度を取得する。
	 * @return {Promise<number>} センサーから取得した温度
	 */
	public getTemperature(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.triggerMeasurement().then(() => {
				i2c.openPromisified(this.config.busNumber).then((bus: i2c.PromisifiedBus) => {
					bus.i2cRead(0x38, 7, Buffer.alloc(7)).then((data: i2c.BytesRead) => {
						const temperature: number = Number(((((data.buffer[3] & 0xf) << 16) + (data.buffer[4] << 8) + (data.buffer[5])) / Math.pow(2, 20) * 200 - 50).toFixed(1));
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
		});
	}

	/**
	 * センサーから湿度を取得する。
	 * @return {Promise<number>} センサーから取得した湿度
	 */
	public getHumidity(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.triggerMeasurement().then(() => {
				i2c.openPromisified(this.config.busNumber).then((bus: i2c.PromisifiedBus) => {
					bus.i2cRead(0x38, 7, Buffer.alloc(7)).then((data: i2c.BytesRead) => {
						const humidity: number = Number((((data.buffer[1] << 12) + (data.buffer[2] << 4) + ((data.buffer[3] & 0xf0) >> 4)) / Math.pow(2, 20) * 100).toFixed(1));
						console.group("[Sensors]: 湿度情報を取得しました。");
						console.debug(`湿度：${humidity}%`);
						console.groupEnd();
						resolve(humidity);
					}).catch((error: any) => {
						console.error("[Sensors]: 湿度情報の取得に失敗しました。");
						reject(error);
					});
				}).catch((error: any) => {
					console.error("[Sensors]: 湿度情報の取得に失敗しました。");
					reject(error);
				});
			});
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