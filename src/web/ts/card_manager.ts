export class CardManager {
    /**
     * 現在のカード
     */
    private currentCard: number = 0;

    /**
     * 実行関数
     */
    public run(): void {
        const cardElement: HTMLDivElement = document.getElementById("card") as HTMLDivElement;
        if(cardElement.childElementCount > 1) {
            /**
             * カードバーがいっぱいになった時に実行される関数
             * @param currentCardVar 現在のカード
             */
            function onProgressComplete(currentCardVar: number): void {
                if(!cardElement.classList.contains("card_flip_animation")) {
                    cardElement.classList.add("card_flip_animation");
                    (cardElement.children.item((currentCardVar + 1) % cardElement.childElementCount) as HTMLDivElement).classList.add("card_back");
                    const currentElement: HTMLDivElement = cardBarParent.children.item(currentCardVar) as HTMLDivElement;
                    currentElement.classList.remove("card_bar_progression");
                    currentElement.classList.add("card_bar_progression_end");
                }
            }

            cardElement.addEventListener("click", () => onProgressComplete(this.currentCard));
            const cardBarParent: HTMLDivElement = document.getElementById("card_bar") as HTMLDivElement;
            for(let i = 0; i < cardElement.childElementCount; i++) {
                const barElement: HTMLDivElement = document.createElement("div");
                if(i == 0) window.requestAnimationFrame(() => barElement.classList.add("card_bar_progression"));
                barElement.addEventListener("transitionend", () => onProgressComplete(this.currentCard));
                barElement.addEventListener("animationend", () => {
                    cardElement.classList.remove("card_flip_animation");
                    (cardElement.children.item(this.currentCard) as HTMLDivElement).classList.remove("card_front");
                    (cardBarParent.children.item(this.currentCard) as HTMLDivElement).classList.remove("card_bar_progression_end");
                    this.currentCard = (this.currentCard + 1) % cardElement.childElementCount;
                    const currentCardElement: HTMLDivElement = cardElement.children.item(this.currentCard) as HTMLDivElement;
                    currentCardElement.classList.add("card_front");
                    currentCardElement.classList.remove("card_back");
                    (cardBarParent.children.item(this.currentCard) as HTMLDivElement).classList.add("card_bar_progression");
                });
                cardBarParent.appendChild(barElement);
            }
            document.documentElement.style.setProperty("--card-bar-width", `${500 / cardElement.childElementCount - 20}px`);
        }
        else (document.getElementById("card_bar") as HTMLDivElement).style.visibility = "hidden";
    }
}