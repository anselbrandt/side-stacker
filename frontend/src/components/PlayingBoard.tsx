import React from "react";
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
            <div
              className={`w-9 h-9 ${symbolColor(
                cell.symbol
              )} rounded-full drop-shadow-lg`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
