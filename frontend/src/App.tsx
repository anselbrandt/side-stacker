import "./App.css";
import { enhancedBoard } from "./game/gameUtils";
import { gameEngine } from "./game/gameEngine";
import { getRequest, postRequest } from "./utils";
import { getValidMoves, isValid, isWinningMove } from "./game/gameLogic";
import {
  Cell,
  EnhancedBoard,
  Game,
  OnlineUser,
  PlayerSymbol,
  User,
} from "./types";
import { Controls } from "./components/Controls";
import { Greeting } from "./components/Greeting";
import { OnlineUsers } from "./components/OnlineUsers";
import { PlayingBoard } from "./components/PlayingBoard";
import { Title } from "./components/Title";
import { useState, useEffect, useCallback, useRef } from "react";

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
  const [turn, setTurn] = useState<PlayerSymbol>("X");

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
        player: turn,
      };
      const game = await postRequest<Game>("/move", payload);
      const board = updateBoard(game);
      if (isWinningMove(board, turn)) {
        setGameOver(true);
        setTimeout(() => {
          if (turn === player) {
            alert("You win!");
          } else {
            alert(`${remotePlayer ? remotePlayer.name : "Computer"} wins.`);
            setTurn((prev) => (prev === "X" ? "O" : "X"));
            setHasStarted(false);
          }
        }, 500);
        return;
      } else {
        setTurn((prev) => (prev === "X" ? "O" : "X"));
      }
    },
    [gameBoard, gameOver, validMoves, gameId, turn, updateBoard]
  );

  const handleHumanMove = (cell: Cell) => {
    if (turn !== player) return;
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
      if (!hasStarted || turn === player || !validMoves || !gameBoard) return;
      setTimeout(() => {
        const move = gameEngine(gameBoard);
        handleMove(move);
      }, 1000);
    };
    autoMove();
  }, [player, gameBoard, handleMove, hasStarted, validMoves, turn]);

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
        if (data.player) {
          setPlayer(data.player);
        }
        if (data.move) {
          handleMove(data.move);
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

  const handleQuit = () => {
    setRemotePlayer(undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <Title />
      <Greeting user={user} />
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
            gameRequest={gameRequest}
            handleAccept={handleAccept}
            handleIgnore={handleIgnore}
            handleInvite={handleInvite}
            handleRestart={handleRestart}
            remotePlayer={remotePlayer}
            handleQuit={handleQuit}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
