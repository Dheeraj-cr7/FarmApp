import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Load theme from AsyncStorage on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("appTheme");
        if (storedTheme) setTheme(storedTheme);
      } catch (e) {
        console.error("Failed to load theme:", e);
      }
    };
    loadTheme();
  }, []);

  // Save theme to AsyncStorage whenever it changes
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("appTheme", newTheme);
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
