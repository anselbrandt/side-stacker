import React from "react";
import { motion } from "motion/react";
import { OnlineUser, PlayerSymbol } from "../types";

interface Props {
  turn: PlayerSymbol;
  player: PlayerSymbol;
  remotePlayer?: OnlineUser;
}

export const TurnIndicator: React.FC<Props> = ({
  turn,
  player,
  remotePlayer,
}) => {
  return (
    <motion.div
      className={`mb-2 ${
        turn === "X" ? "text-sky-700" : "text-orange-600"
      } font-mono`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      {turn === player
        ? "Your turn."
        : remotePlayer
        ? `${remotePlayer.name} is playing.`
        : "I'm thinking..."}
    </motion.div>
  );
};
