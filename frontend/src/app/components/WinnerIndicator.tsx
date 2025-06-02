import React from "react";
import { motion } from "motion/react";
import { PlayerSymbol, User } from "../types";

interface Props {
  winner?: string;
  user?: User;
  turn: PlayerSymbol;
}

export const WinnerIndicator: React.FC<Props> = ({ winner, user, turn }) => {
  return (
    <motion.div
      className={`mb-2 ${
        turn === "X" ? "text-sky-700" : "text-orange-600"
      } font-mono`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      {winner === user?.name ? "You win!" : `${winner} wins.`}
    </motion.div>
  );
};
