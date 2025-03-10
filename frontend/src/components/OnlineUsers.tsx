import React from "react";
import { OnlineUser, User } from "../types";

interface Props {
  online?: OnlineUser[];
  user?: User;
}

export const OnlineUsers: React.FC<Props> = ({ online, user }) => {
  return (
    <div className="m-2 h-40 w-50 bg-white overflow-auto drop-shadow-md rounded-md">
      <div className="min-h-50">
        <div className="m-2 flex flex-row justify-between items-center">
          <div className="font-mono text-sm">{user?.name}</div>
          <div className="font-mono text-sm" />
          (You)
        </div>
        {online?.map((user, index) => (
          <div
            key={index}
            className="m-2 flex flex-row justify-between items-center"
          >
            <div className="font-mono text-sm">{user.name}</div>
            <div
              className={`mr-3 w-3 h-3 rounded-full bg-${
                user.available ? "green" : "red"
              }-500`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
