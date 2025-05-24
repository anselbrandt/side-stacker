"use client";
import { Controls } from "./components/Controls";
import { Difficulty } from "./components/Difficulty";
import { enhancedBoard } from "./game/gameUtils";
import { gameEngine } from "./game/gameEngine";
import { getRequest, postRequest, getLocalToken, setLocalToken } from "./utils";
import { getValidMoves, isValid, isWinningMove } from "./game/gameLogic";
import { OnlineUsers } from "./components/OnlineUsers";
import { PlayingBoard } from "./components/PlayingBoard";
import { Title } from "./components/Title";
import { TurnIndicator } from "./components/TurnIndicator";
import { useState, useEffect, useRef } from "react";
import { WinnerIndicator } from "./components/WinnerIndicator";
import { WS_URL } from "./constants";
import {
  Cell,
  EnhancedBoard,
  Game,
  OnlineUser,
  PlayerSymbol,
  User,
} from "./types";

function App() {
  const [difficultyLevel, setDifficultyLevel] = useState<string>("easy");
  const [gameBoard, setGameBoard] = useState<EnhancedBoard>();
  const [gameId, setGameId] = useState<number>();
  const [gameOver, setGameOver] = useState(false);
  const [gameRequest, setGameRequest] = useState<OnlineUser>();
  const [hasStarted, setHasStarted] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [notification, setNotification] = useState<string>();
  const [online, setOnline] = useState<OnlineUser[]>();
  const [player, setPlayer] = useState<PlayerSymbol>();
  const [remotePlayer, setRemotePlayer] = useState<OnlineUser>();
  const [selectedUser, setSelectedUser] = useState<OnlineUser>();
  const [token, setToken] = useState<string | null>(getLocalToken());
  const [turn, setTurn] = useState<PlayerSymbol>();
  const [user, setUser] = useState<User>();
  const [validMoves, setValidMoves] = useState<[number, number][]>();
  const [winner, setWinner] = useState<string | null>(null);
  const socketRef = useRef<WebSocket>(null);

  const updateBoard = (game: Game) => {
    setGameId(game.id);
    setWinner(game.winner);
    const board = enhancedBoard(game.board);
    setGameBoard(board);
    const valid = getValidMoves(game.board);
    setValidMoves(valid);
    return board;
  };

  const handleMove = async (cell: Cell) => {
    if (!gameBoard || !validMoves || gameOver || !user || !token) return;
    const { i, j } = cell.coordinates;
    if (!isValid(validMoves, [i, j])) return;
    let winnerName = null;
    if (isWinningMove(gameBoard, cell, turn)) {
      winnerName =
        turn === player
          ? user.name
          : remotePlayer
          ? remotePlayer.name
          : "Computer";
      setWinner(winnerName);
      setGameOver(true);
      setHasStarted(false);
      setRemotePlayer(undefined);
    } else {
      setHasStarted(true);
    }
    const payload = {
      ...cell.coordinates,
      id: gameId,
      player: turn,
      winner: winnerName,
    };
    const game = await postRequest<Game>("/move", token, payload);
    if (remotePlayer && socketRef.current) {
      const payload = {
        game_id: gameId,
        player_id: remotePlayer.id,
        turn: player === "X" ? "O" : "X",
        updated_board: game.board,
        winner: winnerName,
      };
      socketRef.current.send(
        JSON.stringify({
          move: payload,
        })
      );
      if (winnerName) {
        setIsAvailable(true);
        socketRef.current.send(JSON.stringify({ available: true }));
      }
    }
    updateBoard(game);
    if (!winnerName) {
      setTurn(game.turn);
    }
  };

  const handleHumanMove = async (cell: Cell) => {
    if (turn !== player) return;
    await handleMove(cell);
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
    if (!token) return;
    if (remotePlayer) {
      handleQuit();
    }
    setGameOver(false);
    const game = await postRequest<Game>("/reset", token, { id: gameId });
    updateBoard(game);
    setHasStarted(false);
    setWinner(null);
    setTurn(player);
  };

  const handleInvite = () => {
    if (!socketRef.current || !selectedUser || !selectedUser.available) return;
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

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDifficultyLevel(value);
  };

  useEffect(() => {
    async function login() {
      const handleLogin = async () => {
        const user = await getRequest<User>("/login");
        setUser(user);
        setToken(user.token);
        setLocalToken(user.token);
      };
      await handleLogin();
    }
    login();
  }, []);

  useEffect(() => {
    async function getGame() {
      if (!token) return;
      const handleGetGame = async () => {
        if (!user) return;
        const game = await getRequest<Game>("/board", token);
        updateBoard(game);
        setPlayer(game.players[user.id]);
        setTurn(game.turn);
        if (game.winner) {
          setGameOver(true);
        }
      };
      await handleGetGame();
    }
    getGame();
  }, [user, token]);

  useEffect(() => {
    const connect = () => {
      if (!user || !token) return;

      if (!socketRef.current) {
        socketRef.current = new WebSocket(`${WS_URL}/ws?token=${token}`);
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
  }, [user, token]);

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
      if (data.quit_notification) {
        setNotification(`${data.quit_notification.name} has quit.`);
        setRemotePlayer(undefined);
        setGameOver(true);
        setHasStarted(false);
      }
      if (data.accept_notification) {
        setNotification(
          `${data.accept_notification.name} has accepted your invite to play`
        );
        setRemotePlayer(data.accept_notification);
      }
      if (data.multiplayer_game) {
        const multiplayer_game = data.multiplayer_game;
        updateBoard(multiplayer_game);
        setPlayer(multiplayer_game.players[user.id]);
        setTurn(multiplayer_game.turn);
        setIsAvailable(false);
        socket.send(JSON.stringify({ available: false }));
      }
      if (data.updated_game) {
        const updatedGame = {
          id: data.updated_game.id,
          board: data.updated_game.board,
          winner: data.updated_game.winner,
          turn: data.updated_game.turn,
        } as unknown as Game;
        if (data.updated_game.winner) {
          setWinner(data.updated_game.winner);
          setGameOver(true);
          setHasStarted(false);
          handleQuit();
          setIsAvailable(true);
          socket.send(JSON.stringify({ available: true }));
        } else {
          setTurn(data.updated_game.turn);
        }
        updateBoard(updatedGame);
      }
    });
  }, [user, handleMove]);

  useEffect(() => {
    const autoMove = async () => {
      if (
        remotePlayer ||
        !hasStarted ||
        turn === player ||
        !validMoves ||
        !gameBoard ||
        !token
      )
        return;
      setTimeout(
        async () => {
          const move = await gameEngine(
            gameBoard,
            player,
            difficultyLevel,
            token
          );
          handleMove(move);
        },
        difficultyLevel == "easy" ? 1000 : 0
      );
    };
    autoMove();
  }, [
    player,
    gameBoard,
    handleMove,
    hasStarted,
    validMoves,
    turn,
    remotePlayer,
    token,
  ]);

  useEffect(() => {
    if (!notification) return;
    if (!winner) {
      alert(notification);
    }
    setNotification(undefined);
  }, [notification]);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <Title />
      {winner ? (
        <WinnerIndicator winner={winner} user={user} turn={turn} />
      ) : (
        <TurnIndicator
          turn={turn}
          player={player}
          remotePlayer={remotePlayer}
        />
      )}
      <PlayingBoard
        gameBoard={gameBoard}
        handleHumanMove={handleHumanMove}
        cellStyle={cellStyle}
      />
      <div>
        <div className="flex flex-row justify-between">
          <div className="m-1 ml-3 mt-3  text-sm font-mono">Online users:</div>
        </div>
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
        <Difficulty
          level={difficultyLevel}
          handleOnChange={handleOnChange}
          remotePlayer={remotePlayer}
        />
      </div>
    </div>
  );
}

export default App;
