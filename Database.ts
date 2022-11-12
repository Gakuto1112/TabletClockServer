import * as fs from "fs";
import { parse } from "jsonc-parser";
import * as mysql from "mysql";
import { Logger } from "./Logger";

interface DatabaseConfigObject {
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
	private readonly database: mysql.Connection;

	/**
	 * ロガーのインスタンス
	 * @type {Logger}
	 */
	private readonly logger: Logger = new Logger("Database");

	/**
	 * データベースの準備
	 */
	public constructor() {
		const config: DatabaseConfigObject = parse(fs.readFileSync("config/database.jsonc", "utf-8"));
		this.database = mysql.createConnection({
			user: config.mysqlUser,
			password: config.mysqlPassword
		});
		this.database.connect((error: mysql.MysqlError) => {
			if(error) throw error;
			else {
				this.logger.info("データベースに接続しました。");
				this.logger.debug("ホスト：localhost");
				this.logger.debug(`ユーザー名：${config.mysqlUser}`);
				this.logger.debug(`パスワード：${"*".repeat(config.mysqlPassword.length)}`);
				this.logger.info("既存のデータベースを検索しています...");
				this.database.query("SHOW DATABASES LIKE 'tabletclock_temphumid';", (error: mysql.MysqlError | null, result: any) => {
					if(error) throw error;
					else {
						if(result.length == 0) {
							this.logger.info("データベースを作成しています...");
							this.database.query("CREATE DATABASE tabletclock_temphumid;", (error: mysql.MysqlError | null, result: any) => {
								if(error) throw error;
								else {
									this.logger.info("データベースを作成しました。");
									this.logger.info("テーブルを作成しています...");
									this.database.query("CREATE TABLE tabletclock_temphumid.temp_humid (id int not null AUTO_INCREMENT, date datetime not null, temperature double, humidity int, INDEX (id));", (error: mysql.MysqlError | null, result: any) => {
										if(error) throw error;
										else this.logger.info("テーブルを作成しました。");
									});
								}
							});
						}
						else this.logger.info("既存のデータベースが見つかりました。");
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
	public insetData(temperature: number, humidity: number) {
		const now: Date = new Date();
		const dateTime: string = `${now.getFullYear()}${`0${now.getMonth() + 1}`.slice(-2)}${`0${now.getDate()}`.slice(-2)}${`0${now.getHours()}`.slice(-2)}${`0${now.getMinutes()}`.slice(-2)}00`;
		this.database.query(`INSERT INTO tabletclock_temphumid.temp_humid (date, temperature, humidity) VALUES (${dateTime}, ${temperature}, ${humidity})`, (error: mysql.MysqlError | null, result: any) => {
			if(error) {
				this.logger.error("データの追加に失敗しました。");
				this.logger.debug(`メッセージ：${error.message}`);
			}
			else {
				this.logger.info("データを追加しました。");
				this.logger.debug(`date：${dateTime}`);
				this.logger.debug(`temperature：${temperature}`);
				this.logger.debug(`humidity：${humidity}`);
			}
		});
	}

	/**
	 * 最新のデータを返す。
	 * @param limit {number} 取得するデータの件数
	 * @return {Promise<RecordObject[] | null>} 最新のデータ1件
	 */
	public getData(limit: number): Promise<RecordObject[] | null> {
		return new Promise((resolve, reject) => {
			this.database.query(`SELECT date, temperature, humidity FROM tabletclock_temphumid.temp_humid ORDER BY date DESC LIMIT ${limit}`, (error: mysql.MysqlError | null, result: any) => {
				if(error) {
					this.logger.error("データの取得に失敗しました。");
					this.logger.debug(`メッセージ：${error.message}`);
					reject(error);
				}
				else {
					if(result.length == 0) {
						this.logger.warn("取得するデータがありません。");
						resolve(null);
					}
					else {
						const data: RecordObject[] = [];
						this.logger.info(`データを${result.length}件取得しました。`);
						result.forEach((record: any, index: number) => {
							const date: Date = new Date(record.date);
							data.push({
								date: date,
								temperature: record.temperature,
								humidity: record.humidity
							});
							this.logger.debug(index.toString());
							this.logger.debug(`date: ${date}`);
							this.logger.debug(`temperature: ${record.temperature}`);
							this.logger.debug(`humidity: ${record.humidity}`);
						});
						resolve(data);
					}
				}
			});
		});
	}
}