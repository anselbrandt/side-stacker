import { useState, useEffect } from "react";
import "./App.css";
import { API_URL } from "./constants";

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
  const [board, setBoard] = useState<Cell[][]>();
  const [player] = useState("X");

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
        const gameboard = game.board.map((row, i) =>
          row.map((val, j) => ({ coordinates: { i, j }, value: val }))
        );
        setBoard(gameboard);
      };
      await handleGetGame();
    }

    getGame();
  }, [user]);

  const handleMove = async (cell: Cell) => {
    const payload = {
      ...cell.coordinates,
      player,
    };
    console.log(payload);
  };

  const getColor = (i: number) => {
    if (i % 2 === 0) {
      return "bg-sky-700";
    } else {
      return "bg-orange-500";
    }
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
                className="w-11 h-11 bg-white rounded-md drop-shadow-md flex items-center justify-center hover:cursor-pointer hover:bg-slate-100"
                onClick={() => handleMove(cell)}
              >
                <div
                  className={`w-9 h-9 ${getColor(
                    i
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
