import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LiveScreen() {
  return (
    <View style={styles.container}>
      {/* HLS video placeholder */}
      <View style={styles.videoBox}>
        <Text style={styles.videoText}>🎥 Live Stream (HLS Player here)</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add Marker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Snapshot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  videoBox: { width: "90%", height: 200, backgroundColor: "#000", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  videoText: { color: "#fff" },
  controls: { flexDirection: "row", marginTop: 20 },
  button: { backgroundColor: "#22c55e", padding: 12, marginHorizontal: 10, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
