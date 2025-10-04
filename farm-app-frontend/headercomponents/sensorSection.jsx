import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../app/themeContext";

export default function SensorsSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Example sensor data
  const sensors = [
    { name: "Temperature", value: "28°C" },
    { name: "Soil Moisture", value: "45%" },
    { name: "pH Level", value: "6.5" },
    { name: "Nitrogen", value: "45" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>Connected Sensors</Text>
      {sensors.map((s, idx) => (
        <View
          key={idx}
          style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9", borderColor: isDark ? "#333" : "#ddd" }]}
        >
          <Text style={{ color: isDark ? "#fff" : "#333" }}>{s.name}: {s.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
});
