import { UserObject } from "@/model/UserObject";
import { useDiscordContext } from "@/contexts/DiscordContext";
import React, { useCallback, useEffect, useState } from "react";
import "./UserList.css";
import Image from "next/image";

const UserList: React.FC<{
  width: number;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({ width, handleMouseDown }) => {
  const { server } = useDiscordContext();
  const [users, setUsers] = useState<UserObject[]>([]);

  const loadUsers = useCallback(async () => {
    const response = await fetch("/api/users");
    const allUsers = (await response.json())?.data as UserObject[];

    if (allUsers && server) {
      const filteredUsers = allUsers.filter((user) =>
        server.members.includes(user.id)
      );
      setUsers(filteredUsers);
    } else {
      setUsers([]);
    }
  }, [server]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div
      style={{ width: `${width}px` }}
      className="h-full relative flex-shrink-0"
    >
      <div className="bg-medium-gray dark:bg-black h-full w-full custom-thin-border-right  flex flex-col items-start p-2">
        <div className="w-full flex justify-center">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">
            Members
          </h2>
        </div>
        <div className="w-full px-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center mb-3">
              <div className={`relative ${user.online ? "online-icon" : ""}`}>
                <Image
                  src={user.image || "https://thispersondoesnotexist.com/"}
                  alt={user.name || "User avatar"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <span className="ml-3 text-gray-700 dark:text-gray-200">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="custom-thin-border cursor-col-resize absolute top-0 left-0 h-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors duration-200 z-10"
      />
    </div>
  );
};

export default UserList;
