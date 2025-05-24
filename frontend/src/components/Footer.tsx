import React from "react";
import { FileIcon } from "@/icons/FileIcon";
import { WindowIcon } from "@/icons/WindowIcon";
import { GlobeIcon } from "@/icons/GlobeIcon";

export const Footer: React.FC = () => {
  return (
    <>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="/anselbrandt.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FileIcon width={16} height={16} />
        CV
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/anselbrandt/cv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <WindowIcon width={16} height={16} />
        github/cv
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/anselbrandt/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GlobeIcon width={16} height={16} />
        GitHub
      </a>
    </>
  );
};
