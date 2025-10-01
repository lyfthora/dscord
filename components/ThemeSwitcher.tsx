"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-[var(--hover-dark-gray)] transition-colors"
    >
      {theme === "dark" ? (
        <Image src="/light.svg" alt="Light mode" width={20} height={20} />
      ) : (
        <Image src="/dark.svg" alt="Dark mode" width={20} height={20} />
      )}
    </button>
  );
};
