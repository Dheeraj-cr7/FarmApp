import { Button, FlatList, StyleSheet, Text, View } from "react-native";

const dummyHistory = [
  { id: "1", date: "2025-09-01", sensor: "Soil Moisture", value: "28%" },
  { id: "2", date: "2025-09-02", sensor: "Soil pH", value: "6.5" },
  { id: "3", date: "2025-09-03", sensor: "Temperature", value: "32°C" },
  { id: "4", date: "2025-09-04", sensor: "NDVI", value: "0.78" },
];

export default function HistorySection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Sensor Data History</Text>
      <Text style={styles.subtitle}>📅 Filter by Date Range (Coming Soon)</Text>

      {/* List of past readings */}
      <FlatList
        data={dummyHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text style={styles.cardSensor}>{item.sensor}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 70 }} // space for bottom button
      />

      {/* Full width Export Button at bottom */}
      <View style={styles.btnWrapper}>
        <Button title="Export Data" onPress={() => alert("Exported!")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 12 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  cardDate: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  cardSensor: {
    fontSize: 14,
    color: "#444",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22c55e",
    marginTop: 2,
  },
  btnWrapper: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
  },
});
