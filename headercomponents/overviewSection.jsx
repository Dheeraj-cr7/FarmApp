import { StyleSheet, Text, View } from "react-native";

export default function OverviewSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      <Text>📊 Line Chart (Last 7 days)</Text>
      <Text>🌡️ Current Stats</Text>
      <Text>📝 Add Note</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});
