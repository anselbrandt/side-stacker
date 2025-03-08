export const getValidMoves = (
  board: (null | number)[][]
): [number, number][] => {
  return board.flatMap((row, i) => {
    const emptyIndices = row
      .map((value, j) => (value === null ? j : -1))
      .filter((j) => j !== -1);
    if (emptyIndices.length === 0) return [];
    return [
      [i, emptyIndices[0]],
      [i, emptyIndices[emptyIndices.length - 1]],
    ];
  });
};

export const isValid = (arr: number[][], pair: number[]): boolean => {
  return arr.some(
    (subArr) =>
      subArr.length === pair.length &&
      subArr.every((val, index) => val === pair[index])
  );
};
