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
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedUser, setSelectedUser] = useState<OnlineUser>();
  const [notification, setNotification] = useState<string>();
  const socketRef = useRef<WebSocket>(null);

  const updateBoard = useCallback((game: Game) => {
    setGameId(game.id);
    const board = enhancedBoard(game.board);
    setGameBoard(board);
    const valid = getValidMoves(game.board);
    setValidMoves(valid);
    return board;
  }, []);

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
    [
      gameBoard,
      gameOver,
      validMoves,
      gameId,
      turn,
      updateBoard,
      player,
      remotePlayer,
    ]
  );

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

  useEffect(() => {
    const connect = () => {
      if (!user) return;

      if (!socketRef.current) {
        socketRef.current = new WebSocket(
          `ws://localhost:8000/ws?token=${user?.token}`
        );
      }

      const socket = socketRef.current;

      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ available: true }));
      });
    };

    connect();

    return () => {
      socketRef.current?.close();
    };
  }, [user]);

  useEffect(() => {
    if (!socketRef.current || !user) return;

    const socket = socketRef.current;

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.online) {
        const filteredUsers = data.online.filter(
          (online: OnlineUser) => online.name !== user?.name
        );
        setOnline(filteredUsers);
      }
      if (data.invite) {
        setGameRequest(data.invite);
        setNotification(
          `Hey ${user!.name}, ${data.invite.name} has invited you to play`
        );
      }
      if (data.player) {
        setPlayer(data.player);
      }
      if (data.move) {
        handleMove(data.move);
      }
      if (data.quitnotification) {
        setNotification(`${data.quitnotification.name} has quit.`);
        setRemotePlayer(undefined);
        setGameOver(true);
        setHasStarted(false);
      }
      if (data.multiplayer_start) {
        console.log(data.multiplayer_start);
      }
    });
  }, [user, handleMove]);

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

  const handleInvite = () => {
    if (!socketRef.current || !selectedUser) return;
    const socket = socketRef.current;
    const invitee = selectedUser.id;
    socket.send(JSON.stringify({ invite: invitee }));
  };

  const handleAccept = () => {
    if (!socketRef.current || !gameRequest) return;
    const requestor = gameRequest;
    setRemotePlayer(requestor);
    setGameRequest(undefined);
    socketRef.current.send(JSON.stringify({ accept: requestor?.id }));
  };

  const handleIgnore = () => {
    setGameRequest(undefined);
  };

  const handleQuit = () => {
    if (!socketRef.current || !remotePlayer) return;
    const currentRemotePlayer = remotePlayer;
    setRemotePlayer(undefined);
    setGameOver(true);
    setHasStarted(false);

    socketRef.current.send(JSON.stringify({ quit: currentRemotePlayer.id }));
  };

  const handleSetIsAvailable = () => {
    if (!socketRef.current) return;
    socketRef.current.send(JSON.stringify({ available: !isAvailable }));
    setIsAvailable((prev) => !prev);
  };

  useEffect(() => {
    if (!notification) return;
    alert(notification);
    setNotification(undefined);
  }, [notification]);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <Title />
      <PlayingBoard
        gameBoard={gameBoard}
        handleHumanMove={handleHumanMove}
        cellStyle={cellStyle}
      />
      <div>
        <div className="m-1 ml-3 mt-3  text-sm font-mono">Online users:</div>
        <div className="flex flex-row">
          <OnlineUsers
            online={online}
            user={user}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
          <Controls
            gameRequest={gameRequest}
            handleAccept={handleAccept}
            handleIgnore={handleIgnore}
            handleInvite={handleInvite}
            handleRestart={handleRestart}
            remotePlayer={remotePlayer}
            handleQuit={handleQuit}
            isAvailable={isAvailable}
            handleSetIsAvailable={handleSetIsAvailable}
            selectedUser={selectedUser}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
