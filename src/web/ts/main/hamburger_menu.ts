import { TabletClockWebModule } from "./tablet_clock_web_module";
import { MessageBox } from "./message_box";

/**
 * ハンバーガーメニューを管理するクラス
 */
export class HamburgerMenu extends TabletClockWebModule {
    /**
     * ハンバーガーメニューのタブを隠すタイムアウトのハンドラー。undefinedの場合はハンドラー未登録を示す。
     */
    private tabCloseTimeoutHandler: NodeJS.Timeout | undefined = undefined;

    /**
     * ハンバーガーメニューのタブを表示させる。既に表示されている場合は、非表示までの時間をリセットする。
     */
    private showHamburgerMenuTab(): void {
        (document.getElementById("hamburger_menu_tab") as HTMLDivElement).classList.add("hamburger_menu_tab_visible");
        if(this.tabCloseTimeoutHandler != undefined) clearTimeout(this.tabCloseTimeoutHandler);
        this.tabCloseTimeoutHandler = setTimeout(() => {
            if(!(document.getElementById("hamburger_menu") as HTMLDivElement).classList.contains("hamburger_menu_opened")) (document.getElementById("hamburger_menu_tab") as HTMLDivElement).classList.remove("hamburger_menu_tab_visible");
            this.tabCloseTimeoutHandler = undefined;
        }, 5000);
    }

    /**
     * 実行関数
     */
    public run(): void {
        //バックグラウンドクリックでハンバーガーメニューを閉じる。
        const hamburgerMenuElement: HTMLDivElement = document.getElementById("hamburger_menu") as HTMLDivElement;
        (document.getElementById("hamburger_menu_background") as HTMLDivElement).addEventListener("click", () => {
            hamburgerMenuElement.classList.remove("hamburger_menu_opened");
            (document.querySelector("nav") as HTMLElement).addEventListener("transitionend", this.showHamburgerMenuTab, {once: true});
        });

        //ハンバーガーメニューを開閉するボタン
        (document.getElementById("menu_button_open_close") as HTMLDivElement).addEventListener("click", () => {
            if(hamburgerMenuElement.classList.contains("hamburger_menu_opened")) {
                hamburgerMenuElement.classList.remove("hamburger_menu_opened");
                (document.querySelector("nav") as HTMLElement).addEventListener("transitionend", this.showHamburgerMenuTab, {once: true});
            }
            else {
                hamburgerMenuElement.classList.add("hamburger_menu_opened");
                if(this.tabCloseTimeoutHandler != undefined) {
                    clearTimeout(this.tabCloseTimeoutHandler);
                    this.tabCloseTimeoutHandler = undefined;
                }
                (document.getElementById("hamburger_menu_tab") as HTMLDivElement).classList.add("hamburger_menu_tab_visible");
            }
        });

        //フルスクリーンイベントとボタン
        const fullscreenButtonElement: HTMLDivElement = document.getElementById("menu_button_fullscreen") as HTMLDivElement;

        /**
         * フルスクリーンが変更された場合に呼ばれる関数
         */
        function onFullscreenChange(): void {
            if(document.fullscreenElement != null) fullscreenButtonElement.classList.add("fullscreen");
            else fullscreenButtonElement.classList.remove("fullscreen");
        }

        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);

        const messageBox: MessageBox = this.parent.getMessageBox();
        fullscreenButtonElement.addEventListener("click", async () => {
            if(document.fullscreenEnabled) {
                if(document.fullscreenElement == null) {
                    try {
                        await document.body.requestFullscreen();
                        messageBox.addMessageQueue({content: "フルスクリーンモードを要求しました。\n解除する場合は同じボタンを押して下さい。", type: "INFO"});
                    }
                    catch(_error: any) {
                        console.error("[HamburgerMenu]: Cannot enter fullscreen mode.");
                        if(!messageBox.contains("fullscreen_enter_error")) messageBox.addMessageQueue({content: "フルスクリーンモードを要求できませんでした。", type: "ERROR", name: "fullscreen_enter_error"});
                    }
                }
                else {
                    try {
                        await document.exitFullscreen();
                        this.parent.getMessageBox().addMessageQueue({content: "フルスクリーンモードを解除しました。", type: "INFO"});
                    }
                    catch(_error: any) {
                        console.error("[HamburgerMenu]: Cannot exit fullscreen mode.");
                        if(!messageBox.contains("fullscreen_exit_error")) messageBox.addMessageQueue({content: "フルスクリーンモードを解除できませんでした。", type: "ERROR", name: "fullscreen_exit_error"});
                    }
                }
            }
            else if(!messageBox.contains("fullscreen_incompatible_error")) messageBox.addMessageQueue({content: "お使いのブラウザはフルスクリーンモードへの移行に対応していません。", type: "ERROR", name: "fullscreen_incompatible_error"});
            this.showHamburgerMenuTab();
        });
        if(!document.fullscreenEnabled) fullscreenButtonElement.classList.add("disabled");

        //起動ロック
        const keepAwakeButtonElement: HTMLDivElement = document.getElementById("menu_button_keep_awake") as HTMLDivElement;
        let wakeLock: WakeLockSentinel | undefined = undefined;
        keepAwakeButtonElement.addEventListener("click", async () => {
            if("wakeLock" in navigator) {
                if(keepAwakeButtonElement.classList.contains("keep_awake_enabled")) {
                    try {
                        wakeLock = await navigator.wakeLock.request("screen");
                        wakeLock.addEventListener("release", () => keepAwakeButtonElement.classList.remove("keep_awake_enabled"), {once: true});
                        keepAwakeButtonElement.classList.add("keep_awake_enabled");
                        messageBox.addMessageQueue({content: "起動ロックを要求しました。\nもう一度同じボタンを押すか別のタブへ移動するまでデバイスはスリープしません。\nバッテリー残量にご注意下さい。", type: "INFO"});
                    }
                    catch(_error: any) {
                        console.error("[HamburgerMenu]: Cannot request wake lock.");
                        if(!messageBox.contains("wake_lock_request_error")) messageBox.addMessageQueue({content: "起動ロックを要求できませんでした。", type: "ERROR", name: "wake_lock_request_error"});
                    }
                }
                else {
                    try {
                        await (wakeLock as WakeLockSentinel).release();
                        messageBox.addMessageQueue({content: "起動ロックを解除しました。", type: "INFO"});
                        wakeLock = undefined;
                    }
                    catch(_error: any) {
                        console.error("[HamburgerMenu]: Cannot release wake lock.");
                        if(!messageBox.contains("wake_lock_release_error")) messageBox.addMessageQueue({content: "起動ロックを解除できませんでした。", type: "ERROR", name: "wake_lock_release_error"});
                    }
                }
            }
            else if(!messageBox.contains("wake_lock_incompatible_error")) messageBox.addMessageQueue({content: "お使いのブラウザは起動ロック対応していないか、接続がhttpsでないため、利用できません。", type: "ERROR", name: "wake_lock_incompatible_error"});
        });
        if(!("wakeLock" in navigator)) keepAwakeButtonElement.classList.add("disabled");

        //背景クリックでハンバーガーメニューのタブを出す。
        (document.getElementById("background") as HTMLDivElement).addEventListener("click", () => this.showHamburgerMenuTab());
    }
}