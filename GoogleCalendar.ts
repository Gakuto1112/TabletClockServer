import fs from "fs";
import { parse } from "jsonc-parser";
import { authenticate } from "@google-cloud/local-auth";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3, google } from "googleapis";
import { GaxiosResponse } from "gaxios";
import cron from "node-cron";
import { resolve } from "path";

interface CredentialsObject {
	installed: {
		"client_id": string;
		"project_id": string;
		"auth_uri": string;
		"token_uri": string;
		"auth_provider_x509_cert_url": string;
		"client_secret": string;
		"redirect_uris": string[];
	}
}

interface ScheduleObject {
	title: string | null | undefined;
	allDay: boolean;
	startTime: Date | null;
	endTime: Date | null;
}

interface CalendarListObject {
	name: string | null | undefined;
	id: string | null | undefined;
}

export class GoogleCalendar {
	/**
	 * 取得するカレンダーリスト
	 * @type {string[]}
	 */
	private readonly calendarList: string[] = parse(fs.readFileSync("config/google_calendar/calendar_list.jsonc", "utf-8"));

	/**
	 * 外部から提供された予定データ。APIを叩く回数を減らすために、サーバーで保持しておく。
	 * @type {ScheduleObject[] | null}
	 */
	private scheduleData: ScheduleObject[] | null = null;

	public constructor() {
		console.info("[GoogleCalendar]: 認証情報を検索しています...");
		fs.access("./config/google_calendar/token.json", fs.constants.R_OK, (error: NodeJS.ErrnoException | null) => {
			if(error) {
				if(error.code == "ENOENT") console.warn("[GoogleCalendar]: 認証情報が見つかりませんでした。新たに認証を行う必要があります。開いたWebページより認証を行ってください。");
				else console.warn("[GoogleCalendar]: 認証情報を読み込めません。新たに認証を行うか、認証情報を読み込み可能にして下さい。新たに認証を行う場合、開いたWebページより認証を行ってください。");
				authenticate({
					scopes: "https://www.googleapis.com/auth/calendar.readonly",
					keyfilePath: `${process.cwd()}/config/google_calendar/credentials.json`
				}).then((client: OAuth2Client) => {
					console.info("[GoogleCalendar]: 認証に成功しました。認証情報を保存しています...");
					const credentials: CredentialsObject = JSON.parse(fs.readFileSync("./config/google_calendar/credentials.json", {encoding: "utf-8"}));
					fs.writeFileSync("./config/google_calendar/token.json", JSON.stringify({
						type: "authorized_user",
						client_id: credentials.installed.client_id,
						client_secret: credentials.installed.client_secret,
						refresh_token: client.credentials.refresh_token
					}));
					console.info("[GoogleCalendar]: 認証情報を保存しました。");
				}).catch(() => {
					console.error("[GoogleCalendar]: 認証に失敗しました。");
					throw new Error("GoogleカレンダーAPIの認証に失敗しました。");
				});
			}
			else console.info("[GoogleCalendar]: 認証情報が見つかりました。");
		});
	}

	/**
	 * 予定情報を返す。
	 * @return {ScheduleObject[]} 天気情報
	 */
	public getScheduleData(): ScheduleObject[] {
		return this.scheduleData != null ? this.scheduleData : [];
	}

	/**
	 * 今日の予定を外部から取得する。
	 * @param {string} calendarName カレンダーの名前
	 * @returns {Promise<ScheduleObject[]>}
	 */
	private fetchScheduleData(calendarName: string): Promise<ScheduleObject[]> {
		return new Promise((resolve, reject) => {
			const calendar: calendar_v3.Calendar = google.calendar({
				version: "v3",
				auth:google.auth.fromJSON(JSON.parse(fs.readFileSync("./config/google_calendar/token.json", {encoding: "utf-8"})))
			});
			const timeStart: Date = new Date();
			timeStart.setHours(0);
			timeStart.setMinutes(0);
			timeStart.setSeconds(0);
			timeStart.setMilliseconds(0);
			const timeEnd: Date = new Date();
			timeEnd.setHours(23);
			timeEnd.setMinutes(59);
			timeEnd.setSeconds(59);
			timeEnd.setMilliseconds(999);
			calendar.events.list({
				calendarId: calendarName,
				timeMin: timeStart.toISOString(),
				timeMax: timeEnd.toISOString(),
				singleEvents: true,
				orderBy: "startTime"
			}).then((response: GaxiosResponse<calendar_v3.Schema$Events>) => {
				const events: ScheduleObject[] = [];
				response.data.items?.forEach((event: calendar_v3.Schema$Event) => {
					const record: ScheduleObject = {
						title: null,
						allDay: true,
						startTime: null,
						endTime: null
					}
					record.title = event.summary;
					if(event.start?.dateTime) {
						record.allDay = false;
						const startTimeSplit: string[] | undefined = event.start.dateTime.match(/\d{2}:\d{2}:\d{2}/)?.toString().split(":");
						const startTime: Date = new Date();
						if(startTimeSplit) {
							startTime.setHours(Number(startTimeSplit[0]));
							startTime.setMinutes(Number(startTimeSplit[1]));
							startTime.setSeconds(Number(startTimeSplit[2]));
						}
						else {
							startTime.setHours(0);
							startTime.setMinutes(0);
							startTime.setSeconds(0);
						}
						startTime.setMilliseconds(0);
						record.startTime = startTime;
						const endTimeSplit: string[] | undefined = event.end?.dateTime?.match(/\d{2}:\d{2}:\d{2}/)?.toString().split(":");
						const endTime: Date = new Date();
						if(endTimeSplit) {
							endTime.setHours(Number(endTimeSplit[0]));
							endTime.setMinutes(Number(endTimeSplit[1]));
							endTime.setSeconds(Number(endTimeSplit[2]));
						}
						else {
							endTime.setHours(0);
							endTime.setMinutes(0);
							endTime.setSeconds(0);
						}
						startTime.setMilliseconds(0);
						record.endTime = endTime;
					}
					events.push(record);
				});
				console.group("[GoogleCalendar]: 予定情報を取得しました。");
				events.forEach((event: ScheduleObject, index: number) => {
					console.group(index);
					console.debug(`title: ${event.title}`);
					console.debug(`allDay: ${event.allDay}`);
					console.debug(`startTime: ${event.startTime}`);
					console.debug(`endTime: ${event.endTime}`);
					console.groupEnd();
				});
				console.groupEnd();
				resolve(events);
			}).catch((error) => {
				console.error("[GoogleCalendar]: 予定情報の取得に失敗しました。");
				reject(error);
			});
		});
	}

	/**
	 * カレンダーリスト全てから予定を取得する。
	 * @returns {Promise<ScheduleObject[]>}
	 */
	private fetchScheduleDataFromAllCalendars(): Promise<ScheduleObject[]> {
		return new Promise((resolve, reject) => {
			const result: ScheduleObject[] = [];
			Promise.all(this.calendarList.map((entry: string) => this.fetchScheduleData(entry))).then((data: ScheduleObject[][]) => {
				data.forEach((dataPart: ScheduleObject[]) => result.concat(dataPart));
				result.sort((a: ScheduleObject, b: ScheduleObject) => {
					if(a.allDay && b.allDay) return 0;
					else if(a.allDay && !b.allDay) return -1;
					else if(!a.allDay && b.allDay) return 1;
					else if(a.startTime && b.startTime) return a.startTime > b.startTime ? 1 : -1;
					else return 0;
				});
				resolve(result);
			}).catch((error: any) => reject(error));
		});
	}

	/**
	 * 予定取得タスクを取得する。
	 */
	public setCalendarTask() {
		this.fetchScheduleDataFromAllCalendars().then((events: ScheduleObject[]) => this.scheduleData = events);
		cron.schedule("0 0 * * * *", () => this.fetchScheduleDataFromAllCalendars().then((events: ScheduleObject[]) => this.scheduleData = events));
	}

	/**
	 * カレンダーリストを取得する。
	 * @returns {Promise<CalendarListObject[]>} カレンダーリスト
	 */
	public listCalendar(): Promise<CalendarListObject[]> {
		return new Promise((resolve, reject) => {
			google.calendar({
				version: "v3",
				auth:google.auth.fromJSON(JSON.parse(fs.readFileSync("./config/google_calendar/token.json", {encoding: "utf-8"})))
			}).calendarList.list().then((response: GaxiosResponse<calendar_v3.Schema$CalendarList>) => {
				const entries: CalendarListObject[] = [];
				response.data.items?.forEach((entry: calendar_v3.Schema$CalendarListEntry, index: number) => {
					if(index == 0) entries.push({
						name: "primary",
						id: entry.id
					});
					else if(entry.summary) entries.push({
						name: entry.summary,
						id: entry.id
					});
				});
				console.group("[GoogleCalendar]: カレンダーリストを取得しました。");
				entries.forEach((entry: CalendarListObject) => console.debug(`${entry.name} のIDは ${entry.id}`));
				console.groupEnd();
				resolve(entries);
			}).catch((error: any) => {
				console.error("[GoogleCalendar]: カレンダーリストの取得に失敗しました。");
				reject(error);
			});
		});
	}
}