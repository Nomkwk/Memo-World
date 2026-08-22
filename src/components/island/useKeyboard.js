import { useEffect } from "react";

// Writes pressed key codes into input.current.keys. Clears on blur so held
// keys don't stick when the window loses focus.
export default function useKeyboard(input) {
  useEffect(() => {
    const isField = (t) =>
      t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    const down = (e) => {
      if (isField(e.target)) return;
      if (input.current) input.current.keys[e.code] = true;
    };
    const up = (e) => {
      if (isField(e.target)) return;
      if (input.current) input.current.keys[e.code] = false;
    };
    const blur = () => {
      if (input.current) input.current.keys = {};
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [input]);
}