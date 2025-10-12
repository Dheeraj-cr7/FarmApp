import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "./themeContext"; // adjust the path if needed

export default function SignupScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles the first step of signup: validation and navigation.
   * Supabase signup is deferred to the FarmerDetailsScreen.
   */
  const handleNextStep = () => {
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      setLoading(false);
      return;
    }

    router.push({
      pathname: "/farmer-details",
      params: {
        name: name,
        email: email,
        password: password,
      }
    });

    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>Create Account ✨</Text>

      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
        placeholder="Name"
        placeholderTextColor={isDark ? "#aaa" : "#999"}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
        placeholder="Email"
        placeholderTextColor={isDark ? "#aaa" : "#999"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
        placeholder="Password"
        placeholderTextColor={isDark ? "#aaa" : "#999"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={[styles.input, { backgroundColor: isDark ? "#1e1e1e" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
        placeholder="Confirm Password"
        placeholderTextColor={isDark ? "#aaa" : "#999"}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isDark ? "#22c55e" : "#22c55e" }]}
        onPress={handleNextStep}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>{loading ? "Checking..." : "Next: Add Farm Details"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={[styles.link, { color: isDark ? "#22c55e" : "#22c55e" }]}>Already have an account? Log In</Text>
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
