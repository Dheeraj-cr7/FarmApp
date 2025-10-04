import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../app/themeContext";

export default function PredictionSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const sensorData = { nitrogen: 45, phosphorus: 30, potassium: 25, ph: 6.5 };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // fake delay
      const result = { disease: "Leaf Blight", risk: "High", advice: "Ensure proper irrigation and apply preventive fungicide." };
      setPrediction(result);
    } catch (e) {
      setPrediction({ error: "Failed to get prediction. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#333" }]}>Disease Prediction</Text>

      <View style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9", borderColor: isDark ? "#333" : "#ddd" }]}>
        <Text style={[styles.subtitle, { color: isDark ? "#fff" : "#333" }]}>Sensor Values</Text>
        <Text style={{ color: isDark ? "#fff" : "#333" }}>Nitrogen (N): {sensorData.nitrogen}</Text>
        <Text style={{ color: isDark ? "#fff" : "#333" }}>Phosphorus (P): {sensorData.phosphorus}</Text>
        <Text style={{ color: isDark ? "#fff" : "#333" }}>Potassium (K): {sensorData.potassium}</Text>
        <Text style={{ color: isDark ? "#fff" : "#333" }}>pH: {sensorData.ph}</Text>
      </View>

      <TouchableOpacity style={[styles.predictBtn, { backgroundColor: "#22c55e" }]} onPress={handlePredict}>
        <Text style={styles.predictText}>Get Predictionsx`</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="green" style={{ marginTop: 20 }} />}

      {prediction && (
        <View className="mt-[20]" style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9", borderColor: isDark ? "#333" : "#ddd" }]}>
          {prediction.error ? (
            <Text style={{ color: "red", fontWeight: "bold" }}>{prediction.error}</Text>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: isDark ? "#fff" : "#333" }]}>Prediction Result</Text>
              <Text style={{ color: isDark ? "#fff" : "#333" }}>Disease: {prediction.disease}</Text>
              <Text style={{ color: isDark ? "#fff" : "#333" }}>Risk Level: {prediction.risk}</Text>
              <Text style={{ color: isDark ? "#ccc" : "#555" }}>Advice: {prediction.advice}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  card: { padding: 16, borderRadius: 10, marginBottom: 16, borderWidth: 1 },
  subtitle: { fontWeight: "bold", marginBottom: 8 },
  predictBtn: { padding: 14, borderRadius: 10, alignItems: "center" },
  predictText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
