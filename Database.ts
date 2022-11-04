import fs from "fs";
import { parse } from "jsonc-parser";
import mysql from "mysql";

interface SettingsObject {
	mysqlUser: string;
	mysqlPassword: string;
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
				this.database.query("SHOW DATABASES LIKE 'tabletclock_temphumid';", (error: mysql.MysqlError | null, result: any, field: mysql.FieldInfo[] | null) => {
					if(error) throw error;
					else {
						if(result.length == 0) {
							console.info("[Database]: データベースを作成しています...");
							this.database.query("CREATE DATABASE tabletclock_temphumid;", (error: mysql.MysqlError | null, result: any, field: mysql.FieldInfo[] | null) => {
								if(error) throw error;
								else {
									console.info("[Database]: データベースを作成しました。");
									console.info("[Database]: テーブルを作成しています...");
									this.database.query("CREATE TABLE tabletclock_temphumid.temp_humid (id int not null, date datetime not null, temperature double, humidity double);", (error: mysql.MysqlError | null, result: any, field: mysql.FieldInfo[] | null) => {
										if(error) throw error;
										else console.info("[Database]: テーブルを作成しました。");
									});
								}
							});
						}
						else {
							console.info("[Database]: 既存のデータベースが見つかりました。");
						}
					}
				});
			}
		});
	}
}