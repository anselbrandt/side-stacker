import React from "react";
import { motion } from "motion/react";

import { Cell, EnhancedBoard } from "../types";
import { symbolColor } from "../utils";

interface Props {
  gameBoard?: EnhancedBoard;
  handleHumanMove: (cell: Cell) => void;
  cellStyle: (cell: Cell) => string;
}

export const PlayingBoard: React.FC<Props> = ({
  gameBoard,
  handleHumanMove,
  cellStyle,
}) => {
  return (
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
            {cell.symbol ? (
              <motion.div
                className={`w-9 h-9 ${symbolColor(
                  cell.symbol
                )} rounded-full drop-shadow-lg`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.0, duration: 0.5, ease: "backInOut" }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
