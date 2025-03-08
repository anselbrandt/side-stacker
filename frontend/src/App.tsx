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

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="m-2">Hello, {user?.name}!</div>
        <div className="m-2">
          <div className="grid grid-cols-7 gap-4">
            {board?.flat().map((cell, i) => (
              <div
                key={i}
                className="w-10 h-10 bg-blue-100 flex items-center justify-center hover:cursor-pointer hover:bg-blue-300"
                onClick={() => handleMove(cell)}
              >
                {cell.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
