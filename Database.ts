import fs from "fs";
import { parse } from "jsonc-parser";
import mysql from "mysql";

interface SettingsObject {
	mysqlUser: string;
	mysqlPassword: string;
}

export interface RecordObject {
	date: Date;
	temperature: number;
	humidity: number;
}

export class Database {
	/**
	 * データベースへのインターフェースのインスタンス
	 * @type {mysql.Connection}
	 */
	private database: mysql.Connection;

	/**
	 * データベースに接続されているかどうか。
	 * @type {boolean}
	 */
	private databaseConnected: boolean = false;

	/**
	 * データベースの準備
	 */
	constructor() {
		const settings: SettingsObject = parse(fs.readFileSync("./Settings.jsonc", "utf-8"));
		this.database = mysql.createConnection({
			user: settings.mysqlUser,
			password: settings.mysqlPassword
		});
		this.database.connect((error: mysql.MysqlError) => {
			if(error) throw error;
			else {
				this.databaseConnected = true;
				console.group("[Database]: データベースに接続しました。");
				console.info("ホスト：localhost");
				console.info(`ユーザー名：${settings.mysqlUser}`);
				console.info(`パスワード：${"*".repeat(settings.mysqlPassword.length)}`);
				console.groupEnd();
				console.info("[Database]: 既存のデータベースを検索しています...");
				this.database.query("SHOW DATABASES LIKE 'tabletclock_temphumid';", (error: mysql.MysqlError | null, result: any) => {
					if(error) throw error;
					else {
						if(result.length == 0) {
							console.info("[Database]: データベースを作成しています...");
							this.database.query("CREATE DATABASE tabletclock_temphumid;", (error: mysql.MysqlError | null, result: any) => {
								if(error) throw error;
								else {
									console.info("[Database]: データベースを作成しました。");
									console.info("[Database]: テーブルを作成しています...");
									this.database.query("CREATE TABLE tabletclock_temphumid.temp_humid (id int not null AUTO_INCREMENT, date datetime not null, temperature double, humidity int, INDEX (id));", (error: mysql.MysqlError | null, result: any) => {
										if(error) throw error;
										else console.info("[Database]: テーブルを作成しました。");
									});
								}
							});
						}
						else console.info("[Database]: 既存のデータベースが見つかりました。");
					}
				});
			}
		});
	}

	/**
	 * データベースにデータを追加する。
	 * @param temperature 気温データ（℃）
	 * @param humidity 湿度データ（℃）
	 */
	insetData(temperature: number, humidity: number) {
		const now: Date = new Date();
		const dateTime: string = `${now.getFullYear()}${`0${now.getMonth() + 1}`.slice(-2)}${`0${now.getDate()}`.slice(-2)}${`0${now.getHours()}`.slice(-2)}${`0${now.getMinutes()}`.slice(-2)}00`;
		this.database.query(`INSERT INTO tabletclock_temphumid.temp_humid (date, temperature, humidity) VALUES (${dateTime}, ${temperature}, ${humidity})`, (error: mysql.MysqlError | null, result: any) => {
			if(error) {
				console.group("[Database]: データの追加に失敗しました。");
				console.error(`メッセージ：${error.message}`);
				console.groupEnd();
			}
			else {
				console.group("[Database]: データを追加しました。");
				console.debug(`date：${dateTime}`);
				console.debug(`temperature：${temperature}`);
				console.debug(`humidity：${humidity}`);
				console.groupEnd();
			}
		});
	}

	/**
	 * 最新のデータを返す。
	 * @param limit {number} 取得するデータの件数
	 * @return {Promise<RecordObject[] | null>} 最新のデータ1件
	 */
	getData(limit: number): Promise<RecordObject[] | null> {
		return new Promise((resolve, reject) => {
			this.database.query(`SELECT date, temperature, humidity FROM tabletclock_temphumid.temp_humid ORDER BY date DESC LIMIT ${limit}`, (error: mysql.MysqlError | null, result: any) => {
				if(error) {
					console.group("[Database]: データの取得に失敗しました。");
					console.error(`メッセージ：${error.message}`);
					console.groupEnd();
					reject(error);
				}
				else {
					if(result.length == 0) {
						console.warn("[Database]: 取得するデータがありません。");
						resolve(null);
					}
					else {
						const data: RecordObject[] = [];
						console.group(`[Database]: データを${result.length}件取得しました。`);
						result.forEach((record: any, index: number) => {
							const date: Date = new Date(record.date);
							data.push({
								date: date,
								temperature: record.temperature,
								humidity: record.humidity
							});
							console.group(index);
							console.debug(`date: ${date}`);
							console.debug(`temperature: ${record.temperature}`);
							console.debug(`humidity: ${record.humidity}`);
							console.groupEnd();
						});
						console.groupEnd();
						resolve(data);
					}
				}
			});
		});
	}
}