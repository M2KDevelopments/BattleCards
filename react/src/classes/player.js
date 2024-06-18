import { Card } from "./card";

export default class Player {

    id = -1;
    name = "";
    npc = false;
    cards = new Set();
    allancies = new Set();
    revengeId = -1;
    score = 1000;
    hurtByPlayers = new Set();

    /**
     * Create instance of a player
     * @param {String} id
     * @param {String} name
     * @param {bool} npc
     * @param {int} score
     * @param {Array<int>} cards
     */
    constructor(id, name, npc = false, score = 1000, cards = []) {
        this.id = id;
        this.name = name;
        this.npc = npc;
        this.score = score;
        for (const index of cards) this.cards.add(index);
    }

    /**
     * Get the cards in the players hand
     * @param {Array} lightCards 
     * @param {Array} darkCards 
     * @param {bool} lightMode 
     * @returns the cards in the players hand
     */
    getCards(lightCards, darkCards, lightMode) {
        if (lightMode) {
            return Array.from(this.cards.values()).map((id) => {
                const l = lightCards[id]
                return new Card(l.index, l.type, l.value, l.color, l.battleValue, l.darkId)
            });
        } else {
            return Array.from(this.cards.values()).map(id => {
                const d = darkCards[lightCards[id].darkId];
                return new Card(d.index, d.type, d.value, d.color, d.battleValue)
            });
        }
    }


    /**
     * Remove all the cards and give the player new ones.
     * @param {int} cardIds 
     */
    setCards(cardIds = []) {
        this.cards.clear();
        for (const id of cardIds) this.cards.add(id);
    }

    /**
     * Add more cards to player
     * @param  {...int} cardIds 
     */
    addCards(...cardIds) {
        for (const id of cardIds) this.cards.add(id);
    }

    /**
     * Get the highest single-card value.
     * @param {Array} lightCards 
     * @param {Array} darkCards 
     * @returns highest single-card value
     */
    getMaxBattleCardValue(lightCards, darkCards) {
        return Array.from(this.cards.values())
            .map(index => darkCards[lightCards[index].darkId])
            .map(d => new Card(d.index, d.type, d.value, d.color, d.battleValue))
            .sort((a, b) => b.battleValue - a.battleValue)[0].battleValue;
    }

    /**
     * Get the number cards with the same color
     * @param {String} color red, yellow, green or blue
     * @param {Array} lightCards 
     * @param {Array} darkCards 
     * @returns number cards with the same color
     */
    getNumOfCardsWithSameColor(color, lightCards, darkCards) {
        return this.getCards(lightCards, darkCards)
            .filter(c => color == c.color)
            .length - 1;
    }

    /**
    * Get the highest single-card value.
    * @param {Array} lightCards 
    * @param {Array} darkCards 
    * @returns highest single-card value
    */
    getFunctionalCards(lightCards, darkCards) {
        return this.getCards(lightCards, darkCards).filter(c => c.type != "number" || !c.type.includes("pick"));
    }


    /**
    * Get the list of cards that will initiate battle mode.
    * @param {Array} lightCards 
    * @param {Array} darkCards 
    * @returns the list of cards that will initiate battle mode.
    */
    getLaunchingCards(lightCards, darkCards) {
        return this.getCards(lightCards, darkCards).filter(c => c.type.includes("pick"));
    }


    /**
    * Get value of points lost if the game where to end now.
    * @param {Array} lightCards 
    * @param {Array} darkCards 
    * @returns value of points lost if the game where to end now.
    */
    getPotentialGameEndDamage(lightCards, darkCards) {
        var total = 0;
        for (const index of Array.from(this.cards.values())) {
            const card = darkCards[lightCards[index].darkId];
            total += card.battleValue;
        }
        return total;
    }


    /**
     * Return an array of the possible cards to be played
     * @param {*} currentCard 
     * @param {Array} lightCards 
     * @param {Array} darkCards 
     * @param {bool} lightMode 
     * @param {bool} battleMode 
     * @returns 
     */
    getPlayableCards(currentCard, lightCards, darkCards, lightMode, battleMode) {

        // When is normal mode
        if (!battleMode) return this.getCards(lightCards, darkCards, lightMode)
            .filter(card => {
                // if it is a colored reverse card but the color does not match the current card.
                if (card.type === "reversecolor" && currentCard.color != card.color) return false;

                // if it is a colored jump card but the color does not match the current card.
                if (card.type === "jumpcolor" && currentCard.color != card.color) return false;

                // if it a number card but the value and color does not match the current card.
                if (card.type == "number" && (card.value != currentCard.value && card.color != currentCard.color)) return false;

                return true;
            });


        // When it is battble mode
        return this.getCards(lightCards, darkCards, lightMode)
            .filter(card => {

                // if it a number card but the current card is not an iwant which allows the next player to play a number card
                if (card.type == "number" && currentCard.type != "iwant") return false;

                // show all other cards
                return true;
            });
    }
}