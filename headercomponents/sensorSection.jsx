import { FlatList, StyleSheet, Text, View } from "react-native";

const dummySensors = [
  { id: "1", name: "Moisture", status: "online", lastPacket: "5s ago" },
  { id: "2", name: "pH", status: "offline", lastPacket: "—" },
  { id: "3", name: "Temp", status: "online", lastPacket: "8s ago" },
];

export default function SensorsSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensors</Text>
      <FlatList
        data={dummySensors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sensorCard}>
            <Text style={styles.sensorName}>{item.name}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Last Packet: {item.lastPacket}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  sensorCard: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  sensorName: { fontSize: 16, fontWeight: "600" },
});
