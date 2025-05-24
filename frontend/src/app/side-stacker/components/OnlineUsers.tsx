import React from "react";
import { OnlineUser, User } from "../types";

interface Props {
  online?: OnlineUser[];
  user?: User;
  selectedUser?: OnlineUser;
  setSelectedUser: (user: OnlineUser | undefined) => void;
}

export const OnlineUsers: React.FC<Props> = ({
  online,
  user,
  selectedUser,
  setSelectedUser,
}) => {
  return (
    <div className="m-2 h-40 w-50 bg-white overflow-auto drop-shadow-md rounded-md">
      <div className="min-h-50">
        <div
          className="m-2 flex flex-row justify-between items-center"
          onClick={() => setSelectedUser(undefined)}
        >
          <div className="font-mono text-sm">{user?.name}</div>
          <div className="font-mono text-sm" />
          (You)
        </div>
        {online?.map((onlineUser, index) => (
          <div
            key={index}
            className={`m-1 p-1 flex flex-row justify-between items-center ${
              onlineUser === selectedUser ? "bg-zinc-200" : ""
            } hover:cursor-pointer hover:bg-zinc-200 hover:text-slate-700`}
            onClick={() => setSelectedUser(onlineUser)}
          >
            <div className="font-mono text-sm">{onlineUser.name}</div>
            <div
              className={`mr-3 w-3 h-3 rounded-full ${
                onlineUser.available ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
        ))}
        <div
          className="h-full min-h-35"
          onClick={() => setSelectedUser(undefined)}
        ></div>
      </div>
    </div>
  );
};
