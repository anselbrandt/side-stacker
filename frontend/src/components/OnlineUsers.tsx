import React from "react";
import { OnlineUser } from "../types";

interface Props {
  online?: OnlineUser[];
}

export const OnlineUsers: React.FC<Props> = ({ online }) => {
  return (
    <div className="m-2 h-40 w-50 bg-white overflow-auto drop-shadow-md rounded-md">
      <div className="min-h-50">
        {online?.map((user, index) => (
          <div className="m-2 font-mono text-sm" key={index}>
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
};
