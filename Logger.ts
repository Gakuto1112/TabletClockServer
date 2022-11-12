export class Logger {
	/**
	 * ロガーの名前
	 * @type {string}
	 */
	private readonly name: string;

	/**
	 * group()でレベル下げするインデント数
	 * @type {number}
	 */
	private indent: number = 0;

	/**
	 * 標準出力にロギングするクラス
	 * @param {string} name ロガーの名前
	 */
	public constructor(name: string) {
		this.name = name;
	}

	/**
	 * 現在の日時の文字列を返す。
	 * @return {string} 現在の日時の文字列
	 */
	private getTimeDateString(): string {
		const now: Date = new Date();
		return `${now.getFullYear()}/${`0${now.getMonth() + 1}`.slice(-2)}/${`0${now.getDate()}`.slice(-2)}-${`0${now.getHours()}`.slice(-2)}:${`0${now.getMinutes()}`.slice(-2)}:${`0${now.getSeconds()}`.slice(-2)}`;
	}

	/**
	 * デバッグ情報を出力する。
	 * @param message
	 */
	public debug(message: string) {
		console.debug(`[${this.getTimeDateString()} : ${this.name}/\u001b[36mDEBUG\u001b[0m]: ${"\t".repeat(this.indent + 1)}\u001b[36m${message}\u001b[0m`)
	}

	/**
	 * 情報を出力する。
	 * @param message
	 */
	public info(message: string) {
		console.info(`[${this.getTimeDateString()} : ${this.name}/INFO]: ${"\t".repeat(this.indent + 1)}${message}`)
	}

	/**
	 * 警告を出力する。
	 * @param message
	 */
	public warn(message: string) {
		console.warn(`[${this.getTimeDateString()} : ${this.name}/\u001b[33mWARN\u001b[0m]: ${"\t".repeat(this.indent + 1)}\u001b[33m${message}\u001b[0m`)
	}

	/**
	 * エラーを出力する。
	 * @param message
	 */
	public error(message: string) {
		console.error(`[${this.getTimeDateString()} : ${this.name}/\u001b[31mERROR\u001b[0m]: ${"\t".repeat(this.indent + 1)}\u001b[31m${message}\u001b[0m`)
	}

	/**
	 * ログのグループ化開始
	 */
	public groupStart() {
		this.indent++;
	}

	/**
	 * ログのグループ化終了
	 */
	public groupEnd() {
		if(this.indent > 0) this.indent--;
	}
}