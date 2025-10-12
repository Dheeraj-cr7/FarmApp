import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabase";
import { useTheme } from "../themeContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === "dark";

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Auth User (for email and ID)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (user) {
          setUserEmail(user.email || "Email not available");

          // 2. Fetch Profile Name from 'profiles' table using the user's ID
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name') // Assuming the column storing the name is 'name'
            .eq('id', user.id) // Assuming the profile table primary key is the user ID
            .single();

          // Handle "No Rows Found" error (PGRST116) as a case where the profile is not yet created
          if (profileError && profileError.code !== 'PGRST116') throw profileError;

          if (profileData) {
            setUserName(profileData.full_name || "Name not set");
          } else {
            setUserName("Profile not created");
          }
        } else {
          // If no user, show placeholder text
          setUserEmail("Not logged in");
          setUserName("Not logged in");
        }

      } catch (e) {
        console.error("Error fetching user data:", e.message);
        setUserEmail("Failed to load email");
        setUserName("Failed to load name");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout Error:", error.message);
      // In a real app, you'd show a custom error UI, but for now we log it.
    }
    router.replace("/login");
  };


  const themeColors = {
    text: isDark ? "#fff" : "#333",
    label: isDark ? "#bbb" : "#555",
    cardBg: isDark ? "#1e1e1e" : "#f9f9f9",
    borderColor: isDark ? "#333" : "#ddd",
    primary: isDark ? "#007bff" : "#007bff",
    logoutBg: isDark ? "#ff4d6d" : "#e63946",
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>My Profile</Text>

      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.borderColor }]}>
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.text} />
        ) : (
          <>
            <Text style={[styles.label, { color: themeColors.label }]}>Name:</Text>
            <Text style={[styles.value, { color: themeColors.text }]}>{userName}</Text>

            <Text style={[styles.label, { color: themeColors.label }]}>Email:</Text>
            <Text style={[styles.value, { color: themeColors.text }]}>{userEmail}</Text>
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.borderColor }]}>
        <View style={[styles.option, { borderBottomColor: themeColors.borderColor }]}>
          <View style={styles.optionRow}>
            <Text style={[styles.optionText, { color: themeColors.primary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: themeColors.label, true: "#22c55e" }}
              thumbColor={isDark ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.option, { borderBottomColor: themeColors.borderColor }]}>
          <Text style={[styles.optionText, { color: themeColors.primary }]}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, { borderBottomColor: themeColors.borderColor }]}>
          <Text style={[styles.optionText, { color: themeColors.primary }]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={[styles.optionText, { color: themeColors.primary }]}>Privacy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: themeColors.logoutBg }]}
        onPress={handleLogOut}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: { padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 5 },
  value: { fontSize: 16, marginBottom: 10 },
  optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  option: { paddingVertical: 10, borderBottomWidth: 1, },
  optionText: { fontSize: 16 },
  logoutBtn: { padding: 15, borderRadius: 10, alignItems: "center", marginTop: "auto" },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
