import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ConnectSensors() {
  const sampleMessages = [
    { id: 1, msg: "{ moisture: 45, ph: 6.7, temperature: 27°C}" },
    { id: 2, msg: "{ moisture: 47, ph: 6.8, temperature: 28°C}" },
    { id: 3, msg: "{ moisture: 49, ph: 6.9, temperature: 30°C}" },
    { id: 4, msg: "{ moisture: 50, ph: 6.9, temperature: 32°C}" },
    { id: 5, msg: "{ moisture: 49, ph: 7.0, temperature: 30°C}" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title} className=''>Connect Sensors</Text>

      <View style={styles.section}>
        <Text style={styles.label}>MQTT Topic:</Text>
        <Text style={styles.value}>farm/soil/sensor</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sample Payload:</Text>
        <Text style={styles.value}>{'{ moisture: 45, ph: 6.8 }'}</Text>
      </View>

      <Text style={styles.subtitle}>Last 5 Messages</Text>
      {sampleMessages.map((m) => (
        <View key={m.id} style={styles.message}>
          <Text>{m.msg}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#333" },
  section: { marginBottom: 15 },
  label: { fontSize: 14, color: "#555" },
  value: { fontSize: 16, fontWeight: "600", color: "#22c55e" },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  message: { padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 6, marginBottom: 8, backgroundColor: "#f9f9f9" },
});
