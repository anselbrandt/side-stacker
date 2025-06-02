import React from "react";

export const Title: React.FC = () => {
  return (
    <>
      <div className="mt-10 text-4xl [word-spacing: 2px] font-mono font-bold text-slate-500">
        Side Stacker
      </div>
      <div className="mb-4 text-md font-mono font-medium text-slate-500">
        Connect Four, but sideways.
      </div>
    </>
  );
};
