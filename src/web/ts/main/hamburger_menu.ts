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
     * ハンバーガーメニューを閉じる。
     */
    private closeHamburgerMenu(): void {
        (document.getElementById("hamburger_menu") as HTMLDivElement).classList.remove("hamburger_menu_opened");
        (document.querySelector("nav") as HTMLElement).addEventListener("transitionend", this.showHamburgerMenuTab, {once: true});
        for(let element of document.querySelectorAll(".collapse_menu_opened") as NodeListOf<HTMLDivElement>) element.classList.remove("collapse_menu_opened");
    }

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
        (document.getElementById("hamburger_menu_background") as HTMLDivElement).addEventListener("click", () => this.closeHamburgerMenu());

        //ハンバーガーメニューを開閉するボタン
        (document.getElementById("menu_button_open_close") as HTMLButtonElement).addEventListener("click", () => {
            if(hamburgerMenuElement.classList.contains("hamburger_menu_opened")) this.closeHamburgerMenu();
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
        const fullscreenButtonElement: HTMLButtonElement = document.getElementById("menu_button_fullscreen") as HTMLButtonElement;

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
                        console.info("[HamburgerMenu]: Entered fullscreen mode.");
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
                        console.info("[HamburgerMenu]: Exited fullscreen mode.");
                        this.parent.getMessageBox().addMessageQueue({content: "フルスクリーンモードを解除しました。", type: "INFO"});
                    }
                    catch(_error: any) {
                        console.error("[HamburgerMenu]: Cannot exit fullscreen mode.");
                        if(!messageBox.contains("fullscreen_exit_error")) messageBox.addMessageQueue({content: "フルスクリーンモードを解除できませんでした。", type: "ERROR", name: "fullscreen_exit_error"});
                    }
                }
            }
            else if(!messageBox.contains("fullscreen_incompatible_error")) {
                console.warn("[HamburgerMenu]: Fullscreen is not supported on your browser.");
                messageBox.addMessageQueue({content: "お使いのブラウザはフルスクリーンモードへの移行に対応していません。", type: "WARN", name: "fullscreen_incompatible_error"});
            }
            this.showHamburgerMenuTab();
        });
        if(!document.fullscreenEnabled) fullscreenButtonElement.classList.add("disabled");

        //起動ロック
        const keepAwakeButtonElement: HTMLButtonElement = document.getElementById("menu_button_keep_awake") as HTMLButtonElement;
        let wakeLock: WakeLockSentinel | undefined = undefined;
        keepAwakeButtonElement.addEventListener("click", async () => {
            if("wakeLock" in navigator) {
                if(keepAwakeButtonElement.classList.contains("keep_awake_enabled")) {
                    try {
                        wakeLock = await navigator.wakeLock.request("screen");
                        wakeLock.addEventListener("release", () => keepAwakeButtonElement.classList.remove("keep_awake_enabled"), {once: true});
                        keepAwakeButtonElement.classList.add("keep_awake_enabled");
                        console.info("[HamburgerMenu]: Requested keep awake.");
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
                        console.info("[HamburgerMenu]: Released keep awake.");
                        messageBox.addMessageQueue({content: "起動ロックを解除しました。", type: "INFO"});
                        wakeLock = undefined;
                    }
                    catch(_error: any) {
                        console.error("[HamburgerMenu]: Cannot release wake lock.");
                        if(!messageBox.contains("wake_lock_release_error")) messageBox.addMessageQueue({content: "起動ロックを解除できませんでした。", type: "ERROR", name: "wake_lock_release_error"});
                    }
                }
            }
            else if(!messageBox.contains("wake_lock_incompatible_error")) {
                console.warn("[HamburgerMenu]: Cannot force this device awake because your browser does not support this or the connection scheme is not \"HTTPS\".");
                messageBox.addMessageQueue({content: "お使いのブラウザは起動ロックに対応していないか、接続がhttpsでないため、利用できません。", type: "WARN", name: "wake_lock_incompatible_error"});
            }
        });
        if(!("wakeLock" in navigator)) keepAwakeButtonElement.classList.add("disabled");

        //背景クリックでハンバーガーメニューのタブを出す。
        (document.getElementById("background") as HTMLDivElement).addEventListener("click", () => this.showHamburgerMenuTab());

        //ハンバーガーメニューの折り畳みメニュー
        for(let element of document.querySelectorAll(".hamburger_menu_collapse_button") as NodeListOf<HTMLDivElement>) {
            element.addEventListener("click", (event: MouseEvent) => {
                const buttonRootElement: HTMLDivElement = ((event.target as HTMLDivElement).parentElement as HTMLDivElement).parentElement as HTMLDivElement;
                if(buttonRootElement.classList.contains("collapse_menu_opened")) buttonRootElement.classList.remove("collapse_menu_opened");
                else buttonRootElement.classList.add("collapse_menu_opened");
            });
        }

        //折り畳みメニュー（表示モード）
        /**
         * 表示モードをダークモードにする際に実行する関数
         */
        function displayModeDark() {
            document.body.classList.add("dark_mode");
        }

        /**
         * システムの表示モードが変化した際に発火するイベント
         * @param event イベント変数
         */
        function displayModeSystemAutoEvent(event: MediaQueryListEvent) {
            if(event.matches) document.body.classList.add("dark_mode");
            else document.body.classList.remove("dark_mode");
        }

        /**
         * 表示モードをシステムに基づくにする際に実行する関数
         * @param thisClass このクラスのインスタンス
         */
        function displayModeSystemAuto(thisClass: HamburgerMenu) {
            if(window.matchMedia != undefined) {
                if(window.matchMedia("(prefers-color-scheme: dark)").matches) document.body.classList.add("dark_mode");
                window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", displayModeSystemAutoEvent);
            }
            else {
                console.warn("[HamburgerMenu]: Dark mode detection is not supported on this browser.");
                thisClass.parent.getMessageBox().addMessageQueue({
                    content: "お使いのブラウザはダークモード検出に対応していません。",
                    type: "WARN"
                });
            }
        }

        const displayModeSelections: NodeListOf<HTMLInputElement> = document.querySelectorAll("input[name='options_display_mode']") as NodeListOf<HTMLInputElement>;
        try {
            const initialDisplayModeRaw: string | null = localStorage.getItem("display_mode");
            const initialDisplayMode: number = initialDisplayModeRaw != null ? Number(initialDisplayModeRaw) : 0;
            displayModeSelections.item(initialDisplayMode).checked = true;
            switch(initialDisplayMode) {
                case 1:
                    displayModeDark();
                    break;
                case 2:
                    displayModeSystemAuto(this);
                    break;
            }
        }
        catch(_error: any) {
            this.parent.getMessageBox().addMessageQueue({
                content: "設定値を読み込めませんでした。",
                type: "ERROR"
            });
        }
        for(let i = 0; i < displayModeSelections.length; i++) {
            displayModeSelections.item(i).addEventListener("change", () => {
                document.body.classList.remove("dark_mode");
                if(window.matchMedia != null) window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", displayModeSystemAutoEvent);
                try {
                    localStorage.setItem("display_mode", i.toString());
                }
                catch(error: any) {
                    this.parent.getMessageBox().addMessageQueue({
                        content: "設定値を保存できませんでした。",
                        type: "ERROR"
                    });
                }
            });
        }

        //表示モード -> ライトモード
        (document.getElementById("options_display_mode_light_button") as HTMLInputElement).addEventListener("change", () => console.info("[HamburgerMenu]: Set display mode to light."));

        //表示モード -> ダークモード
        (document.getElementById("options_display_mode_dark_button") as HTMLInputElement).addEventListener("change", () => {
            displayModeDark();
            console.info("[HamburgerMenu]: Set display mode to dark.");
        });

        //表示モード -> システムに基づく
        (document.getElementById("options_display_mode_system_auto_button") as HTMLInputElement).addEventListener("change", () => {
            displayModeSystemAuto(this);
            console.info("[HamburgerMenu]: Set display mode to system auto.");
        });

        //表示モード -> センサーに基づく
        (document.getElementById("options_display_mode_sensor_auto_button") as HTMLInputElement).addEventListener("change", () => console.info("[HamburgerMenu]: Set display mode to sensor auto."));

        //折り畳みメニュー（背景画像）
        const backgroundSelections: NodeListOf<HTMLInputElement> = document.querySelectorAll("input[name='options_background']") as NodeListOf<HTMLInputElement>;
        try {
            const initialBackgroundRaw: string | null = localStorage.getItem("options");
            backgroundSelections.item(initialBackgroundRaw != null ? Number(initialBackgroundRaw) : 0).checked = true;
        }
        catch(_error: any) {
            this.parent.getMessageBox().addMessageQueue({
                content: "設定値を読み込めませんでした。",
                type: "ERROR"
            });
        }
        for(let i = 0; i < backgroundSelections.length; i++) {
            backgroundSelections.item(i).addEventListener("change", () => {
                try {
                    localStorage.setItem("options", i.toString());
                }
                catch(error: any) {
                    this.parent.getMessageBox().addMessageQueue({
                        content: "設定値を保存できませんでした。",
                        type: "ERROR"
                    });
                }
            });
        }
    }
}