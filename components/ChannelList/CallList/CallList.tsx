import { useDiscordContext } from "@/contexts/DiscordContext";
import { useState } from "react";
import { ChevronRight, PlusIcon, Speaker } from "../Icons";
import Link from "next/link";

export default function CallList(): JSX.Element {
  const { calls, callId, setCall } = useDiscordContext();

  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="w-full my-2">
      <div className="flex text-gray-500 items-center mb-2 pr-2">
        <button
          className="flex w-full items-center justify-start px-2"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <div
            className={`${
              isOpen ? "rotate-90" : ""
            } transition-all ease-in-out duration-200`}
          >
            <ChevronRight />
          </div>
          <h2 className="inline-block uppercase text-sm font-bold px-2">
            Voice Channels
          </h2>
        </button>
        <Link
          className=""
          href={`/?createChannel=true&isVoice=true&category=Voice Channels`}
        >
          <PlusIcon />
        </Link>
      </div>
      {isOpen && (
        <div className="px-2">
          {calls.map((call) => {
            const isActive = call.id === callId;
            return (
              <button
                key={call.id}
                className={`w-full flex items-center my-1 px-2 py-1 rounded-md group ${
                  isActive
                    ? "bg-hover-gray dark:bg-gray-700"
                    : "hover:bg-light-gray dark:hover:bg-gray-700"
                }`}
                onClick={() => {
                  setCall(call.id);
                }}
              >
                <Speaker className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                <span
                  className={`text-sm ${
                    isActive
                      ? "text-black dark:text-white font-bold"
                      : "font-semibold text-gray-600 dark:text-gray-200 group-hover:text-gray-800 dark:group-hover:text-white"
                  }`}
                >
                  {call.state.custom.callName || "Channel Preview"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}