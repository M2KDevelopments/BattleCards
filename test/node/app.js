// import default card options
const specialCards = require('./res/specialcards.json');
const colors = require('./res/colors.json')


// Game Settings
const cards = []; // will put all the light mode cards in here in the correct order;
let lightCards = [];
const darkCards = [];
const decks = 3;
const numberOfCardsPerGame = 7;
const cardsOnTable = new Set();
const maxTime = 300
let currentCard = null;
let battleMode = false;
let lightMode = true;
let gameTime = maxTime / 2; // seconds
let battleTotal = 0;


// Player Settings
let currentPlayer = 3;
class Player {

    id = -1;
    name = "";
    type = "";
    cards = new Set();
    allancies = new Set();
    revengeId = -1;
    score = 1000;
    hurtByPlayers = new Set();

    constructor(name, type = "npc") {
        this.id = Math.random();
        this.name = name;
        this.type = type;
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
            return Array.from(this.cards.values()).map((id) => lightCards[id])
        } else {
            return Array.from(this.cards.values()).map(id => darkCards[lightCards[id].darkId]);
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
            .sort((a, b) => b.battleValue - a.battleValue)[0].battleValue;
    }

    /**
     * Get the number cards with the same color
     * @param {String} color red, orange, green or blue
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


const players = [
    new Player("Martin", "player"),
    new Player("Themba"),
    new Player("Mike"),
    new Player("Mimi"),
];


// System check if the number dark mode cards available match the number of light mode cards available
let lightCount = 0;
let darkCount = 0;
for (const s of specialCards) {
    if (s.light) lightCount += s.howmany;
    if (s.dark) darkCount += s.howmany;
}
if (lightCount != darkCount) {
    console.error("Error >> Light mode cards are not equal to dark mode cards");
    console.error("Error >> Change the special cards json", 'Light:', lightCount, '!= Dark:', darkCount);
    process.exit(1);
}


// add all cards number cards
for (let d = 0; d < decks; d++) {
    for (const color of colors) {
        for (let j = 0; j < 9; j++) {
            cards.push({ type: "number", value: j + 1, color, battleValue: j + 1 })
            darkCards.push({ type: "number", value: j + 1, color, battleValue: j + 1 })
        };
    }
}


// add all special cards
for (let d = 0; d < decks; d++) {
    for (const specialCard of specialCards) {
        for (let j = 0; j < specialCard.howmany; j++) {

            // we are use the spread operator because if you use specialCard since it coming from a json file
            // it points to the same location in memory
            // so update any special card will update the duplicates
            if (specialCard.light) cards.push({ ...specialCard });

            if (specialCard.dark) darkCards.push({ ...specialCard });
        }
    }
}


// randomize the cards
let cardIndex = 0;
while (cards.length) {

    // get random index of cards to choose
    const index = parseInt(Math.random() * cards.length);

    // add dark card id
    const darkId = cards.length - 1;

    // remove card from map
    const [selectedCard] = cards.splice(index, 1);

    lightCards.push({ ...selectedCard, darkId, index: cardIndex++ });

}


console.log("Starting Battle Cards");
console.log(lightCards.length, 'cards in play');
console.log("Game Time:", parseInt(gameTime / 60), 'mins');


// Distrinbute the cards
cardIndex = 0;
for (const index in players) {
    for (let i = 0; i < numberOfCardsPerGame; i++) {
        players[index].addCards(cardIndex++)
    }
}


/**
 * Choose first card on the table
 * - loops through all the cards
 * - checks if it is a number card
 * - checks if the card already exists in a player hand
 * - the player has the index value of the lightCards array
 * - if the a card is found adds the index of the lightCards in table cards
 * - and sets the current card
 */
for (const cardIndex in lightCards) {

    const card = lightCards[cardIndex];

    if (card.type == "number") {

        // is not in the players hand
        let inHand = false;
        for (const player of players) {
            if (player.cards.has(parseInt(cardIndex))) {
                inHand = true;
                break;
            }
        }

        if (inHand) continue; // try next card

        cardsOnTable.add(parseInt(cardIndex));
        currentCard = card;
        console.log('Card on the table', card.color.toUpperCase(), card.value)
        break;
    }
}


// Display current player
console.log('Current player', players[currentPlayer].name);


// Display Current Battle Damage
console.log('Current Player Damage', players[currentPlayer].getPotentialGameEndDamage(lightCards, darkCards));


// Get the best card if you and npc
if (players[currentPlayer].type === "npc") {

    /**
     * The decision here is based off of
     * --------------------------------------------------------------
     * - What mode it is playing light or dark mode.
     * - What current card is on the table
     * - What cards are available
     * - How many cards are available in hand
     * - How many cards are available in opponents
     * - How many cards are available in closest opponent to finish the game.
     * - If the current in the other side are better.
     * - Current Battle value
     * - Reading the flip side cards.
     * - Affinity to start a battle or not.
     * - Affinity to end a battle
     * - Affinity to end the game wether to help the player about finish more not assist them at all.
     * - Affinity to taunt and scare players.
     * - Affinity to keep the game going
     * - Affinity for revenge
     * - Affinity for alliances
     * - Affinity for confusion and not play anything
     * - Affinity to keep as much battle cards for security
     * 
     */
    const player = players[currentPlayer];
    const playable = player.getPlayableCards(currentCard, lightCards, darkCards, lightMode, battleMode);

    if (currentCard.type == "number") {

        console.log('Playable cards', playable.map(card => `${card.type} ${card.color || ""} ${card.value || ""}`));

        if (!playable.length) {
            console.log('No playable cards');
            process.exit(0);
        }

        // an array of cards with their probabilities of being chosen
        const bestplay = [];

        // loop through the playable cards and generate a probability of each card.
        for (const card of playable) {

            if (card.type == "number") {

                // add card with probability
                const probability = probabilityOfNumberCard(card, currentPlayer, players, lightCards, darkCards, gameTime, battleMode, battleTotal);
                bestplay.push({ ...card, probability });

            } else if (card.type == "reversecolor") {

                bestplay.push({ ...card, probability: 0.51 });
            } else if (card.type == "jumpcolor") {

                bestplay.push({ ...card, probability: 0.35 });
            } else if (card.type == "reverse") {

                bestplay.push({ ...card, probability: 0.56 });
            } else if (card.type == "jump") {

                bestplay.push({ ...card, probability: 0.36 });
            } else if (card.type == "pick") {

                bestplay.push({ ...card, probability: 0.13 });
            } else if (card.type == "pickuntil") {

                bestplay.push({ ...card, probability: 0.52 });
            } else if (card.type == "iwant") {

                bestplay.push({ ...card, probability: 0.64 });
            } else if (card.type == "flip") {

                bestplay.push({ ...card, probability: 0.47 });
            }

        }

        // pick a card
        const bestcard = bestplay.sort((a, b) => b.probability - a.probability)[0];
        console.log('Best Card >>', `${bestcard.type} ${bestcard.color || ""} ${bestcard.value || ""}`, '>>', `${parseInt(bestcard.probability * 100.0)}%`);

        // play card
        if (player.cards.delete(bestcard.index)) cardsOnTable.add(bestcard.index);

    } else if (currentCard.type == "pick") {

    } else if (currentCard.type == "pickuntil") {

    } else if (currentCard.type == "reverse") {

    } else if (currentCard.type == "reversecolor") {

    } else if (currentCard.type == "jump") {

    } else if (currentCard.type == "jumpcolor") {

    } else if (currentCard.type == "iwant") {

    } else if (currentCard.type == "flip") {

    }
}


/**
 * Get the probability between 0 - 1 of this player choosing a number card under the game circumstances.
 * @param {*} card Potential playable card 
 * @param {int} currentPlayer 
 * @param {Array<Player>} players
 * @param {Array} lightCards 
 * @param {Array} darkCards 
 * @param {int} gameTime Game time left
 * @param {bool} battleMode 
 * @param {int} battleTotal total number of cards need to be picked.
 * @returns the probability between 0 - 1 of this player choosing a number card under the game circumstances.
 */
function probabilityOfNumberCard(card, currentPlayer, players, lightCards, darkCards, gameTime, battleMode, battleTotal) {

    // Get current player
    const player = players[currentPlayer];


    // Weights should not be above 10.
    const wCardBattleValue = 9;
    const wCardsWithSameColor = 7;
    const wTime = 6;
    const wAveragePlayerCards = 6;
    const wSomeoneFinishing = 3;
    const wNoOneFinishing = 5;
    const wPeopleFinishing = 4;
    const wMeFinishing = 8;
    const wBattleDamageOnGameEnd = 8
    const wPlayWithManyFunctionalCards = 6;
    const wPlayWithManyBattleCards = 6;


    // get largest card with battle value
    const maxBattleValue = player.getMaxBattleCardValue(lightCards, darkCards);

    // get potential battle damage from end game
    const battleDamage = player.getPotentialGameEndDamage(lightCards, darkCards);

    // get non numbered cards
    const noneNumCardsCount = player.getFunctionalCards(lightCards, darkCards).length;

    // get cards that make others pick
    const battletCardsCount = player.getLaunchingCards(lightCards, darkCards).length;

    // cards with the same color
    const countOfSameColor = player.getNumOfCardsWithSameColor(card.color, lightCards, darkCards)

    // get average amount of cards/player
    let averagePlayerCards = 0;
    for (const p of players) averagePlayerCards = p.cards.size;
    averagePlayerCards /= players.length;


    // finishing players
    const finishingPlayers = players
        .filter(c => c.cards.size <= 2)
        .sort((a, b) => {
            const indexA = players.indexOf(a);
            const indexB = players.indexOf(b);
            const distanceA = currentPlayer > indexA ? players.length - currentPlayer + indexA : indexA - currentPlayer;
            const distanceB = currentPlayer > indexB ? players.length - currentPlayer + indexB : indexB - currentPlayer;
            return distanceA - distanceB;
        });

    let probability = 0;

    // probability based of battle card value
    probability = Math.log10(2.0 + ((card.battleValue * 1.0 / maxBattleValue) * wCardBattleValue));

    // probability base on number of cards with the same color
    probability += Math.log10(2.0 + ((countOfSameColor * 1.0 / player.cards.size) * wCardsWithSameColor));

    // probability base game time
    probability += Math.log10(2.0 + ((gameTime / maxTime) * wTime));

    // probability of number of people finishing the game
    probability += Math.log10(2.0 + ((finishingPlayers.length * 1.0 / players.length) * wPeopleFinishing));

    // probability of average cards/player
    probability += Math.log10(2.0 + ((averagePlayerCards / 2.0) * wAveragePlayerCards));


    // probability of player finishing and their proximity
    if (finishingPlayers.length) {
        const finishing = finishingPlayers[0];
        const distance = currentPlayer > finishing ? players.length - currentPlayer + finishing : finishing - currentPlayer;
        probability += Math.log10(((distance * 1.0 / players.length) * wSomeoneFinishing)); // no one is finishing
    } else probability += Math.log10(wNoOneFinishing); // no one is finishing


    // probability of me finishing
    if (finishingPlayers.includes(player)) {
        probability += Math.log10(wMeFinishing); // no one is finishing
    } probability += Math.log10(10 - wMeFinishing); // no one is finishing

    // probability of me playing when I have a battle cards
    probability += Math.log10(2.0 + (wPlayWithManyBattleCards * (1.0 - (1.0 * battletCardsCount / player.cards.size))));

    // probability of me playing when I have a functional cards
    probability += Math.log10(2.0 + (wPlayWithManyFunctionalCards * (1.0 - (1.0 * noneNumCardsCount / player.cards.size))));

    // probability of me playing when I have a functional cards assuming people do not surpass 300 battle damage often
    probability += Math.log10(2.0 + (wBattleDamageOnGameEnd * (1.0 - (battleDamage / 300.0))));

    return probability / 10.0; // 10 calcaulations

}


/**
 * This function simulates shuffling a deck. Randomize the ids of the cards again and remove all the tablecards except the current card.
 */
function shuffleDeck(lightCards, darkCards, lightMode) {

    // remove all the table cards
    cardsOnTable.clear();
    cardsOnTable.add(currentCard.index);

    // give all the cards in player's hand a new id or index of the lightcards array but it should be the same card
    let counter = 0;
    const playerCards = new Set();
    for (const player of players) {
        const newCards = [];
        for (const card of player.getCards(lightCards, darkCards, lightMode)) {
            const c = { ...card, index: counter }
            cards.push(c);
            newCards.push(counter);
            playerCards.add(counter);
            counter++;
        }
        player.setCards(newCards);
    }


    // give all other cards a new index randomize them
    const tempCards = lightCards.filter(card => !playerCards.has(card.index));
    const newLightCards = [];
    counter = 0;

    while (tempCards.length) {

        // get random index of cards to choose
        const index = parseInt(Math.random() * tempCards.length);

        // remove card from map
        const [selectedCard] = tempCards.splice(index, 1);

        newLightCards.push({ ...selectedCard, index: counter++ }); //uses the same darkId

    }

    //update light cards
    lightCards = newLightCards;
}

