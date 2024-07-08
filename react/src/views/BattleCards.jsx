/* eslint-disable no-unused-vars */
import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { ContextData, socket } from "../App";
import { Card } from "../classes/card";
import PlayingCard from '../components/PlayingCard';
import Player from "../classes/player";
import Loading from "../components/Loading";
import COLOURS from "../jsons/colors.json";


// the number seconds a player has to make a play.
const PLAYER_PLAY_TIME = 15;



function BattleCards() {

	// get gameoptions that were saved from GameOptions Page in global variable
	const { gameoptions } = useContext(ContextData);

	// game modes
	const [clockwise, setClockwise] = useState(true);
	const [lightMode, setLightMode] = useState(true);
	const [battleMode, setBattleMode] = useState(false);
	const [colorDemand, setColorDemand] = useState("");
	const [gameOver, setGameOver] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [cardsToPick, setCardsToPick] = useState(0);
	const [chooseColor, setChooseColor] = useState(false);

	// time
	const [gameTime, setGameTime] = useState(gameoptions.game.gametime);
	const [playerTime, setPlayerTime] = useState(PLAYER_PLAY_TIME); // updated in the dispatch reducer function

	// cards
	const [lightCards, setLightCards] = useState(gameoptions.game.lightCards)
	const [darkCards, setDarkCards] = useState(gameoptions.game.darkCards)
	const [cardIndexOnTable, setCardIndexOnTable] = useState(gameoptions.game.cardIndexOnTable);
	const [cardsOnTable, setCardsOnTable] = useState(new Set());

	//players 
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [players, setPlayers] = useState(gameoptions.game.players)

	// get index of this player
	const meIndex = useMemo(() => players.findIndex(p => p.id == socket.id), [players])
	const cards = useMemo(() => players[meIndex].getCards(lightCards, darkCards, lightMode), [players, meIndex, lightCards, darkCards, lightMode]);
	const currentCard = useMemo(() => {
		const l = lightCards[cardIndexOnTable];
		return new Card(l.index, l.type, l.value, l.color, l.battleValue, l.darkId);
	}, [lightCards, cardIndexOnTable]);


	// initialize game timer
	useEffect(() => {
		// tell backend to start a set interval timer
		if (gameoptions.host) socket.emit('starttimer', gameoptions.roomId, gameoptions.game.gametime);
	}, [gameoptions]);



	// listen for websocket
	useEffect(() => {

		// decrements playerTimer
		const t = setInterval(() => {
			const playerCount = gameoptions.game.players.length;
			const index = currentPlayerIndex;
			const room = gameoptions.roomId;
			if (!gameOver) socket.emit('playertime', {
				roomId: room,
				playerTimer: playerTime,
				playerIndex: index,
				playerCount,
				clockwise,
				battleMode,
				lightMode,
				cardsToPick
			});
		}, 1000);

		// game timer
		const onTimer = (time, gameover) => {
			if (time > 0) setGameTime(time);
			if (gameover) setGameOver(true);
		}
		socket.on('ontime', onTimer);

		// on game over
		const onGameOver = () => {
			setGameTime(0);
			setGameOver(true);
			setChooseColor(null);
		}
		socket.on('ongameover', onGameOver);


		// player timer
		const onPlayerTimer = (time, currentPlayer, nextPlayer) => {

			// if the player time is up
			if (time <= 0) {

				// as punishment player has to pick a card for not playing
				// dispatch({ punishment: { playerIndex: currentPlayer } });
				// get all the cards in the players hands
				const allCardsInHand = new Set();
				for (const player of players) {
					for (const cardIndex of Array.from(player.cards.values())) {
						allCardsInHand.add(cardIndex)
					}
				}

				// add all the unplayable cards in set
				allCardsInHand.add(cardIndexOnTable);
				for (const cardIndex of cardsOnTable) allCardsInHand.add(cardIndex);

				// choose a card from list that is not in hand or on the table
				const cardIndex = lightCards.findIndex((l, i) => !allCardsInHand.has(i));

				// add card to player
				players[currentPlayer].cards.add(cardIndex);
				setPlayers([...players]);


				// update time
				setPlayerTime(PLAYER_PLAY_TIME);

				// trigger next player
				setCurrentPlayerIndex(nextPlayer);

				// remove color dialogue
				setChooseColor(null);

			} else setPlayerTime(time);// update time
		}
		socket.on('onplayertime', onPlayerTimer);


		// when a card is picked
		const onPickedCard = (cardIndices, currentPlayerIndex, nextPlayerIndex) => {

			// update player
			for (const cardIndex of cardIndices) players[currentPlayerIndex].cards.add(cardIndex);
			setPlayers([...players])

			// trigger next player
			setCurrentPlayerIndex(nextPlayerIndex);

			// update time
			setPlayerTime(PLAYER_PLAY_TIME);

			// remove color dialogue
			setChooseColor(null);

		}
		socket.on('onpickcard', onPickedCard)


		// when player has played card
		const onPlayCards = (cardIndex, playerIndex, newPlayerIndex, gamestate) => {
			// { lightMode: lightMode, clockwise: clockwise, battleMode, cardsToPick, colorDemand } = gamestate

			// update game state
			setClockwise(gamestate.clockwise);
			setLightMode(gamestate.lightMode);
			setBattleMode(gamestate.battleMode);
			setCardsToPick(gamestate.cardsToPick);
			setColorDemand(gamestate.colorDemand);

			// updates player card in hand and table cards
			cardsOnTable.add(cardIndex)
			const newSetOfCards = new Set();
			for (const i of Array.from(cardsOnTable.values())) newSetOfCards.add(i);
			setCardsOnTable(newSetOfCards);

			// update player
			players[playerIndex].cards.delete(cardIndex);
			setPlayers([...players])

			setCurrentPlayerIndex(newPlayerIndex) // set new player
			setCardIndexOnTable(cardIndex); // update new card
			setPlayerTime(PLAYER_PLAY_TIME); // update time

			// remove color dialogue
			setChooseColor(null);
		}
		socket.on('onplaycard', onPlayCards);


		// there a count down timer in the backend so this will listen for the each second on the count down
		const onLoadGame = (data) => {
			const {
				countdown,
				players,
				area,
				gametime,
				cards, // {lightCards, darkCards}
				cardIndexOnTable,
				startPlayerIndex,
			} = data;


			// start the defining game settings when player option shows up
			if (players) {

				// setup the game options for each player
				const ps = players.map(p => new Player(p.id, p.name, p.npc, p.score, p.cards));
				setPlayers(ps);
				setLightCards(cards.lightCards)
				setDarkCards(cards.darkCards)
				setCardIndexOnTable(cardIndexOnTable) // main card on the table
				setCurrentPlayerIndex(startPlayerIndex);// index of player who won
				setGameTime(gametime)// reset game time.
			}

			// start game
			setCountdown(countdown);
			if (countdown === 0) {

				// default settings for the game
				setClockwise(true);
				setLightMode(true);
				setBattleMode(false);
				setColorDemand("");
				setCardsOnTable(new Set())
				setPlayerTime(PLAYER_PLAY_TIME);
				setCountdown(0);
				setChooseColor(null);


				// reset UI to go back to game
				setGameOver(false);
			}

		}
		socket.on('onloadgame', onLoadGame);

		// on dismount remove listener
		return () => {
			socket.off('ontimer', onTimer);
			socket.off('onplayertime', onPlayerTimer);
			socket.off('onpickcard', onPickedCard);
			socket.off('onplaycard', onPlayCards);
			socket.off('onloadgame', onLoadGame);
			socket.off('ongameover', onGameOver);
			clearInterval(t)
		}
	}, [cardIndexOnTable, lightCards, players, cardsOnTable, playerTime, currentPlayerIndex, gameoptions, gameOver, clockwise, battleMode, lightMode, cardsToPick])


	const onScoreCheck = () => {

	}

	const onTalk = () => {

	}

	const onFlipCards = () => {

	}

	const onLeave = () => {

	}


	/**
	 * Pick a card on the table.
	 */
	const onPick = () => {

		// game is over
		if (gameOver) return;

		// not your turn
		if (meIndex != currentPlayerIndex) return;

		// get all the cards in the players hands
		const allCardsInHand = new Set();
		for (const player of players) {
			for (const cardIndex of Array.from(player.cards.values())) {
				allCardsInHand.add(cardIndex)
			}
		}


		// add all the unplayable cards in set
		allCardsInHand.add(cardIndexOnTable);
		for (const cardIndex of cardsOnTable) allCardsInHand.add(cardIndex);

		// choose a card from list that is not in hand or on the table
		const cardIndex = lightCards.findIndex((l, i) => !allCardsInHand.has(i));

		// send data to websockets
		const data = {
			roomId: gameoptions.roomId,
			cardIndices: [cardIndex],
			playerIndex: currentPlayerIndex,
			playerCount: players.length,
			clockwise,
			battleMode,
			lightMode,
			cardsToPick
		}


		socket.emit('pickcard', data, (cardIndices, currentPlayerIndex, nextPlayerIndex) => {

			// update player
			players[currentPlayerIndex].addCards(...cardIndices);
			setPlayers([...players]);

			// trigger next player
			setCurrentPlayerIndex(nextPlayerIndex);

			// update time
			setPlayerTime(PLAYER_PLAY_TIME);

			// remove color dialogue
			setChooseColor(null);
		})

	}

	/**
	 * Play the choosen card in hand.
	 * @param {Card} card 
	 * @param {boolean} playColorCard if the card type is a iwant/pickuntil it will stop the card being played and open a color dialogue firest
	 */
	const onPlayCard = (card, playColorCard = false) => {

		const cardCount = players[currentPlayerIndex].cards.size;

		// game is over
		if (gameOver) return;

		// not your turn
		if (meIndex != currentPlayerIndex) return;

		// if card is playable
		if (!playableFilter(card)) return alert("Cannot play this card");

		// if the card needs a color
		if (!playColorCard && (card.type === "iwant" || card.type === "pickuntil")) {
			const index = parseInt(Math.random() * COLOURS.length)
			return setChooseColor({ card, color: COLOURS[index] });
		}

		// play the card
		const data = {
			roomId: gameoptions.roomId,
			card: card,
			playerIndex: currentPlayerIndex,
			playerCount: players.length,
			noCards: cardCount == 1,

			// game state
			clockwise,
			battleMode,
			lightMode,
			cardsToPick,
			colorDemand: chooseColor != null ? chooseColor.color : colorDemand
		}


		socket.emit('playcard', data, (cardIndex, playerIndex, newPlayerIndex, gamestate) => {
			// { lightMode: lightMode, clockwise: clockwise, battleMode, cardsToPick, pickcard, colorDemand } = gamestate


			// update game state
			setClockwise(gamestate.clockwise);
			setLightMode(gamestate.lightMode);
			setBattleMode(gamestate.battleMode);
			setCardsToPick(gamestate.cardsToPick);
			setColorDemand(gamestate.colorDemand);

			players[playerIndex].cards.delete(cardIndex);
			setPlayers([...players])

			// updates player card in hand and table cards
			cardsOnTable.add(cardIndex)
			const newSetOfCards = new Set();
			for (const i of Array.from(cardsOnTable.values())) newSetOfCards.add(i);
			setCardsOnTable(newSetOfCards);

			setCurrentPlayerIndex(newPlayerIndex) // set new player
			setCardIndexOnTable(cardIndex); // update new card 
			setPlayerTime(PLAYER_PLAY_TIME); // update time

			// remove color dialogue
			setChooseColor(null);


			// if the player is force to pick a card;
			if (gamestate.pickcard) onPick();
		});

	}


	const onStartNewGame = () => {

		// shuffle & distrubute the cards 
		const options = { ...gameoptions, anothergame: true, players: players.map(p => p.getJSON(lightCards, darkCards, true)), };
		socket.emit('loadgame', options, () => {
			// tell backend to start a set interval timer
			socket.emit('starttimer', gameoptions.roomId, gameoptions.game.gametime + 15);
		});

	}



	const playableFilter = useCallback((playcard) => {

		// get card in hand and playable
		const card = lightMode ? playcard : darkCards[playcard.darkId];
		const tableCard = lightMode ? currentCard : darkCards[currentCard.darkId];

		// if the game is in battle mode
		if (battleMode) return true;

		// logic to filter the cards
		if (tableCard.type === "reversecolor") {
			if (card.type === "number" && card.color != tableCard.color) return false;
			else if (card.type == "jumpcolor" && card.value !== tableCard.value) return false;

		} else if (tableCard.type === "jumpcolor") {

			if (card.type === "number" && card.color != tableCard.color) return false;
			else if (card.type == "reversecolor" && card.value !== tableCard.value) return false;

		} else if (tableCard.type === "number") {

			if (card.type === "number") {
				if (card.value != tableCard.value && card.color != tableCard.color) return false;
			}
			else if (card.type == "reversecolor" && card.value !== tableCard.color) return false;
			else if (card.type == "jumpcolor" && card.value !== tableCard.color) return false;

		} else if (tableCard.type === "iwant" && colorDemand) {
			if (card.type === "number" && card.value !== colorDemand) return false;
			else if (card.type == "reversecolor" && card.value !== colorDemand) return false;
			else if (card.type == "jumpcolor" && card.value !== colorDemand) return false;
		}

		return true;
	}, [currentCard, colorDemand, battleMode, lightMode, darkCards])



	// On Game Over
	if (gameOver) {
		return (
			<div className="w-screen h-screen flex flex-col">
				{countdown ? <Loading countDown={countdown} /> :

					// Game Over Screen
					<div>
						<h1>Game Over</h1>
						{gameoptions.host ? <button onClick={onStartNewGame}>Start New Game</button> : null}
						{players.map(player =>
							<div key={player.id} className="flex flex-col gap-3">
								<span>{player.name}: {player.score} - {player.getPotentialGameEndDamage(lightCards, darkCards)}</span>
								<div className="flex gap-4">
									{player.getCards(lightCards, darkCards, false).map((card, i) =>
										<div key={i} className="flex flex-col gap-3">
											<PlayingCard
												title={card.battleValue}
												isDark={card.isDark()}
												color={card.color}>
												{card.getText()}
											</PlayingCard>
											<div>DMG: {card.battleValue}</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				}
			</div>
		)
	}



	return (
		<div style={{ background: lightMode ? undefined : "darkgray" }} className="w-screen h-screen flex flex-col">

			{/* Players' Info */}
			<section className="fixed top-0 left-0 w-screen">
				<div>{clockwise ? ">>" : "<<"} Direction --- {colorDemand ? colorDemand : null}</div>
				<div className="flex gap-2 p-3">
					{players
						.map((player, index) => {
							if (index == currentPlayerIndex) return { ...player, playing: true, me: meIndex == index }
							else return { ...player, me: meIndex == index }
						})
						.map((player) =>
							<div
								className="shadow p-2 rounded-full w-14 h-14 flex justify-center items-center hover:shadow-lg hover:shadow-slate-300 cursor-pointer duration-500"
								style={{ border: player.playing ? "2px solid gold" : player.me ? "2px solid cyan" : undefined }}
								title={player.name + " (" + player.score + "pts)"}
								key={player.id}>
								{player.name}
							</div>
						)}
				</div>
				<div className="flex gap-5">
					{currentPlayerIndex == meIndex ? <div>Your Turn</div> : null}
					<div>{playerTime}s</div>
				</div>
				<div>Game Time: <div>{gameTime}s</div></div>
			</section>




			{/* Cards on the table */}
			<div className="h-[80vh] flex gap-4 justify-center items-center align-middle">

				{/* Cards thrown */}
				<PlayingCard
					sx={{ fontSize: 60, height: "33%", minWidth: 170 }}
					isDark={currentCard.isDark()}
					color={currentCard.color}>
					{currentCard.getText()}
				</PlayingCard>

				{/* Cards to pick from */}
				<div onClick={onPick} title="Pick Card" className="text-7xl h-1/3 min-w-40 py-5 px-2 flex justify-center items-center rounded-md bg-slate-300 border-slate-700 border-2 cursor-pointer shadow-md hover:shadow-lg hover:bg-slate-400 duration-200">
					🃏
				</div>
			</div>


			{/* Cards in Hand */}
			<div className="w-screen h-[12vh] max-h-[12vh] mb-6">
				<div className="flex justify-center items-center gap-3 overflow-x-scroll w-[95vw]">
					{cards.map(card =>
						<PlayingCard
							onPlay={() => onPlayCard(card)}
							key={card.index}
							isDark={card.isDark()}
							color={card.color}>
							{card.getText()}
						</PlayingCard>
					)}
				</div>
			</div>

			{/* Bottom buttons options */}
			<div className="w-screen max-h-[5vh] h-[5vh]">
				<div className="flex gap-4 justify-center items-center">
					<button onClick={onScoreCheck} title="Score Check" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📃 Score</button>
					<button onClick={onTalk} title="Talk" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">🎤 Talk</button>
					<button onClick={onFlipCards} title="Flip Cards" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">🎤 Flip</button>
					<button onClick={onLeave} title="Leave" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📴 Leave</button>
				</div>
			</div>

			{/* Choose Color Dialogue */}
			{chooseColor != null && <dialog open={chooseColor} style={{ background: "none" }} onClose={() => setChooseColor(null)}>
				<div className="w-screen h-screen bg-[#1c1c1cbf] flex flex-col items-center justify-center">
					<p className="text-white text-3xl my-4 text-center">Choose a Color</p>
					<div className="mx-4 justify-center p-4 flex gap-4 ">
						{COLOURS.map(color =>
							<button
								key={color}
								style={{ background: color, border: color == chooseColor.color ? "6px solid white" : undefined }}
								className="rounded-full p-8 shadow-md hover:shadow-2xl duration-200"
								onClick={() => {
									setChooseColor({ ...chooseColor, color });
									onPlayCard(chooseColor.card, true);
								}}>
							</button>
						)}
					</div>
					<p className="text-white text-lg italic my-4 text-center">Press ESC to cancel</p>
				</div>
			</dialog>}

		</div>
	)
}

export default BattleCards