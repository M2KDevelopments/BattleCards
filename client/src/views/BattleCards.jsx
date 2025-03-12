/* eslint-disable no-unused-vars */
import { useContext, useEffect, useMemo, useState, useCallback, useReducer } from "react";
import { ContextData, socket } from "../App";
import { Card } from "../classes/card";
import PlayingCard from '../components/PlayingCard';
import Player from "../classes/player";
import Loading from "../components/Loading";
import COLOURS from "../jsons/colors.json";
import DarkOverlay from "../components/DarkOverlay";
import CHARACTERS from '../jsons/characters.json';
import Confetti from 'react-confetti'
import KeyboardAudio from "../components/KeyboardAudio";
import { toast } from 'react-toastify';

// the number seconds a player has to make a play.
const PLAYER_PLAY_TIME = 15;

// Game Over Options
const GAMEOVER_RESULTS = 1;
const GAMEOVER_CHAT = 2
const GAMEOVER_STANDINGS = 3;

function BattleCards() {

	// get gameoptions that were saved from GameOptions Page in global variable
	const { gameoptions } = useContext(ContextData);

	// game modes
	const [clockwise, setClockwise] = useState(true);
	const [lightMode, setLightMode] = useState(true);
	const [battleMode, setBattleMode] = useState(false);
	const [colorDemand, setColorDemand] = useState("");
	const [gameOver, setGameOver] = useState(false);
	const [gameOverMode, setGameOverMode] = useState(GAMEOVER_STANDINGS);
	const [countdown, setCountdown] = useState(0);
	const [cardsToPick, setCardsToPick] = useState(0);
	const [pickUntil, setPickUntil] = useState([]);
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

	// useReducer to be used for multiple or complicated useStates
	const reducer = (state, action) => {
		// adding a new chat message
		if (action.chat) return { ...state, chats: [...state.chats, action.chat] };
		return state;
	}
	const [state, dispatch] = useReducer(reducer, { chats: [] })


	// get index of this player
	const meIndex = useMemo(() => players.findIndex(p => p.id == socket.id), [players])
	const cards = useMemo(() => players[meIndex].getCards(lightCards, darkCards, lightMode), [players, meIndex, lightCards, darkCards, lightMode]);
	const currentCard = useMemo(() => {
		const l = lightCards[cardIndexOnTable];
		return new Card(l.index, l.type, l.value, l.color, l.battleValue, l.darkId);
	}, [lightCards, cardIndexOnTable]);


	const playerIcons = useMemo(() => {
		const map = new Map();
		for (const person of players) {
			const c = CHARACTERS.find(c => c.name === person.name);
			map.set(person.name, { ...person, id: c.id, image: `avatars/${c.id}.jpeg`, banner: `banners/${c.id}.png` })
		}
		return map;
	}, [players])


	useEffect(() => {
		document.body.style.backgroundColor = '#e9e9e9';
		document.body.style.backgroundRepeat = 'no-repeat';
		document.body.style.backgroundSize = '100%';
		document.body.style.background
		document.body.style.overflow = 'hidden';
	}, [])


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
				cardsToPick,
				pickUntil
			});
		}, 1000);


		// game timer
		const onTimer = (time, gameover) => {
			const audioMenu = document.getElementById("main-audio");
			if (time > 0) setGameTime(time);
			else setGameTime(0);

			if (time == 60) audioMenu.src = "music/time.mp3";

			if (gameover && !battleMode) {
				setGameOver(true);
				const audio = document.getElementById("gameover-audio");
				audio.play();
				audioMenu.pause();
				audioMenu.src = "music/menu.mp3";
			}
			// play game ending sound
		}
		socket.on('ontime', onTimer);

		// on game over
		const onGameOver = () => {
			setGameTime(0);
			setGameOver(true);
			setChooseColor(null);
			const audio = new Audio(`music/gameover.mp3`);
			audio.play();
			audio.onended = () => audio.remove();
		}
		socket.on('ongameover', onGameOver);


		// player timer
		const onPlayerTimer = (time, currentPlayer, nextPlayer, cardsToPick, pickUntilCards) => {

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

				// choose cards from list that is not in hand or on the table
				const cardIndices = [];
				for (let i = 0; i < (cardsToPick || 1); i++) {
					const cardIndex = lightCards.findIndex((l, i) => !allCardsInHand.has(i));
					if (cardIndex != -1) {
						allCardsInHand.add(cardIndex);
						cardIndices.push(cardIndex);
					}
				}


				// add pick until color cards.
				for (const color of pickUntilCards) {
					for (const i in lightCards) {
						const lCard = lightCards[i]
						const dCard = darkCards[lCard.darkId];

						if (allCardsInHand.has(i)) continue;

						allCardsInHand.add(i);
						cardIndices.push(i);

						if (dCard.color == color) break;
					}
				}

				// add card to player
				players[currentPlayer].addCards(...cardIndices);
				setPlayers([...players]);


				// play help sound
				if (cardIndices.length >= 10) {
					const name = players[currentPlayer].name;
					const p = CHARACTERS.find(c => c.name === name);
					const text = `${name} got punished`
					onSound("audio", `${p.id}-help`, text)
				} else onSound("sound", `next`, "")


				// update time
				setPlayerTime(PLAYER_PLAY_TIME);

				// trigger next player
				setCurrentPlayerIndex(nextPlayer);

				// remove color dialogue
				setChooseColor(null);

				// pick until color cards 
				setPickUntil([]);

				// no more cards in battle mode
				setCardsToPick(0);

				// disable battle
				setBattleMode(false)


			} else setPlayerTime(time);// update time
		}
		socket.on('onplayertime', onPlayerTimer);


		// when a card is picked
		const onPickedCard = (cardIndices, currentPlayerIndex, nextPlayerIndex, continueBattle) => {

			// update player
			for (const cardIndex of cardIndices) players[currentPlayerIndex].cards.add(cardIndex);
			setPlayers([...players])

			// trigger next player
			setCurrentPlayerIndex(nextPlayerIndex);

			// update time
			setPlayerTime(PLAYER_PLAY_TIME);

			// remove color dialogue
			setChooseColor(null);

			// Set Cards to Pick to 0
			setCardsToPick(0);

			// Disable Battle Mode
			setBattleMode(false);

			// Disable Battle Mode
			if (!continueBattle) setBattleMode(false);

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


		function onSound(folder, sound, text) {
			const audio = new Audio(`${folder}/${sound}.mp3`);
			audio.play();
			audio.onended = () => audio.remove();
			if (text) toast(`${text}`);
		}
		socket.on('onsound', onSound);


		// when message comes in data = {chat: {name, message}}
		const onChat = (data) => dispatch({ chat: data.chat })
		socket.on('onchat', onChat);


		// on dismount remove listener
		return () => {
			socket.off('ontimer', onTimer);
			socket.off('onplayertime', onPlayerTimer);
			socket.off('onpickcard', onPickedCard);
			socket.off('onplaycard', onPlayCards);
			socket.off('onloadgame', onLoadGame);
			socket.off('ongameover', onGameOver);
			socket.off('onsound', onSound);
			socket.off('onchat', onChat);
			clearInterval(t)
		}
	}, [cardIndexOnTable, lightCards, darkCards, players, cardsOnTable,
		playerTime, currentPlayerIndex, gameoptions, gameOver, clockwise,
		battleMode, lightMode, cardsToPick, pickUntil
	]);



	const onSendMessageToChat = (e) => {
		//prevenet form for submitting and refreshing
		e.preventDefault();

		// get message
		const message = e.target.chat.value;

		// send message via websockets to a room
		socket.emit('chat', { name: gameoptions.playername, message: message, roomId: gameoptions.roomId }, dispatch);

		e.target.chat.value = "";
	}


	/**
	 * Pick a card on the table.
	 */
	const onPick = (continueBattle = false) => {

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

		// choose cards from list that is not in hand or on the table
		const cardIndices = []
		for (let i = 0; i < (cardsToPick || 1); i++) {
			const cardIndex = lightCards.findIndex((l, i) => !allCardsInHand.has(i));
			if (cardIndex != -1) {
				allCardsInHand.add(cardIndex);
				cardIndices.push(cardIndex);
			}

		}

		// add pick until color cards.
		for (const color of pickUntil) {
			for (const i in lightCards) {
				const lCard = lightCards[i]
				const dCard = darkCards[lCard.darkId];

				if (allCardsInHand.has(i)) continue;

				allCardsInHand.add(i);
				cardIndices.push(i);

				if (dCard.color == color) break;
			}
		}

		// send data to websockets
		const data = {
			roomId: gameoptions.roomId,
			cardIndices: cardIndices,
			playerIndex: currentPlayerIndex,
			playerCount: players.length,
			clockwise,
			battleMode,
			continueBattle,
			pickUntil,
			lightMode,
			cardsToPick,
		}


		socket.emit('pickcard', data, (cardIndices, currentPlayerIndex, nextPlayerIndex, continueBattle) => {



			// update player
			players[currentPlayerIndex].addCards(...cardIndices);
			setPlayers([...players]);

			// play help sound
			if (cardIndices.length >= 10) {
				const name = players[currentPlayerIndex].name;
				const p = CHARACTERS.find(c => c.name === name);
				const text = `${name} got punished`
				socket.emit('sound', { folder: "audio", sound: `${p.id}-help`, text: text, roomId: gameoptions.roomId });
			} else {
				socket.emit('sound', { folder: "sound", sound: "next", text: "", roomId: gameoptions.roomId });
			}

			// trigger next player
			setCurrentPlayerIndex(nextPlayerIndex);

			// update time
			setPlayerTime(PLAYER_PLAY_TIME);

			// remove color dialogue
			setChooseColor(null);

			setPickUntil([]);

			// Set Cards to Pick to 0
			setCardsToPick(0);

			// Disable Battle Mode
			if (!continueBattle) setBattleMode(false);

		})
	}

	/**
	 * Play the choosen card in hand.
	 * @param {Card} card 
	 * @param {boolean} playColorCard if the card type is a iwant/pickuntil it will stop the card being played and open a color dialogue firest
	 */
	const onPlayCard = (card, playColorCard = null) => {

		const cardCount = players[currentPlayerIndex].cards.size;

		// game is over
		if (gameOver) return;

		// not your turn
		if (meIndex != currentPlayerIndex) return;

		// if card is playable
		if (!playableFilter(card)) return toast.warning("Cannot play this card");

		// if the card needs a color
		if (!playColorCard && (card.type === "iwant" || card.type === "pickuntil")) {
			const index = parseInt(Math.random() * COLOURS.length)
			return setChooseColor({ card, color: COLOURS[index] });
		}

		//pick until
		const pickCardsUntilColor = [...pickUntil]
		if (playColorCard && card.type === "pickuntil") {
			pickCardsUntilColor.push(playColorCard)
			setChooseColor(null)
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
			pickUntil: pickCardsUntilColor,
			colorDemand: playColorCard && card.type != "pickuntil" ? playColorCard : ""
		}


		socket.emit('playcard', data, (cardIndex, playerIndex, newPlayerIndex, gamestate) => {
			// { lightMode: lightMode, clockwise: clockwise, battleMode, cardsToPick, pickcard, colorDemand } = gamestate


			// send sound
			if (battleMode) {
				if (card.type == 'reverse') {
					socket.emit('sound', { folder: "sound", sound: "reverse", text: "", roomId: gameoptions.roomId });
				} else if (card.type == 'flip') {
					socket.emit('sound', { folder: "sound", sound: "flip", text: "", roomId: gameoptions.roomId });
				} else if (card.type == 'jump') {
					socket.emit('sound', { folder: "sound", sound: "jump", text: "", roomId: gameoptions.roomId });
				} else if (card.type == 'pick' && ((cardsToPick % 10) + card.value) >= 10) {
					socket.emit('sound', { folder: "sound", sound: "toomuch", text: "", roomId: gameoptions.roomId });
				} else socket.emit('sound', { folder: "sound", sound: "next", text: "", roomId: gameoptions.roomId });
			} else {
				if (card.type == 'pick' && card.value == 2) {
					socket.emit('sound', { folder: "sound", sound: "plus2", text: `🔥 ${players[currentPlayerIndex].name} has started the battle`, roomId: gameoptions.roomId });
				} else if (card.type == 'pick') {
					socket.emit('sound', { folder: "sound", sound: "pick", text: `🔥 ${players[currentPlayerIndex].name} has started the battle`, roomId: gameoptions.roomId });
				} else if (card.type == 'flip') {
					socket.emit('sound', { folder: "sound", sound: "transition", text: "", roomId: gameoptions.roomId });
				} else socket.emit('sound', { folder: "sound", sound: "next", text: "", roomId: gameoptions.roomId });
			}


			// update game state
			setClockwise(gamestate.clockwise);
			setLightMode(gamestate.lightMode);
			setBattleMode(gamestate.battleMode);
			setCardsToPick(gamestate.cardsToPick);
			setColorDemand(gamestate.colorDemand);
			setPickUntil(gamestate?.pickUntil || []);

			players[playerIndex].cards.delete(cardIndex);
			setPlayers([...players])

			// Notify player that this play is on one card
			if (players[playerIndex].cards.size == 1) {

				setTimeout(() => {
					socket.emit('sound', { folder: "sound", sound: "onecard", text: `${players[playerIndex].name} is on one card`, roomId: gameoptions.roomId });
				}, 300);
			}


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
			if (gamestate.pickcard) onPick(true);
		});

	}


	const onStartNewGame = () => {

		// shuffle & distrubute the cards 
		const options = { ...gameoptions, anothergame: true, players: players.map(p => p.getJSON(lightCards, darkCards, true)), };
		socket.emit('loadgame', options, () => {
			// tell backend to start a set interval timer
			console.log('Time', gameoptions.game.gametime + 15);
			socket.emit('starttimer', gameoptions.roomId, gameoptions.game.gametime + 15);
		});

	}



	const playableFilter = useCallback(
		/**
			 * Play the choosen card in hand. It could be light/dark
			 * @param {Card} playcard 
		*/
		(playcard) => {

			// get card in hand and playable
			const card = lightMode ? playcard : darkCards[lightCards[playcard.index].darkId];
			const tableCard = lightMode ? currentCard : darkCards[currentCard.darkId];

			// if the game is in battle mode
			if (battleMode) {
				if (card.type === "number" && tableCard.type !== "iwant") return false;

				// all other cards are allowed
				return true;

			} else {
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
					if (card.type === "number" && card.color !== colorDemand) return false;
					else if (card.type == "reversecolor" && card.color !== colorDemand) return false;
					else if (card.type == "jumpcolor" && card.color !== colorDemand) return false;
				}
			}

			return true;
		}, [currentCard, colorDemand, battleMode, lightMode, darkCards, lightCards])



	// On Game Over
	if (gameOver) {
		return (
			<div className="w-screen h-screen flex flex-col" style={{ backgroundImage: `url(areas/${gameoptions.game.area}.jpeg)`, backgroundSize: '100%', overflow: 'hidden' }}>
				{countdown ? <Loading area={gameoptions.game.area} countDown={countdown} /> :

					// Game Over Screen
					<div className="h-full w-full">
						<DarkOverlay color="#00000077" />
						<KeyboardAudio name={players[meIndex].name} roomId={gameoptions.roomId} />
						<div className="z-20 relative w-full mx-auto"><Confetti width={800} height={600} /></div>
						<div className="flex flex-col gap-3 items-center p-4" >
							<h1 className="phone:text-3xl tablet:text-4xl laptop:text-7xl text-white z-10 relative">Game Over</h1>
							<div className="flex gap-2">
								{gameoptions.host ? <button className="bg-pink-700 mobile:p-1 phone:p-1 tablet:p-4 rounded-sm cursor-pointer text-white hover:bg-amber-600 relative z-10" onClick={onStartNewGame}>New Match</button> : null}
								<button className="bg-pink-700 mobile:p-1 phone:p-1 tablet:p-4 rounded-sm cursor-pointer text-white hover:bg-amber-600 relative z-10" onClick={() => setGameOverMode(GAMEOVER_CHAT)}>Chat ({state.chats.length})</button>
								<button className="bg-pink-700 mobile:p-1 phone:p-1 tablet:p-4 rounded-sm cursor-pointer text-white hover:bg-amber-600 relative z-10" onClick={() => setGameOverMode(GAMEOVER_STANDINGS)}>Standings</button>
								<button className="bg-pink-700 mobile:p-1 phone:p-1 tablet:p-4 rounded-sm cursor-pointer text-white hover:bg-amber-600 relative z-10" onClick={() => setGameOverMode(GAMEOVER_RESULTS)}>Results</button>
							</div>


							{/* Game Chat */}
							{gameOverMode == GAMEOVER_CHAT ? <div className="flex flex-col w-full">
								{/* Show the chat message */}
								<div className="mobile:h-[400px] mobile:max-h-[400px] phone:h-[400px] phone:max-h-[400px] phone-xl:h-[400px] phone-xl:max-h-[500px] tablet-xl:h-[500px] tablet:max-h-[700px] overflow-y-scroll bg-[#39393962] z-10 relative mx-8 flex flex-col gap-1 p-2">
									{state.chats.reverse().map((chat, index) =>
										<h6 key={index} className="flex gap-2 items-center">
											<img src={playerIcons.get(chat.name).image} alt={chat.name} className="w-8 h-8 rounded-full" />
											<b style={{ color: playerIcons.get(chat.name).color }} className="text-pink-200">{chat.name}: </b>
											<span className="text-white">{chat.message}</span>
										</h6>)}
								</div>

								{/* Submit a message to the lobby */}
								<form onSubmit={onSendMessageToChat} className="w-full flex z-10 relative px-8 py-3">
									<input className="w-full p-4 rounded-s-md text-white bg-[#3b3b3b8b]" type="text" required name="chat" maxLength={300} placeholder="Enter your t̶o̶x̶i̶c̶  message here..." />
									<button className="bg-pink-900 p-2 rounded-e-md text-white hover:bg-purple-700 duration-500 cursor-pointer" type="submit">Send Message</button>
								</form>

							</div> : null}


							{/* Standings */}
							{gameOverMode == GAMEOVER_STANDINGS ? <div className="relative z-10 mobile:p-1 phone:p-1 tablet:p-1 laptop:p-8 flex flex-col overflow-y-scroll w-full">

								{players
									.sort((a, b) => (b.score - b.getPotentialGameEndDamage(lightCards, darkCards)) - (a.score - a.getPotentialGameEndDamage(lightCards, darkCards)))
									.map((player, index) =>
										<div className="relative flex items-center gap-2" key={player.id}>
											<span className="text-[12px] bg-amber-700 text-white py-1 px-2 rounded-lg" >{index + 1}</span>
											<div
												className="shadow p-2 rounded-full phone:w-10 phone:h-10 mobile:w-10 mobile:h-10 tablet:w-10 tablet:h-10 laptop:w-28 laptop:h-28 flex justify-center items-center hover:shadow-lg hover:shadow-slate-300 cursor-pointer duration-500"
												style={{ backgroundImage: `url(${playerIcons.get(player.name).image})`, backgroundSize: '100%', overflow: 'hidden' }}
												title={player.name + " (" + player.score + "pts)"}
											>
											</div>
											<span className="text-[12px] bg-slate-700 text-white py-1 px-2 rounded-lg">{player.name}: {player.score} - {player.getPotentialGameEndDamage(lightCards, darkCards)} = {player.score - player.getPotentialGameEndDamage(lightCards, darkCards)}</span>
											{
												players.sort((a, b) => a.getPotentialGameEndDamage(lightCards, darkCards) - b.getPotentialGameEndDamage(lightCards, darkCards))[0] == player ?
													<span className="text-[12px] bg-slate-700 text-amber-500 font-extrabold py-1 px-2 rounded-lg">Winner!!!</span>
													: null
											}
										</div>
									)}

							</div> : null}


							{/* Game Results */}
							{gameOverMode == GAMEOVER_RESULTS ? <div className="flex flex-col gap-2 bg-[#000000ad] z-20 h-[500px] overflow-scroll w-full">
								{players
									.sort((a, b) => a.getPotentialGameEndDamage(lightCards, darkCards) - b.getPotentialGameEndDamage(lightCards, darkCards))
									.map((player, index) =>
										<div key={player.id} className="flex gap-3">
											<div
												className="shadow p-2 rounded-full w-14 h-14 flex justify-center items-center hover:shadow-lg hover:shadow-slate-300 cursor-pointer duration-500"
												style={{ backgroundImage: `url(${playerIcons.get(player.name).image})`, backgroundSize: '100%', overflow: 'hidden' }}
												title={player.name + " (" + player.score + "pts)"}
											>
											</div>
											<div className="flex gap-4">
												{player.getCards(lightCards, darkCards, false).map((card, i) =>
													<div key={i} className="flex flex-col gap-3 ">
														<PlayingCard
															title={card.battleValue}
															isDark={card.isDark()}
															color={card.color}>
															<img className="w-10 h-10" src={`/cards/${card.getImage(null, false)}`} />
														</PlayingCard>
														<div className="text-white">DMG: {card.battleValue}</div>
													</div>
												)}
											</div>
										</div>
									)}
							</div> : null}
						</div>

						{/* Show Main Character */}
						<div
							className='w-[40vw] h-[40vw] fixed bottom-0 right-0 drop-shadow-2xl shadow-white'
							style={{
								backgroundImage: `url(${playerIcons.get(players.sort((a, b) => a.getPotentialGameEndDamage(lightCards, darkCards) - b.getPotentialGameEndDamage(lightCards, darkCards))[0].name).banner
									})`,
								backgroundRepeat: 'no-repeat', backgroundSize: '100%', overflow: 'hidden'
							}}>

						</div>
					</div>

				}
			</div >
		)
	}



	return (
		<div>
			<DarkOverlay color="#00000077" />
			<KeyboardAudio name={players[meIndex].name} roomId={gameoptions.roomId} turnbased={true} myturn={currentPlayerIndex == meIndex} />
			<div style={{ backgroundImage: `url(areas/${gameoptions.game.area}.jpeg)`, backgroundSize: '100%', overflow: 'hidden' }} className="w-screen h-screen flex flex-col">

				{/* Game Info */}
				<div className="flex items-center justify-end gap-4 pt-8">
					{currentPlayerIndex == meIndex ?
						<div className="text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-amber-400 text-white">Your Turn: <b>{playerTime}s</b></div>
						:
						<div className="text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-blue-700 text-white">Wait Time: {playerTime}s</div>}
					<div style={{ display: ((gameoptions.gametime - gameTime <= 30) || (gameTime <= 60)) ? "block" : "none" }} className="text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-blue-700 text-white">Game Time: <b>{gameTime}s</b></div>
				</div>


				{/* Players' Info */}
				<section className="fixed top-0 left-0 w-screen z-10 text-white">
					<div className="flex gap-2 p-3 items-center">
						<span className="text-6xl">{clockwise ? "👉" : "👈"}</span>
						{players
							.map((player, index) => {
								const image = playerIcons.get(player.name).image;
								if (index == currentPlayerIndex) return { ...player, playing: true, me: meIndex == index, image }
								else return { ...player, me: meIndex == index, image }
							})
							.map((player) =>
								<div className="flex flex-col items-center gap-2" key={player.id}>
									<div
										className="shadow p-2 rounded-full w-14 h-14 flex justify-center items-center hover:shadow-lg hover:shadow-slate-300 cursor-pointer duration-500"
										style={{ border: player.playing ? "2px solid gold" : player.me ? "5px solid cyan" : undefined, backgroundImage: `url(${player.image})`, backgroundSize: '100%', overflow: 'hidden' }}
										title={player.name + " (" + player.score + "pts)"}
									>
									</div>
									<span style={{ background: player.playing ? "#ca8a04" : "#334155" }} className="text-[12px] text-white py-1 px-2 rounded-lg">{player.name}: ({player.score + "pts"})</span>
									<span style={{ background: player.cards.size == 1 ? " #db2777" : "#2563eb" }} className="text-[12px] text-white py-1 px-2 rounded-lg">{player.cards.size} Cards</span>

								</div>
							)}
					</div>

				</section>




				{/* Cards on the table */}
				<div className="h-[80vh] flex gap-4 justify-center items-center align-middle">

					{/* Cards thrown */}
					<PlayingCard
						sx={{ fontSize: 60, height: "33%", minWidth: 170 }}
						isDark={!lightMode}
						colorDemand={colorDemand}
						color={lightMode ? currentCard.color : darkCards[currentCard.darkId].color}>
						<img className="w-20 h-20" src={`/cards/${lightMode ? currentCard.getImage(null, battleMode) : currentCard.getImage(darkCards, battleMode)}`} />
					</PlayingCard>

					{/* Cards to pick from */}
					<div role="button" onClick={() => onPick()} title="Pick Card" className="relative text-7xl h-1/3 min-w-40 py-5 px-2 flex justify-center items-center rounded-md bg-slate-300 border-slate-700 border-2 cursor-pointer shadow-md hover:shadow-lg hover:bg-slate-400 duration-200">
						🃏
						{cardsToPick ? <span className="bg-slate-600 flex items-center justify-center text-center -top-5 -right-5 absolute shadow-3xl shadow-white border-2 border-white p-3 rounded-2xl text-white text-4xl"><b>{cardsToPick}</b><b>🃏</b></span> : null}
						{pickUntil.length ?
							<div className="flex gap-2 relative bottom-2 left-0">
								{pickUntil.map((color, index) => <span title={"Pick Until " + color} style={{ background: color }} key={color + index} className="w-10 h-10 rounded shadow-xl"></span>)}
							</div>
							: null}
					</div>
				</div>




				{/* Cards in Hand */}
				<div className="w-screen h-[12vh] max-h-[12vh] mb-8">
					<div className="flex justify-center items-center gap-3 overflow-x-scroll w-[95vw]">
						{cards.map(card =>
							<PlayingCard
								onPlay={() => onPlayCard(card)}
								key={card.index}
								colorDemand={false}
								isDark={!lightMode}
								color={card.color}>
								<img className="w-10 h-10" src={`/cards/${lightMode ? card.getImage(null, battleMode) : card.getImage(null, battleMode)}`} />
							</PlayingCard>
						)}
					</div>
				</div>



				{/* Bottom buttons options */}
				{/* <div className="w-screen max-h-[5vh] h-[5vh]">
				<div className="flex gap-4 justify-center items-center">
					<button onClick={onScoreCheck} title="Score Check" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📃 Score</button>
					<button onClick={onTalk} title="Talk" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">🎤 Talk</button>
					<button onClick={onFlipCards} title="Flip Cards" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">🎤 Flip</button>
					<button onClick={onLeave} title="Leave" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📴 Leave</button>
				</div>
			</div> */}



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
										onPlayCard(chooseColor.card, color);
									}}>
								</button>
							)}
						</div>
						<p className="text-white text-lg italic my-4 text-center">Press ESC to cancel</p>
					</div>
				</dialog>}

			</div>
		</div>
	)
}

export default BattleCards