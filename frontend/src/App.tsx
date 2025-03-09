import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { getValidMoves, isValid, isWinningMove } from "./gameLogic";
import { User, Cell, Game, Symbol, EnhancedBoard } from "./types";
import { enhancedBoard, getRequest, postRequest } from "./utils";

function App() {
  const [user, setUser] = useState<User>();
  const [gameId, setGameId] = useState<number>();
  const [gameBoard, setGameBoard] = useState<EnhancedBoard>();
  const [player, setPlayer] = useState<Symbol>("X");
  const [validMoves, setValidMoves] = useState<[number, number][]>();
  const [gameOver, setGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    async function login() {
      const handleLogin = async () => {
        const user = await getRequest<User>("/login");
        setUser(user);
      };
      await handleLogin();
    }

    login();
  }, []);

  const updateBoard = useCallback((game: Game) => {
    const valid = getValidMoves(game.board);
    setValidMoves(valid);
    setGameId(game.id);
    const board = enhancedBoard(game.board);
    setGameBoard(board);
    return board;
  }, []);

  useEffect(() => {
    async function getGame() {
      const handleGetGame = async () => {
        if (!user) return;
        const game = await getRequest<Game>("/board");
        updateBoard(game);
      };
      await handleGetGame();
    }

    getGame();
  }, [user, updateBoard]);

  const handleMove = useCallback(
    async (cell: Cell) => {
      if (!gameBoard) return;
      if (gameOver) return;
      if (!validMoves) return;
      const { i, j } = cell.coordinates;
      if (!isValid(validMoves, [i, j])) return;
      setHasStarted(true);
      const payload = {
        ...cell.coordinates,
        id: gameId,
        player,
      };
      const game = await postRequest<Game>("/move", payload);
      const board = updateBoard(game);
      if (isWinningMove(board, player)) {
        setGameOver(true);
        setTimeout(() => {
          if (player === "X") {
            alert("Youn win!");
          } else {
            alert("Computer wins.");
            setPlayer((prev) => (prev === "X" ? "O" : "X"));
            setHasStarted(false);
          }
        }, 500);
        return;
      } else {
        setPlayer((prev) => (prev === "X" ? "O" : "X"));
      }
    },
    [gameBoard, gameOver, validMoves, gameId, player, updateBoard]
  );

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

  const handleRestart = async () => {
    alert("Are you sure?");
    setGameOver(false);

    const game = await postRequest<Game>("/reset", { id: gameId });
    updateBoard(game);
    setHasStarted(false);
  };

  useEffect(() => {
    const autoMove = async () => {
      if (!hasStarted) return;
      if (player === "X") return;
      if (!validMoves) return;
      setTimeout(() => {
        const selectedCoordinates =
          validMoves[Math.floor(Math.random() * validMoves.length)];
        const [i, j] = selectedCoordinates;
        const selectedMove = gameBoard![i][j];
        handleMove(selectedMove);
      }, 1000);
    };
    autoMove();
  }, [player, gameBoard, handleMove, hasStarted, validMoves]);

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
            {gameBoard?.flat().map((cell, i) => (
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
