import { ScrollView, Text, View } from "react-native";
import SensorsSection from "../../headercomponents/sensorSection";
import { useTheme } from "../themeContext";

export default function ConnectedSensorsScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fefefe" }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 16,
          color: isDark ? "#fff" : "#333",
        }}
      >
        Connected Sensors
      </Text>

      <SensorsSection />

      <View
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          backgroundColor: isDark ? "#1e1e1e" : "#fff",
        }}
      >
        <Text style={{ color: isDark ? "#ccc" : "#6b7280" }}>
          All sensor readings from your farm will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}
