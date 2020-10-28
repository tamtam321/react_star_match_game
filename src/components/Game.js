import React, { useState, useEffect } from 'react';

import StarsDisplay from "./StarsDisplay";
import PlayNumber from "./PlayNumber";
import PlayAgain from "./PlayAgain";
import utils from "../math-utils";

// Custom Hook
const useGameState = () =>
{
  // Csillagok random megjelenése
  const [stars, setStars] = useState(utils.random(1, 9));

  // Választható számok
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9));

  // Kijelölt számok
  const [candidateNums, setCandidateNums] = useState([]);

  // Visszaszámláló
  const [secondsLeft, setSecondsLeft] = useState(10);
  
  // Minden egyes renderelésnél useEffect meghívódik. Ha még nem telt le az idő és még van válaszható szám, akkor az időzítő 1-gyel csökken.
  useEffect(() =>
  {
    if(secondsLeft > 0 && availableNums.length > 0)
    {
      const timerId = setTimeout(() =>
      {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  });

  // Ha a kijelölt számok összege nem egyenlő a csillagok számával, akkor számon tartom, hogy mik vannak eddig kijelölve. Ha meg egyenlő, akkor a szabad számok tömbből kiveszem ami már nem szabad a filterrel.
  // utils.randomSumIn függvénnyel kiszámítom a következő csillagok számát, amit megjeleníthetek. Aztán frissítem az elérhető számokat és a kijelölteket nullázom.
  const setGameState = (newCandidateNums) =>
  {
    if(utils.sum(newCandidateNums) !== stars)
    {
      setCandidateNums(newCandidateNums);
    }
    else
    {
      const newAvailableNums = availableNums.filter
      (
        n => !newCandidateNums.includes(n)
      );
      setStars(utils.randomSumIn(newAvailableNums, 9));
      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
    }
  };

  return { stars, availableNums, candidateNums, secondsLeft, setGameState };
};


const Game = (props) => 
{
  // useGameState hook metódussal figyeljük a játék állapotát. Hány csillagot jelenítsünk meg, mik a szabad, foglalt és a kijelölt számok, időzítő és a GameState azonosítójának a beállító fv-e.
  const {stars, availableNums, candidateNums, secondsLeft, setGameState} = useGameState();

  // Ha a kiválasztott számok összege nagyobb, mint a csillagok száma, akkor rosszul választottunk.
  const candidatesAreWrong = utils.sum(candidateNums) > stars;

  // Ha nincs több szabad szám, akkor nyertünk. Vagy ha van, de lejárt az idő, akkor vesztettünk. Ha egyik sem, akkor még aktív a játék.
  const gameStatus = availableNums.length === 0 ? 
    "won" : 
    secondsLeft === 0 ? "lost" : "active";

  // Számok státusza: 
    // ha nem szabad, akkor már használt
    // ha a kiválasztottak között van, akkor  azok rosszak e vagy még nem elég
    // ha egyik sem akkor szabad
  const numberStatus = (number) =>
  {
    if(!availableNums.includes(number))
    {
      return "used";
    }
    if(candidateNums.includes(number))
    {
      return candidatesAreWrong ? "wrong" : "candidate";
    }
    return "available";
  };

  // Szám kattintó esemény
  const onNumberClick = (number, currentStatus) =>
  {
    // Ha a játék nem aktív vagy kattintott szám már használt, 
    // akkor ne történjen semmi.
    if(gameStatus !== "active" || currentStatus === "used")
    {
      return;
    }

    // Ha szabad a szám, akkor rakjuk a kijelöltek közé. Ha meg a szám státusza kijelölt vagy rossz, akkor filter metódussal vegyük ki a kijelöltek közül, mert már meg van jelölve és ha újra rákattintunk akkor feloldjuk.
    const newCandidateNums = 
      currentStatus === "available" ?
        candidateNums.concat(number) :
        candidateNums.filter(cn => cn !== number);

    // Aztán setGameState-tel megnézzük, hogy az eddig kijelöltek jók-e.
    // Ha összegük egyenlő a csillagok számával, akkor generálj új csillagok számát és legyen valid.
    // Ha nem egyezik, akkor csak legyen az új kijelölt tömb. 
    setGameState(newCandidateNums);
  };

  // html & components
  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {
            gameStatus !== "active" ? 
              (<PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />) :
              (<StarsDisplay count={stars} />)
          }
        </div>
        <div className="right">
          {utils.range(1, 9).map(number =>
            <PlayNumber 
              key={number}
              status={numberStatus(number)}
              number={number} 
              onClick={onNumberClick}
            />
          )}
        </div>
      </div>
          <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

export default Game;