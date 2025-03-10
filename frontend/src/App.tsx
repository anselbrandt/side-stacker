import "./App.css";
import { enhancedBoard } from "./game/gameUtils";
import { gameEngine } from "./game/gameEngine";
import { getRequest, postRequest } from "./utils";
import { getValidMoves, isValid, isWinningMove } from "./game/gameLogic";
import {
  User,
  Cell,
  Game,
  PlayerSymbol,
  EnhancedBoard,
  OnlineUser,
} from "./types";
import { useState, useEffect, useCallback, useRef } from "react";
import { Controls } from "./components/Controls";
import { OnlineUsers } from "./components/OnlineUsers";
import { PlayingBoard } from "./components/PlayingBoard";

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
      <PlayingBoard
        gameBoard={gameBoard}
        handleHumanMove={handleHumanMove}
        cellStyle={cellStyle}
      />
      <div>
        <div className="m-1 ml-3 mt-3  text-sm font-mono">Online users:</div>
        <div className="flex flex-row">
          <OnlineUsers online={online} />
          <Controls
            handleRestart={handleRestart}
            gameRequest={gameRequest}
            handleAccept={handleAccept}
            handleIgnore={handleIgnore}
            remotePlayer={remotePlayer}
            handleInvite={handleInvite}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
