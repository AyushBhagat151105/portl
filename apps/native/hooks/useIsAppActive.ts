import { useEffect, useState } from "react";
import { AppState } from "react-native";

/**
 * Returns true when the app is in the foreground (active state).
 * Used to pause refetchInterval polling when the app is backgrounded,
 * preventing wasted network requests when the user isn't looking at the screen.
 */
export function useIsAppActive(): boolean {
  const [isActive, setIsActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      setIsActive(nextState === "active");
    });
    return () => subscription.remove();
  }, []);

  return isActive;
}
