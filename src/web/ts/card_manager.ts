export class CardManager {
    /**
     * カードの枚数
     */
    private readonly cardCount: number = 3;

    /**
     * 現在のカード
     */
    private currentCard: number = 0;

    /**
     * 実行関数
     */
    public run(): void {
        if(this.cardCount > 1) {
            const cardBarParent: HTMLDivElement = (document.getElementById("card_bar") as HTMLDivElement);
            for(let i = 0; i < this.cardCount; i++) {
                const barElement: HTMLDivElement = document.createElement("div");
                if(i == 0) window.requestAnimationFrame(() => barElement.classList.add("card_bar_progression"));
                barElement.addEventListener("transitionend", (): any => {
                    (document.getElementById("card") as HTMLDivElement).classList.add("card_flip_animation");
                    const currentElement: HTMLDivElement = (cardBarParent.children.item(this.currentCard) as HTMLDivElement);
                    currentElement.classList.remove("card_bar_progression");
                    currentElement.classList.add("card_bar_progression_end");
                });
                barElement.addEventListener("animationend", () => {
                    (document.getElementById("card") as HTMLDivElement).classList.remove("card_flip_animation");
                    (cardBarParent.children.item(this.currentCard) as HTMLDivElement).classList.remove("card_bar_progression_end");
                    this.currentCard = (this.currentCard + 1) % this.cardCount;
                    (cardBarParent.children.item(this.currentCard) as HTMLDivElement).classList.add("card_bar_progression");
                });
                cardBarParent.appendChild(barElement);
            }
            document.documentElement.style.setProperty("--card-bar-width", `${500 / this.cardCount - 20}px`);
        }
        else (document.getElementById("card_bar") as HTMLDivElement).style.visibility = "hidden";
    }
}