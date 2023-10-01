import { TabletClockWebModule } from "./tablet_clock_web_module";

/**
 * メッセージの種類（情報、警告、エラー）
 */
type MessageType = "INFO" | "WARN" | "ERROR";

/**
 * メッセージキューの要素型
 */
interface MessageQueueElement {
    /** メッセージの内容 */
    content: string,
    /** メッセージの種類 */
    type: MessageType,
    /** メッセージの名前。後で探すのに利用する。探す必要がない場合は省略可。 */
    name?: string
}

/**
 * メッセージボックスを管理するクラス
 */
export class MessageBox extends TabletClockWebModule {
    /**
     * メッセージキュー
     */
    private readonly messageQueue: MessageQueueElement[] = [];

    /**
     * メッセージボックスを表示する。表示されるメッセージはキューの先頭のメッセージで関数実行時にシフトされる。
     */
    private showMessage(): void {
        if(this.messageQueue.length > 0) {
            const targetMessage: MessageQueueElement = this.messageQueue[0];
            const messageBoxElement: HTMLParagraphElement = document.getElementById("message_box") as HTMLParagraphElement;
            messageBoxElement.innerText = targetMessage.content;
            switch(targetMessage.type) {
                case "INFO":
                    messageBoxElement.classList.remove("message_box_warn", "message_box_error");
                    break;
                case "WARN":
                    messageBoxElement.classList.add("message_box_warn");
                    break;
                case "ERROR":
                    messageBoxElement.classList.add("message_box_error");
                    break;
                }
            messageBoxElement.addEventListener("transitionend", () => {
                if(!messageBoxElement.classList.contains("message_box_visible")) {
                    this.messageQueue.shift();
                    if(this.messageQueue.length > 0) this.showMessage();
                }
            });
            setTimeout(() => messageBoxElement.classList.remove("message_box_visible"), 5000);
            messageBoxElement.classList.add("message_box_visible");
        }
        else console.warn("[MessageBox]: No message to show.");
    }

    /**
     * 新たなメッセージをキューに追加する。登録されたメッセージは順番に表示される。
     * @param message 追加するメッセージ
     */
    public addMessageQueue(message: MessageQueueElement): void {
        this.messageQueue.push(message);
        if(this.messageQueue.length == 1) this.showMessage();
    }

    /**
     * 指定された名前を持つメッセージがキューにあるかどうかを返す。
     * @param name 探すメッセージの名前
     * @returns 指定された名前を持つメッセージがキューにあるかどうか
     */
    public contains(name: string): boolean {
        for(let message of this.messageQueue) {
            if(message.name == name) return true;
        }
        return false;
    }

    /**
     * 実行関数
     */
    public run(): void {
    }
}