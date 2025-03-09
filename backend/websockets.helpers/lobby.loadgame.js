import { Socket } from "socket.io"
import specialCards from '../jsons/specialcards.json' assert { type: "json" };
import colors from '../jsons/colors.json' assert { type: "json" };



/**
 * When the host clicks the ready button in the lobby
 * @param {Socket} socket
 * @returns 
 */
export function onLoadGame(socket) {
    return (data, callback) => {

        // get data coming from frontend
        const { roomId, decks, area, npcs, players, playername, gametime, startpoints, anothergame } = data;


        // send countdown messages to everyone
        const maxCount = 10;
        let counter = maxCount;
        const timer = setInterval(() => {

            // send to everyone
            socket.to(roomId).emit("onloadgame", { countdown: counter });
            socket.emit("onloadgame", { countdown: counter });
            counter--; // minus 1 the counter

            // start the game state
            if (counter === parseInt(maxCount / 2)) {
                // shuffle players
                // shuffle cards
                // distribute cards
                // choose 1st card on the table
                // send state of the game to all players.
                const p = !anothergame ? [...players, { name: playername, socketId: socket.id }] : players
                const settings = createGame({ decks, area, npcs, players: p, gametime, startpoints }, counter);

                socket.to(roomId).emit("onloadgame", settings);
                socket.emit("onloadgame", settings);
            }
            else if (counter < 0) clearInterval(timer);
        }, 1000)


        // signal to run the frontend callback
        callback();
    }
}



/**
 * Get the game settings for a fresh game
 * @param {*} gameoptions - options chosen by the host player 
 * @returns the game settings for a fresh game. Players, cards, area, etc
 */
function createGame(gameoptions, counter) {


    const { decks, area, npcs, players, gametime, startpoints } = gameoptions
    // if a player has score that meean a game has already 
    // been player the score field was added to the player
    const goingToAnotherGame = players[0].score;

    // the player who won the last game
    // the player with the lowest damage score
    // if its a very new game the just make it the first player
    const p = goingToAnotherGame ? players.sort((a, b) => a.damage - b.damage)[0] : players[0];
    const startPlayerIndex = players.indexOf(p);


    // other game settings
    const numberOfCardsPerGame = 7;
    const allplayers = goingToAnotherGame ? players : getShuffledPlayers(npcs, players);
    const cards = getShuffledCards(decks);


    // distrubute the cards
    let cardIndex = 0;
    for (const index in allplayers) {

        // make sure you have empty array of cards
        allplayers[index].cards = [];

        // if going to another game minus the points lose
        if (goingToAnotherGame) allplayers[index].score -= allplayers[index].damage;
        else allplayers[index].score = startpoints || 1000;

        // add cards to players hand
        for (let i = 0; i < numberOfCardsPerGame; i++) allplayers[index].cards.push(cardIndex++)
    }


    // chooose first card on the table
    const cardIndexOnTable = chooseFirstCards(cards.lightCards, allplayers);

    // send settings to everyone
    const settings = {
        countdown: counter,
        players: allplayers,
        area,
        gametime: gametime || 300,
        cards, // {lightCards, darkCards}
        cardIndexOnTable,
        startpoints: startpoints || 1000,
        startPlayerIndex
    };


    return settings;
}


/**
 * Get array of shuffled players
 * @param {Array} npcs - {name, id} 
 * @param {Array} players - {name, socketId} 
 * @returns all of randomized players
 */
function getShuffledPlayers(npcs, players) {
    // {name:string, id, npc: boolean, }
    const list = [];

    // add npcs to list
    for (const npc of npcs) list.push({ ...npc, npc: true, cards: [] });

    // add websocket players to list
    for (const player of players) {
        list.push({
            id: player.socketId,
            name: player.name,
            npc: false,
            cards: []
        });
    }

    // Randomize Players
    const allplayers = []
    while (list.length) {
        const index = parseInt(Math.random() * list.length);
        const [player] = list.splice(index, 1);
        allplayers.push(player);
    }

    return allplayers;
}


/**
 * Get randomized cards
 * @param {Array} npcs - {name, id} 
 * @returns all of randomized cards
 */
function getShuffledCards(decks) {
    const cards = []; // will put all the light mode cards in here in the correct order;
    const cards_dark = [];

    const lightCards = [];
    const darkCards = [];


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
        return { lightCards, darkCards: cards_dark };
    }


    // add all cards number cards
    for (let d = 0; d < decks; d++) {
        for (const color of colors) {
            for (let j = 0; j < 9; j++) {
                cards.push({ type: "number", value: j + 1, color, battleValue: j + 1 })
                cards_dark.push({ type: "number", value: j + 1, color, battleValue: j + 1 })
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

                if (specialCard.dark) cards_dark.push({ ...specialCard });
            }
        }
    }

    //randomize the dark cards
    while (cards_dark.length) {

        // get random index of cards to choose
        const index = parseInt(Math.random() * cards_dark.length);

        // remove card from map
        const [selectedCard] = cards_dark.splice(index, 1);

        darkCards.push(selectedCard);

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

    return { lightCards, darkCards  };
}



/**
 * Get the index of the first number card on the table.
 * @param {Array} npcs - {name, id} 
 * @returns the index of the first number card on the table.
 */
function chooseFirstCards(lightCards, allplayers) {
    /**
     * Choose first card on the table
     * - loops through all the cards
     * - checks if it is a number card
     * - checks if the card already exists in a player hand
     * - the player has the index value of the lightCards array
     * - if the a card is found adds the index of the lightCards in table cards
     * - and sets the current card
     */
    const allCardsInHand = new Set();
    for (const player of allplayers) {
        for (const cardIndex of player.cards) {
            allCardsInHand.add(parseInt(cardIndex));
        }
    }


    for (const cardIndex in lightCards) {
        const i = parseInt(cardIndex)
        if (lightCards[i].type == "number" && !allCardsInHand.has(i)) {
            return parseInt(cardIndex)
        }
    }

    // if a number card is not found if fails
    return -1;
}