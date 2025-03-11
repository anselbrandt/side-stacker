import React from "react";
import { OnlineUser } from "../types";
import { Toggle } from "./Toggle";

interface Props {
  handleRestart: () => void;
  gameRequest?: OnlineUser;
  handleAccept: () => void;
  handleIgnore: () => void;
  remotePlayer?: OnlineUser;
  handleInvite: () => void;
  handleQuit: () => void;
  isAvailable: boolean;
  handleSetIsAvailable: () => void;
  selectedUser?: OnlineUser;
}

export const Controls: React.FC<Props> = ({
  handleRestart,
  gameRequest,
  handleAccept,
  handleIgnore,
  remotePlayer,
  handleInvite,
  handleQuit,
  isAvailable,
  handleSetIsAvailable,
  selectedUser,
}) => {
  return (
    <div className="flex flex-col">
      {!gameRequest ? (
        <button
          className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white hover:cursor-pointer font-bold py-2 px-4 drop-shadow-md rounded"
          onClick={handleRestart}
        >
          Restart
        </button>
      ) : null}
      {gameRequest ? (
        <>
          <div className="ml-2 w-35 font-mono text-xs">
            {gameRequest.name} is inviting you to play
          </div>
          <button
            className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white hover:cursor-pointer font-bold py-2 px-4 drop-shadow-md rounded"
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white hover:cursor-pointer font-bold py-2 px-4 drop-shadow-md rounded"
            onClick={handleIgnore}
          >
            Ignore
          </button>
        </>
      ) : remotePlayer ? (
        <>
          <div className="ml-2 w-35 font-mono text-xs">
            Currently playing {remotePlayer.name}
          </div>
          <button
            className="m-2 bg-sky-700 text-slate-100 text-xs font-mono hover:bg-sky-600 hover:text-white hover:cursor-pointer font-bold py-2 px-4 drop-shadow-md rounded"
            onClick={handleQuit}
          >
            Quit
          </button>
        </>
      ) : (
        <button
          className={`m-2  text-xs font-mono font-bold py-2 px-4 drop-shadow-md rounded ${
            !selectedUser
              ? "bg-zinc-300 text-white"
              : "bg-sky-700 text-slate-100 hover:bg-sky-600 hover:text-white hover:cursor-pointer "
          }`}
          onClick={handleInvite}
          disabled={!selectedUser}
        >
          Invite to Play
        </button>
      )}
      {gameRequest || remotePlayer ? null : (
        <div className="m-2 flex flex-col items-center justify-center">
          <Toggle isChecked={isAvailable} handleChange={handleSetIsAvailable} />
          <div className="m-2 text-sm font-mono text-slate-500">Available</div>
        </div>
      )}
    </div>
  );
};
