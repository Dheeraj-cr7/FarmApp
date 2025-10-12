import { Ionicons } from "@expo/vector-icons"; // Import for the eye icon
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const [showPassword, setShowPassword] = useState(false); // New state for Password visibility



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

    // Basic Email Validation (optional but helpful)
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
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
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>Create Account ✨</Text>

        {/* Name Input */}
        <View style={inputContainerStyle}>
          <TextInput
            style={[styles.input, inputTextStyle]}
            placeholder="Name"
            placeholderTextColor={placeholderColor}
            value={name}
            onChangeText={setName}
          />
        </View>


        {/* Email Input */}
        <View style={inputContainerStyle}>
          <TextInput
            style={[styles.input, inputTextStyle]}
            placeholder="Email"
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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
            secureTextEntry={!showPassword} // Toggle based on state
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>


        {/* Confirm Password Input Container with Eye Button */}
        <View style={[inputContainerStyle, styles.passwordInputContainer]}>
          <TextInput
            style={[styles.input, styles.passwordInput, inputTextStyle]}
            placeholder="Confirm Password"
            placeholderTextColor={placeholderColor}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword} // Toggle based on state
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>


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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40, // Added vertical padding for better spacing inside ScrollView
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  // Styles for the common input wrapper (used for Name, Email, Password)
  inputContainer: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 50,
  },
  // Style applied to the actual TextInput components
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingRight: 0,
    borderWidth: 0,
  },
  passwordInputContainer: {
    // Specific styles if needed
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
