/**
 * ハンバーガーメニューを管理するクラス
 */
export class HamburgerMenu {
    /**
     * 実行関数
     */
    public run(): void {
        const hamburgerMenuElement: HTMLDivElement = document.getElementById("hamburger_menu") as HTMLDivElement;
        (document.getElementById("hamburger_menu_background") as HTMLDivElement).addEventListener("click", () => hamburgerMenuElement.classList.remove("hamburger_menu_opened"));
        (document.getElementById("menu_button_open_close") as HTMLDivElement).addEventListener("click", () => {
            if(hamburgerMenuElement.classList.contains("hamburger_menu_opened")) hamburgerMenuElement.classList.remove("hamburger_menu_opened");
            else hamburgerMenuElement.classList.add("hamburger_menu_opened");
        });
    }
}