import React from "react";
import { User } from "../types";

interface Props {
  user?: User;
}

export const Greeting: React.FC<Props> = ({ user }) => {
  return (
    <div className="m-2 my-8 text-2xl font-mono tracking-tight font-medium text-slate-500">
      Hi, {user?.name}!
    </div>
  );
};
