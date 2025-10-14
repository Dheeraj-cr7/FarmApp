import { FlatList, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../app/themeContext"; // adjust path if needed

const dummyHistory = [
  { id: "1", date: "2025-09-01", sensor: "Soil Moisture", value: "28%" },
  { id: "2", date: "2025-09-02", sensor: "Soil pH", value: "6.5" },
  { id: "3", date: "2025-09-03", sensor: "Temperature", value: "32°C" },
  { id: "4", date: "2025-09-04", sensor: "NDVI", value: "0.78" },
];

export default function HistorySection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>
        📖 Sensor Data History
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
        📅 Filter by Date Range (Coming Soon)
      </Text>

      {/* List of past readings */}
      <FlatList
        data={dummyHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9",
                borderColor: isDark ? "#333" : "#e5e5e5",
              },
            ]}
          >
            <Text style={[styles.cardDate, { color: isDark ? "#fff" : "#333" }]}>{item.date}</Text>
            <Text style={[styles.cardSensor, { color: isDark ? "#ccc" : "#444" }]}>{item.sensor}</Text>
            <Text style={[styles.cardValue, { color: "#22c55e" }]}>{item.value}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 70 }} // space for bottom button
      />

      {/* Full width Export Button at bottom */}
      {/* <View style={styles.btnWrapper}>
        <Button title="Export Data" color={isDark ? "#22c55e" : undefined} onPress={() => alert("Exported!")} />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 12 },
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardDate: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  cardSensor: { fontSize: 14 },
  cardValue: { fontSize: 16, fontWeight: "bold", marginTop: 2 },
  btnWrapper: { position: "absolute", bottom: 5, left: 0, right: 0 },
});
