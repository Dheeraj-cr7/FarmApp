import { Ionicons } from "@expo/vector-icons"; // Import for the eye icon
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../supabase";
import { useTheme } from "./themeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  // Replaced alert() with standard Alert.alert() for Expo compatibility
  const showAlert = (title, message) => Alert.alert(title, message);

  async function signInWithEmail() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        showAlert("Login Failed", error.message);
        console.error("Login Error:", error.message);
        return;
      }

      if (data.session && data.user) {
        // Using AsyncStorage here, but it's commented out in your original code
        // await AsyncStorage.setItem("userToken", data.session.access_token); 
        router.push("/(tabs)/");
      } else {
        showAlert("Authentication Failed", "Authentication failed. Please check your network.");
      }

    } catch (error) {
      console.error("Catch Block Error:", error);
      showAlert("Unexpected Error", "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  }

  const handleLoginMock = async () => {
    if (!email || !password) {
      showAlert("Missing Info", "Please fill in all fields");
      return;
    }

    try {
      // This block handles the old mock login using AsyncStorage
      await AsyncStorage.setItem("userToken", "dummy-token");
      await AsyncStorage.setItem("userEmail", email);
      await AsyncStorage.setItem("userName", "");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Mock Login failed:", error);
      showAlert("Mock Login Failed", "Login failed. Try again.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff", justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const inputContainerStyle = [styles.inputContainer, { borderColor: isDark ? "#444" : "#ccc", backgroundColor: isDark ? "#1e1e1e" : "#fff" }];
  const inputTextStyle = { color: isDark ? "#fff" : "#000" };
  const placeholderColor = isDark ? "#aaa" : "#999";
  const iconColor = isDark ? "#aaa" : "#555";

  return (
    // 1. Use KeyboardAvoidingView to push content up when the keyboard is active
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>Welcome Back 👋</Text>

        {/* Email Input */}
        <View style={inputContainerStyle}>
          <TextInput
            style={[styles.input, inputTextStyle]}
            placeholder="Email"
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>


        {/* Password Input Container with Eye Button */}
        <View style={[inputContainerStyle, styles.passwordInputContainer]}>
          <TextInput
            style={[styles.input, styles.passwordInput, inputTextStyle]}
            placeholder="Password"
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Toggle secure text entry based on state
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"} // Icon based on visibility
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>


        <TouchableOpacity style={[styles.button, { backgroundColor: "#22c55e" }]} onPress={signInWithEmail}>
          <Text style={[styles.buttonText, { color: "#fff" }]}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signUp")}>
          <Text style={[styles.link, { color: "#22c55e" }]}>Don’t have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20, // Add padding to the top/bottom of the content inside KBV
    paddingBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  // Style for the wrapper around the TextInput
  inputContainer: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row', // Allows the icon and text input to be side-by-side
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 50, // Fixed height for consistent look
  },
  // Style applied to all TextInputs
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0, // Reset padding for consistency inside inputContainer
    paddingRight: 0,
    // Ensure no border/margin properties that conflict with inputContainer
    borderWidth: 0,
  },
  passwordInputContainer: {
    // specific styles if needed, currently same as inputContainer
  },
  passwordInput: {
    paddingRight: 10, // Add space between input text and the icon
  },
  eyeButton: {
    padding: 5,
  },
  button: { width: "100%", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { fontSize: 16, fontWeight: "600" },
  link: { marginTop: 15, fontSize: 14 },
});
