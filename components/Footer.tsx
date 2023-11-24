import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="flex h-[50px] border-t border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
      <div className="hidden sm:flex"></div>

      <div className="hidden sm:flex italic text-sm">
        Created by
        <a
          className="hover:opacity-50 mx-1"
          href="https://github.com/Soumyojyotisaha"
          target="_blank"
          rel="noreferrer"
        >
          Soumyojyoti Saha
        </a>
        based on the essays of
        <a
          className="hover:opacity-50 ml-1"
          href="https://twitter.com/paulg"
          target="_blank"
          rel="noreferrer"
        >
          Paul Graham
        </a>
        .
      </div>

      {/* Removed Twitter and GitHub options */}
    </div>
  );
};
