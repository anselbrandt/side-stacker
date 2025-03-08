import { useState, useEffect } from "react";
import "./App.css";
import { API_URL } from "./constants";
import { getValidMoves, isValid } from "./utils";

interface Game {
  id: number;
  owner: number;
  board: [][];
  expires: number;
}

interface Coordinates {
  i: number;
  j: number;
}

type Symbol = "X" | "O" | undefined;
interface Cell {
  coordinates: Coordinates;
  symbol?: Symbol;
}

interface User {
  name: string;
  id: number;
}

function App() {
  const [user, setUser] = useState<User>();
  const [gameId, setGameId] = useState<number>();
  const [board, setBoard] = useState<Cell[][]>();
  const [player, setPlayer] = useState<Symbol>("X");
  const [validMoves, setValidMoves] = useState<[number, number][]>();

  useEffect(() => {
    async function login() {
      const handleLogin = async () => {
        const response = await fetch(`${API_URL}/login`);
        const user = (await response.json()) as User;
        setUser(user);
      };
      await handleLogin();
    }

    login();
  }, []);

  const updateGame = (game: Game) => {
    setGameId(game.id);
    const gameboard = game.board.map((row, i) =>
      row.map((val, j) => ({ coordinates: { i, j }, symbol: val }))
    );
    setBoard(gameboard);
    const valid = getValidMoves(game.board);
    setValidMoves(valid);
  };

  useEffect(() => {
    async function getGame() {
      const handleGetGame = async () => {
        if (!user) return;
        const response = await fetch(`${API_URL}/board`);
        const game = (await response.json()) as Game;
        updateGame(game);
      };
      await handleGetGame();
    }

    getGame();
  }, [user]);

  const handleMove = async (cell: Cell) => {
    const { i, j } = cell.coordinates;
    if (!validMoves) return;
    if (!isValid(validMoves, [i, j])) return;
    const payload = {
      ...cell.coordinates,
      id: gameId,
      player,
    };
    const response = await fetch(`${API_URL}/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const game = (await response.json()) as Game;
    updateGame(game);
  };

  const isOccupied = (cell: Cell) => cell.symbol !== null;

  const cellStyle = (cell: Cell) => {
    if (isOccupied(cell)) return "bg-white";
    const { i, j } = cell.coordinates;
    if (validMoves && isValid(validMoves, [i, j])) {
      return "bg-white hover:cursor-pointer hover:outline hover:outline-orange-500";
    } else {
      return "bg-zinc-100";
    }
  };

  const symbolColor = (symbol: Symbol) => {
    if (symbol === "X") {
      return "bg-sky-700";
    }
    if (symbol === "O") {
      return "bg-orange-500";
    }
    return "";
  };

  const handleSwitchPlayer = () => {
    setPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  const handleRestart = async () => {
    alert("Are you sure?");
    const response = await fetch(`${API_URL}/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: gameId }),
    });
    const game = (await response.json()) as Game;
    updateGame(game);
  };

  return (
    <>
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
        <div className="text-4xl [word-spacing: 2px] font-mono font-bold text-slate-500">
          Side Stacker
        </div>
        <div className="text-md font-mono font-medium text-slate-500">
          Connect Four, but sideways.
        </div>
        <div className="m-2 my-8 text-2xl font-mono tracking-tight font-medium text-slate-500">
          Hello, {user?.name}!
        </div>
        <div className="m-2">
          <div className="grid grid-cols-7 gap-2">
            {board?.flat().map((cell, i) => (
              <div
                key={i}
                className={`w-11 h-11 rounded-md drop-shadow-md flex items-center justify-center ${cellStyle(
                  cell
                )}`}
                onClick={() => handleMove(cell)}
              >
                <div
                  className={`w-9 h-9 ${symbolColor(
                    cell.symbol
                  )} rounded-full drop-shadow-lg`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row">
            <button
              className="m-2 bg-sky-700 text-slate-100 font-mono hover:bg-sky-600 hover:text-white font-bold py-2 px-4 rounded"
              onClick={handleSwitchPlayer}
            >
              Switch Player
            </button>
            <div
              className={`m-2 w-9 h-9 ${symbolColor(
                player
              )} rounded-full drop-shadow-lg`}
            />
          </div>
          <div>
            <button
              className="m-2 bg-sky-700 text-slate-100 font-mono hover:bg-sky-600 hover:text-white font-bold py-2 px-4 rounded"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
