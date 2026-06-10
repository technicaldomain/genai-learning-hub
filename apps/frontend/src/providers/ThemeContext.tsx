/**
 * Theme mode context — lets components toggle between light/dark/system.
 */

import * as React from "react";
import type { ThemeMode } from "../app";

export interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  mode: "system",
  toggleTheme: () => {},
});

export function useThemeMode() {
  return React.useContext(ThemeContext);
}
