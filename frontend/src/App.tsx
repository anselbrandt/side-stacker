import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import { getValidMoves, isValid, isWinningMove } from "./gameLogic";
import { User, Cell, Game, PlayerSymbol, EnhancedBoard } from "./types";
import { enhancedBoard, getRequest, postRequest } from "./utils";
import { gameEngine } from "./gameEngine";

interface OnlineUser {
  id: number;
  name: string;
}

function App() {
  const [user, setUser] = useState<User>();
  const [gameId, setGameId] = useState<number>();
  const [gameBoard, setGameBoard] = useState<EnhancedBoard>();
  const [player, setPlayer] = useState<PlayerSymbol>("X");
  const [validMoves, setValidMoves] = useState<[number, number][]>();
  const [gameOver, setGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [online, setOnline] = useState<OnlineUser[]>();
  const [gameRequest, setGameRequest] = useState<OnlineUser>();
  const [remotePlayer, setRemotePlayer] = useState<OnlineUser>();

  const ws = useRef<WebSocket>(null);

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
    setGameId(game.id);
    const board = enhancedBoard(game.board);
    setGameBoard(board);
    const valid = getValidMoves(game.board);
    setValidMoves(valid);
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
      if (!gameBoard || !validMoves || gameOver) return;
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

  const handleHumanMove = (cell: Cell) => {
    if (player === "O") return;
    handleMove(cell);
  };

  const cellStyle = (cell: Cell) => {
    if (cell.symbol !== null) return "bg-white";
    const { i, j } = cell.coordinates;
    if (validMoves && isValid(validMoves, [i, j])) {
      return "bg-white hover:cursor-pointer hover:outline hover:outline-orange-500";
    } else {
      return "bg-zinc-100";
    }
  };

  const symbolColor = (symbol: PlayerSymbol) => {
    if (symbol === "X") {
      return "bg-sky-700";
    }
    if (symbol === "O") {
      return "bg-orange-500";
    }
    return "";
  };

  const handleRestart = async () => {
    setGameOver(false);
    const game = await postRequest<Game>("/reset", { id: gameId });
    updateBoard(game);
    setHasStarted(false);
  };

  useEffect(() => {
    const autoMove = async () => {
      if (!hasStarted || player === "X" || !validMoves || !gameBoard) return;
      setTimeout(() => {
        const move = gameEngine(gameBoard);
        handleMove(move);
      }, 1000);
    };
    autoMove();
  }, [player, gameBoard, handleMove, hasStarted, validMoves]);

  useEffect(() => {
    const connect = () => {
      if (!user) return;

      if (!ws.current) {
        ws.current = new WebSocket(
          `ws://localhost:8000/ws?token=${user?.token}`
        );
      }

      const socket = ws.current;

      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ message: `Hello from ${user.name}` }));
      });

      socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.online) {
          const filteredUsers = data.online.filter(
            (online: OnlineUser) => online.name !== user.name
          );
          setOnline(filteredUsers);
        }
        if (data.invite) {
          setGameRequest(data.invite);
        }
      });
    };

    connect();

    return () => {
      ws.current?.close();
    };
  }, [user]);

  const handleInvite = () => {
    if (!ws.current) return;
    const socket = ws.current;
    const invitee = online![0].id;
    socket.send(JSON.stringify({ invite: invitee }));
  };

  useEffect(() => {
    if (!gameRequest) return;
    alert(`Hey ${user!.name}, ${gameRequest.name} has invited you to play`);
  }, [gameRequest, user]);

  const handleAccept = () => {
    setRemotePlayer(gameRequest);
    setGameRequest(undefined);
  };

  const handleIgnore = () => {
    setGameRequest(undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <div className="mt-10 text-4xl [word-spacing: 2px] font-mono font-bold text-slate-500">
        Side Stacker
      </div>
      <div className="text-md font-mono font-medium text-slate-500">
        Connect Four, but sideways.
      </div>
      <div className="m-2 my-8 text-2xl font-mono tracking-tight font-medium text-slate-500">
        Hi, {user?.name}!
      </div>
      <div className="m-2">
        <div className="grid grid-cols-7 gap-2">
          {gameBoard?.flat().map((cell, i) => (
            <div
              key={i}
              className={`w-11 h-11 rounded-md drop-shadow-md flex items-center justify-center ${cellStyle(
                cell
              )}`}
              onClick={() => handleHumanMove(cell)}
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
      <div>
        <div className="m-1 ml-3 mt-3  text-sm font-mono">Online users:</div>
        <div className="flex flex-row">
          <div className="m-2 h-40 w-50 bg-white overflow-auto drop-shadow-md rounded-md">
            <div className="min-h-50">
              {online?.map((user, index) => (
                <div className="m-2 font-mono text-sm" key={index}>
                  {user.name}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <button
              className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white font-bold py-2 px-4 drop-shadow-md rounded"
              onClick={handleRestart}
            >
              Restart
            </button>
            {gameRequest ? (
              <>
                <div className="ml-2 w-35 font-mono text-xs">
                  {gameRequest.name} is inviting you to play
                </div>
                <button
                  className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white font-bold py-2 px-4 drop-shadow-md rounded"
                  onClick={handleAccept}
                >
                  Accept
                </button>
                <button
                  className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white font-bold py-2 px-4 drop-shadow-md rounded"
                  onClick={handleIgnore}
                >
                  Ignore
                </button>
              </>
            ) : remotePlayer ? (
              <div className="ml-2 w-35 font-mono text-xs">
                Currently playing {remotePlayer.name}
              </div>
            ) : (
              <button
                className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white font-bold py-2 px-4 drop-shadow-md rounded"
                onClick={handleInvite}
              >
                Invite to Play
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
