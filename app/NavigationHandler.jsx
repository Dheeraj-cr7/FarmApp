import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { useTheme } from "./themeContext"; // make sure the path is correct

export default function NavigationHandler() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    // Change status bar style
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");

    // Change Android navigation bar style
    NavigationBar.setBackgroundColorAsync(isDark ? "#1e1e1e" : "#fff");
    NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
  }, [isDark]);

  return null; // no UI, just handles device bars
}
