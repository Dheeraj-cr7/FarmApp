import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const data = async () => {
    }
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.farmName}>My Farm 🌱</Text>
        <Text style={styles.weatherChip}>28°C | ☁️ Rain: 20% | 🌬️ Wind: 12km/h</Text>
      </View>

      {/* Grid of stats */}
      <Text style={styles.farmName}>Field Stats: </Text>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Moisture</Text>
          <Text style={styles.cardValue}>45%</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>pH</Text>
          <Text style={styles.cardValue}>6.8</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Temp</Text>
          <Text style={styles.cardValue}>27°C</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>NDVI</Text>
          <Text style={styles.cardValue}>0.73</Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recCard}>
          <Text style={styles.recText}>Irrigation needed in 2 days</Text>
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
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  header: { marginBottom: 20 },
  farmName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  weatherChip: { marginTop: 5, fontSize: 14, color: "#666" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", backgroundColor: "#f5f5f5", padding: 15, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontSize: 14, color: "#444" },
  cardValue: { fontSize: 18, fontWeight: "bold", color: "#22c55e" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  recCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: "#eef6ee", borderRadius: 8 },
  recText: { fontSize: 14, color: "#333" },
  ctaButton: { backgroundColor: "#22c55e", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  ctaText: { color: "#fff", fontSize: 14 },
  goLiveButton: { marginTop: 30, backgroundColor: "#ef4444", padding: 15, borderRadius: 8, alignItems: "center" },
  goLiveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
