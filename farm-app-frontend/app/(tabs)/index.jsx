import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../themeContext"; // adjust path if needed

export default function HomeScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter()



  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}
      contentContainerStyle={{ padding: 15 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.farmName, { color: isDark ? "#fff" : "#333" }]}>
          My Farm 🌱
        </Text>
        <Text style={[styles.weatherChip, { color: isDark ? "#ccc" : "#666" }]}>
          28°C | ☁️ Rain: 20% | 🌬️ Wind: 12km/h
        </Text>
      </View>

      {/* Grid of stats */}
      <Text style={[styles.farmName, { color: isDark ? "#fff" : "#333", fontSize: 18, marginBottom: 10 }]}>
        Field Stats:
      </Text>
      <View style={styles.grid}>
        {[
          { title: "Moisture", value: "45%" },
          { title: "pH", value: "6.8" },
          { title: "Temp", value: "27°C" },
          { title: "NDVI", value: "0.73" },
        ].map((item) => (
          <View
            key={item.title}
            style={[
              styles.card,
              { backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5" },
            ]}
          >
            <Text style={[styles.cardTitle, { color: isDark ? "#ccc" : "#444" }]}>{item.title}</Text>
            <Text style={[styles.cardValue, { color: "#22c55e" }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#333" }]}>
          Recommendations
        </Text>
        <View
          style={[
            styles.recCard,
            { backgroundColor: isDark ? "#2a2a2a" : "#eef6ee" },
          ]}
        >
          <Text style={[styles.recText, { color: isDark ? "#ccc" : "#333" }]}>
            Irrigation needed in 2 days
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Go Live button */}
      <TouchableOpacity style={styles.goLiveButton}>
        <Text style={styles.goLiveText}>Go Live</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 20 },
  farmName: { fontSize: 22, fontWeight: "bold" },
  weatherChip: { marginTop: 5, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", padding: 15, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontSize: 14 },
  cardValue: { fontSize: 18, fontWeight: "bold", color: "#22c55e" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  recCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderRadius: 8 },
  recText: { fontSize: 14 },
  ctaButton: { backgroundColor: "#22c55e", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  ctaText: { color: "#fff", fontSize: 14 },
  goLiveButton: { marginTop: 30, backgroundColor: "#ef4444", padding: 15, borderRadius: 8, alignItems: "center" },
  goLiveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
