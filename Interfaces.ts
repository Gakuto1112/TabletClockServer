export interface DatabaseConfigObject {
	mysqlUser: string;
	mysqlPassword: string;
}

export interface RecordObject {
	date: Date;
	temperature: number;
	humidity: number;
}

export interface SensorsConfigObject {
	busNumber: number;
	adt7410Address: number;
	temperatureHumiditySensorInterval: number;
}