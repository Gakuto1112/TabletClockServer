import fs from "fs";
import { parse } from "jsonc-parser";
import fetch, { Response } from "node-fetch";
import cron from "node-cron";

interface WeatherForecastConfigObject {
	latitude: number;
	longitude: number;
}

interface WeatherRawData {
	latitude: number;
	longitude: number;
	generationtime_ms: number;
	utc_offset_seconds: number;
	timezone: string;
	timezone_abbreviation: string;
	elevation: number;
	hourly_units : {
		time: string;
		temperature_2m: string;
		relativehumidity_2m: string;
		precipitation: string;
		weathercode: string;
		windspeed_10m: string;
		winddirection_10m: string;
	};
	hourly: {
		time: number[];
		temperature_2m: number[];
		relativehumidity_2m: number[];
		precipitation: number[];
		weathercode: number[];
		windspeed_10m: number[];
		winddirection_10m: number[];
	}
}

interface WeatherRecord {
	time: number;
	temperature_2m: number;
	relativehumidity_2m: number;
	precipitation: number;
	weathercode: number;
	windspeed_10m: number;
	winddirection_10m: number;
}

export class WeatherForecast {
	/**
	 * 天気予報APIに関する設定
	 * @type {WeatherForecastConfigObject}
	 */
	private readonly config: WeatherForecastConfigObject = parse(fs.readFileSync("config/weather_forecast.jsonc", "utf-8"));

	/**
	 * 外部に提供する天気データ。APIを叩く回数を減らすために、サーバーで保持しておく。
	 * @type {WeatherRecord[]}
	 */
	private weatherData: WeatherRecord[] | null = null;

	public constructor() {
		this.fetchWeatherData().then((result: WeatherRecord[]) => this.weatherData = result);
		cron.schedule("0 0 * * * *", () => {
			this.fetchWeatherData().then((result: WeatherRecord[]) => this.weatherData = result);
		});
	}

	/**
	 * 天気情報を返す。
	 * @return {WeatherRecord[]} 天気情報
	 */
	public getWeatherData(): WeatherRecord[] {
		return this.weatherData != null ? this.weatherData : [];
	}

	/**
	 * 天気情報を外部から取得する。
	 * @return {Promise<WeatherRecord[]>} APIから取得した生のデータ
	 */
	private fetchWeatherData(): Promise<WeatherRecord[]> {
		return new Promise((resolve, reject) => {
			const now: Date = new Date();
			const tomorrow: Date = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			fetch(`https://api.open-meteo.com/v1/forecast?latitude=${this.config.latitude}&longitude=${this.config.longitude}&hourly=temperature_2m,relativehumidity_2m,precipitation,weathercode,windspeed_10m,winddirection_10m&timeformat=unixtime&timezone=Asia%2FTokyo&start_date=${now.getFullYear()}-${`0${now.getMonth() + 1}`.slice(-2)}-${`0${now.getDate()}`.slice(-2)}&end_date=${tomorrow.getFullYear()}-${`0${tomorrow.getMonth() + 1}`.slice(-2)}-${`0${tomorrow.getDate()}`.slice(-2)}`).then((response: Response) => {
				console.info("[WeatherForecast]: 天気予報情報を取得しました。");
				response.json().then((data: any) => {
					const rawData: WeatherRawData = data;
					const weatherDataStartTime = new Date();
					weatherDataStartTime.setMinutes(0);
					weatherDataStartTime.setSeconds(0);
					weatherDataStartTime.setMilliseconds(0);
					resolve(rawData.hourly.time.map((hour: number, index: number) => {
						return {
							time: hour,
							temperature_2m: rawData.hourly.temperature_2m[index],
							relativehumidity_2m: rawData.hourly.relativehumidity_2m[index],
							precipitation: rawData.hourly.precipitation[index],
							weathercode: rawData.hourly.weathercode[index],
							windspeed_10m: rawData.hourly.windspeed_10m[index],
							winddirection_10m: rawData.hourly.winddirection_10m[index]
						}
					}).filter((record: WeatherRecord) => {
						const time = weatherDataStartTime.getTime() / 1000;
						const recordHour: number = new Date(record.time * 1000).getHours();
						return time <= record.time && time + 86400 >= record.time && (recordHour - weatherDataStartTime.getHours()) % 3 == 0;
					}));
				}).catch((error: any) => reject(error));
			}).catch((error: any) => reject(error));
		});
	}
}