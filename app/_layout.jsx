import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import NavigationHandler from "./NavigationHandler"; // import the handler
import { ThemeProvider } from "./themeContext"; // relative path

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const stored = await AsyncStorage.getItem("userToken");
        setToken(stored);
      } catch (e) {
        console.error("Error loading token", e);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      {/* Device bars follow theme */}
      <NavigationHandler />

      <Stack screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
