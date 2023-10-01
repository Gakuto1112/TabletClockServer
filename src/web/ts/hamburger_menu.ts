import { WebModule } from "./web_module";

/**
 * ハンバーガーメニューを管理するクラス
 */
export class HamburgerMenu implements WebModule {
    /**
     * ハンバーガーメニューのタブを隠すタイムアウトのハンドラー。undefinedの場合はハンドラー未登録を示す。
     */
    private tabCloseTimeoutHandler: NodeJS.Timeout | undefined;

    /**
     * 実行関数
     */
    public run(): void {
        const hamburgerMenuTabElement: HTMLDivElement = document.getElementById("hamburger_menu_tab") as HTMLDivElement;

        /**
         * ハンバーガーメニューのタブを隠す。
         */
        function  hideHamburgerMenuTab(): void {
            hamburgerMenuTabElement.classList.remove("hamburger_menu_tab_visible");
        }

        const hamburgerMenuElement: HTMLDivElement = document.getElementById("hamburger_menu") as HTMLDivElement;

        //バックグラウンドクリックでハンバーガーメニューを閉じる。
        (document.getElementById("hamburger_menu_background") as HTMLDivElement).addEventListener("click", () => {
            hamburgerMenuElement.classList.remove("hamburger_menu_opened");
            (document.querySelector("nav") as HTMLElement).addEventListener("transitionend", hideHamburgerMenuTab, {once: true});
        });

        //ハンバーガーメニューを開閉するボタン
        (document.getElementById("menu_button_open_close") as HTMLDivElement).addEventListener("click", () => {
            if(hamburgerMenuElement.classList.contains("hamburger_menu_opened")) {
                hamburgerMenuElement.classList.remove("hamburger_menu_opened");
                (document.querySelector("nav") as HTMLElement).addEventListener("transitionend", hideHamburgerMenuTab, {once: true});
            }
            else {
                hamburgerMenuElement.classList.add("hamburger_menu_opened");
                if(this.tabCloseTimeoutHandler != undefined) {
                    clearTimeout(this.tabCloseTimeoutHandler);
                    this.tabCloseTimeoutHandler = undefined;
                }
                hamburgerMenuTabElement.classList.add("hamburger_menu_tab_visible");
            }
        });

        //フルスクリーンイベントとボタン
        const fullscreenButtonElement: HTMLDivElement = document.getElementById("menu_button_fullscreen") as HTMLDivElement;

        /**
         * フルスクリーンが変更された場合に呼ばれる関数
         */
        function onFullscreenChange() {
            if(document.fullscreenElement != null) fullscreenButtonElement.classList.add("fullscreen");
            else fullscreenButtonElement.classList.remove("fullscreen");
        }

        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);

        if(document.fullscreenEnabled) {
            fullscreenButtonElement.addEventListener("click", async () => {
                if(document.fullscreenElement == null) {
                    try {
                        await document.body.requestFullscreen();
                    }
                    catch(_error: any) {
                        console.error("Cannot enter fullscreen mode.");
                    }
                }
                else {
                    try {
                        await document.exitFullscreen();
                    }
                    catch(_error: any) {
                        console.error("Cannot exit fullscreen mode.");
                    }
                }
            });
        }
        else fullscreenButtonElement.classList.add("disabled");

        //背景クリックでハンバーガーメニューのタブを出す。
        (document.getElementById("background") as HTMLDivElement).addEventListener("click", () => {
            hamburgerMenuTabElement.classList.add("hamburger_menu_tab_visible");
            if(this.tabCloseTimeoutHandler != undefined) clearTimeout(this.tabCloseTimeoutHandler);
            this.tabCloseTimeoutHandler = setTimeout(hideHamburgerMenuTab, 5000);
        });
    }
}