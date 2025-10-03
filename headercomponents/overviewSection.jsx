import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../app/themeContext";

export default function OverviewSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>Overview</Text>
      <View style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9", borderColor: isDark ? "#333" : "#ddd" }]}>
        <Text style={{ color: isDark ? "#fff" : "#333" }}>
          Summary of plots, sensors, and key data goes here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  card: { padding: 16, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
});
