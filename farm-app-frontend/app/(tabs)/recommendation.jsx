import { ScrollView, Text, View } from "react-native";
import PredictionSection from "../../headercomponents/predictionSection";
import { useTheme } from "../themeContext"; // import theme

export default function RecommendationScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ScrollView
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? "#121212" : "#fefefe" }}
    >

      {/* Title */}
      <Text
        className="text-2xl font-bold mb-4"
        style={{ color: isDark ? "#fff" : "#333" }}
      >
        Recommendations
      </Text>

      {/* Prediction Section */}
      <PredictionSection />

      {/* Optional: Live Sensor Section */}
      {/* <LiveSensorSection /> */}

      {/* Placeholder / future expansions */}
      <View
        className="mt-6 p-4 rounded-xl shadow"
        style={{
          backgroundColor: isDark ? "#1e1e1e" : "#fff",
        }}
      >
        <Text style={{ color: isDark ? "#ccc" : "#6b7280", fontSize: 14 }}>
          More AI insights and crop advice will appear here in future updates.
        </Text>
      </View>
    </ScrollView>
  );
}
