import { usePersisted } from "@/hooks/usePersisted";
import { useEffect } from "react";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

function setTheme(theme: "light" | "dark") {
  if (!document.documentElement.classList.contains(theme))
    document.documentElement.classList.add(theme);

  const otherTheme = theme === "light" ? "dark" : "light";
  if (document.documentElement.classList.contains(otherTheme))
    document.documentElement.classList.remove(otherTheme);
}

export function ThemeToggle() {
  const [isDark, setIsDark] = usePersisted(
    "dark-theme",
    Boolean(window?.matchMedia?.("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    setTheme(isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      className="fixed bottom-2 right-2 z-[10000] rounded-full bg-slate-800 p-2 text-white dark:bg-slate-700"
      onClick={() => setIsDark(!isDark)}
    >
      {isDark ? <MdOutlineDarkMode /> : <MdOutlineLightMode />}
    </button>
  );
}
