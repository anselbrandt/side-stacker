import React from "react";
import { motion } from "motion/react";
import { User } from "../types";

interface Props {
  winner?: string;
  user?: User;
}

export const WinnerIndicator: React.FC<Props> = ({ winner, user }) => {
  return (
    <motion.div
      className={`mb-2 "text-sky-700" font-mono`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      {winner === user?.name ? "You win!" : `${winner} wins.`}
    </motion.div>
  );
};
