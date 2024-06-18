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

    getText() {
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
}