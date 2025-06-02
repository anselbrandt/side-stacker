import React from "react";
import { OnlineUser } from "../types";

interface Props {
  level: string;
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  remotePlayer?: OnlineUser;
}

export const Difficulty: React.FC<Props> = ({
  level,
  handleOnChange,
  remotePlayer,
}) => {
  return (
    <div className="m-3 font-mono">
      <div className="text-sm mb-2">Difficulty Level</div>
      <div className="flex items-center m-2">
        <input
          checked={level == "easy"}
          id="easy"
          type="radio"
          value="easy"
          onChange={handleOnChange}
          disabled={!!remotePlayer}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="easy"
          className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Easy (Random)
        </label>
      </div>
      <div className="flex items-center m-2">
        <input
          checked={level == "medium"}
          id="medium"
          type="radio"
          value="medium"
          onChange={handleOnChange}
          disabled={!!remotePlayer}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="medium"
          className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Medium{" "}
          <a
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href="https://en.wikipedia.org/wiki/Monte_Carlo_tree_search"
          >
            (MCTS)
          </a>
        </label>
      </div>
      <div className="flex items-center m-2">
        <input
          checked={level == "hard"}
          id="hard"
          type="radio"
          value="hard"
          onChange={handleOnChange}
          disabled={!!remotePlayer}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="hard"
          className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Hard{" "}
          <a
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href="https://en.wikipedia.org/wiki/AlphaZero"
          >
            (AlphaZero)
          </a>
        </label>
      </div>
    </div>
  );
};
