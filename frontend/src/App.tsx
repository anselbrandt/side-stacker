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

interface Cell {
  coordinates: Coordinates;
  value?: "X" | "O" | null;
}

interface User {
  name: string;
  id: number;
}

function App() {
  const [user, setUser] = useState<User>();
  const [gameId, setGameId] = useState<number>();
  const [board, setBoard] = useState<Cell[][]>();
  const [player] = useState("X");
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

  useEffect(() => {
    async function getGame() {
      const handleGetGame = async () => {
        if (!user) return;
        const response = await fetch(`${API_URL}/board`);
        const game = (await response.json()) as Game;
        setGameId(game.id);
        const gameboard = game.board.map((row, i) =>
          row.map((val, j) => ({ coordinates: { i, j }, value: val }))
        );
        setBoard(gameboard);
        const valid = getValidMoves(game.board);
        setValidMoves(valid);
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
    setGameId(game.id);
    const gameboard = game.board.map((row, i) =>
      row.map((val, j) => ({ coordinates: { i, j }, value: val }))
    );
    setBoard(gameboard);
    const valid = getValidMoves(game.board);
    setValidMoves(valid);
  };

  const hintStyle = (cell: Cell) => {
    const { i, j } = cell.coordinates;
    if (validMoves && isValid(validMoves, [i, j])) {
      return "hover:cursor-pointer hover:hover:bg-slate-100";
    } else {
      return "";
    }
  };

  const occupiedColor = (cell: Cell) => {
    if (cell.value === "X") {
      return "bg-sky-700";
    }
    if (cell.value === "O") {
      return "bg-orange-500";
    }
    return "";
  };

  return (
    <>
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
        <div className="m-2 my-8 text-2xl font-mono font-medium text-slate-400">
          Hello, {user?.name}!
        </div>
        <div className="m-2">
          <div className="grid grid-cols-7 gap-2">
            {board?.flat().map((cell, i) => (
              <div
                key={i}
                className={`w-11 h-11 bg-white rounded-md drop-shadow-md flex items-center justify-center ${hintStyle(
                  cell
                )}`}
                onClick={() => handleMove(cell)}
              >
                <div
                  className={`w-9 h-9 ${occupiedColor(
                    cell
                  )} rounded-full drop-shadow-lg`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
