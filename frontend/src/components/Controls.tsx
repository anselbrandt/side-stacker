import React from "react";
import { OnlineUser } from "../types";

interface Props {
  handleRestart: () => void;
  gameRequest?: OnlineUser;
  handleAccept: () => void;
  handleIgnore: () => void;
  remotePlayer?: OnlineUser;
  handleInvite: () => void;
}

export const Controls: React.FC<Props> = ({
  handleRestart,
  gameRequest,
  handleAccept,
  handleIgnore,
  remotePlayer,
  handleInvite,
}) => {
  return (
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
  );
};
