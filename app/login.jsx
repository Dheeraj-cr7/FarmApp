import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "./themeContext"; // adjust path if needed

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await AsyncStorage.setItem("userToken", "dummy-token");
      await AsyncStorage.setItem("userEmail", email); 
      await AsyncStorage.setItem("userName", ""); 
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>Welcome Back 👋</Text>

      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
        placeholder="Email"
        placeholderTextColor={isDark ? "#aaa" : "#999"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
        placeholder="Password"
        placeholderTextColor={isDark ? "#aaa" : "#999"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: "#22c55e" }]} onPress={handleLogin}>
        <Text style={[styles.buttonText, { color: "#fff" }]}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signUp")}>
        <Text style={[styles.link, { color: "#22c55e" }]}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  input: { width: "100%", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15 },
  button: { width: "100%", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { fontSize: 16, fontWeight: "600" },
  link: { marginTop: 15, fontSize: 14 },
});
