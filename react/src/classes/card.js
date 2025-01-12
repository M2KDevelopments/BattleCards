export class Card {

    darkId = -1;
    index = -1;
    type = "";
    value = 0;
    color = "";
    battleValue = 0;

    /**
     * Create a new battle card
     * @param {int} index 
     * @param {string} type 
     * @param {int} value 
     * @param {string} color 
     * @param {int} battleValue 
     * @param {string} darkId 
     */
    constructor(index, type, value, color, battleValue, darkId) {
        this.darkId = darkId;
        this.index = index;
        this.type = type;
        this.value = value;
        this.color = color;
        this.battleValue = battleValue;
    }

    isDark() {
        return this.darkId == -1;
    }

    /**
     * Get text for the card
     * @param {Array<Card>} darkCards if you want to show the card dark text
     * Get card battle value
    */
    getText(darkCards) {
        if (this.index == undefined) return "";
        if (darkCards) {
            const card = darkCards[this.darkId];
            switch (card.type) {
                case "jumpcolor":
                case "jump":
                    return "🚫";
                case "reversecolor":
                case "reverse":
                    return "🔙";
                case "iwant":
                    return "💞";
                case "pickuntil":
                    return "🫳🏽";
                case "pick":
                    return `🔥+${card.value}`;
                case "flip":
                    return `💫`;
                case "number":
                    return card.value;
                default: return card.value;
            }
        }
        switch (this.type) {
            case "jumpcolor":
            case "jump":
                return "🚫";
            case "reversecolor":
            case "reverse":
                return "🔙";

            case "iwant":
                return "💞";
            case "pickuntil":
                return "🫳🏽";

            case "pick":
                return `🔥+${this.value}`;

            case "flip":
                return `💫`;

            case "number":
                return this.value;
            default: return this.value;
        }

    }


    /**
     * Get image for the card
     * @param {Array<Card>} darkCards if you want to show the card dark text
     * Get card battle image
    */
    getImage(darkCards = null, battleMode = false) {
        if (this.index == undefined) return "";
        if (darkCards) {
            if (!this.darkId) return "";
            const card = darkCards[this.darkId];
            switch (card.type) {
                case "jumpcolor":
                case "jump":
                    return battleMode ? "jump-battle.png" : "jump.png";
                case "reversecolor":
                    return `reverse-${card.color}.png`;
                case "reverse":
                    return "reverse.png";
                case "iwant":
                    return battleMode ? "iwant-battle.png" : "iwant.png";
                case "pickuntil":
                    return "pickuntil.png";
                case "pick":
                    return `plus${card.value}.gif`;
                case "flip":
                    return `flip.png`;
                case "number":
                    return `${card.value}${card.color}.png`;
                default: return card.value;
            }
        }
        switch (this.type) {
            case "jumpcolor":
            case "jump":
                return battleMode ? "jump-battle.png" : "jump.png";
            case "reversecolor":
                return `reverse-${this.color}.png`;
            case "reverse":
                return "reverse.png";
            case "iwant":
                return battleMode ? "iwant-battle.png" : "iwant.png";
            case "pickuntil":
                return "pickuntil.png";
            case "pick":
                return `plus${this.value}.gif`;
            case "flip":
                return `flip.png`;
            case "number":
                return `${this.value}${this.color}.png`;
            default: return this.value;
        }

    }



    /**
  * Get card battle value
  * @param {Array<Card>} darkCards 
  * Get card battle value
  */
    getBattleValue(darkCards) {
        try {
            return darkCards[this.darkId].battleValue;
        } catch (e) {
            return 0;
        }
    }


    getJSON() {
        return {
            darkId: this.darkId,
            index: this.index,
            type: this.type,
            value: this.value,
            color: this.color,
            battleValue: this.battleValue
        }
    }
}