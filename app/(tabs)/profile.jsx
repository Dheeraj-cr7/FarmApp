import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../themeContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    const loadUser = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      const name = await AsyncStorage.getItem("userName");
      if (email) setUserEmail(email);
      if (name) setUserName(name);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userEmail");
    await AsyncStorage.removeItem("userName");
    router.replace("/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>My Profile</Text>

      <View style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9" }]}>
        <Text style={[styles.label, { color: isDark ? "#bbb" : "#555" }]}>Name:</Text>
        <Text style={[styles.value, { color: isDark ? "#fff" : "#333" }]}>{userName || "Not available"}</Text>

        <Text style={[styles.label, { color: isDark ? "#bbb" : "#555" }]}>Email:</Text>
        <Text style={[styles.value, { color: isDark ? "#fff" : "#333" }]}>{userEmail || "Not available"}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9" }]}>
       <View style={styles.option}>
          <View style={styles.optionRow}>
          <Text style={[styles.optionText, { color: isDark ? "#fff" : "#007bff" }]}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />  
        </View>
       </View>

        <TouchableOpacity style={styles.option}>
          <Text style={[styles.optionText, { color: isDark ? "#007bff" : "#007bff" }]}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={[styles.optionText, { color: isDark ? "#007bff" : "#007bff" }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity className="border-b" style={styles.option}>
          <Text style={[styles.optionText, { color: isDark ? "#007bff" : "#007bff" }]}>Privacy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: isDark ? "#ff4d6d" : "#e63946" }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: { padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: "#ddd" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 5 },
  value: { fontSize: 16, marginBottom: 10 },
  optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
  option: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  optionText: { fontSize: 16 },
  logoutBtn: { padding: 15, borderRadius: 10, alignItems: "center", marginTop: "auto" },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
