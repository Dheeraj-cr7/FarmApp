import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import HistorySection from "../../headercomponents/historySection";
import OverviewSection from "../../headercomponents/overviewSection";
import SensorsSection from "../../headercomponents/sensorSection";
import { useTheme } from "../themeContext";

export default function Plots() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection />;
      case "sensors":
        return <SensorsSection />;
      case "history":
        return <HistorySection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      {/* Tabs Header */}
      <View style={[styles.tabRow, { backgroundColor: isDark ? "#1e1e1e" : "#f4f4f4" }]}>
        {["overview", "sensors", "history"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: "#22c55e" },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && { color: "#fff" },
              { color: isDark ? "#fff" : "#333" }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Render active section */}
      <View style={styles.content}>{renderTab()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  content: { flex: 1, padding: 12 },
});
