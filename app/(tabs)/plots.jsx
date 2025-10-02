import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { HistorySection, ImagesSection, OverviewSection, SensorsSection } from "../../headercomponents";


import HistorySection from "@/headercomponents/historySection";
import ImagesSection from "@/headercomponents/imageSection";
import OverviewSection from "@/headercomponents/overviewSection";
import SensorsSection from "@/headercomponents/sensorSection";

export default function PlotsScreen() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection />;
      case "sensors":
        return <SensorsSection />;
      case "images":
        return <ImagesSection />;
      case "history":
        return <HistorySection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs Header */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={styles.tabText}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sensors" && styles.activeTab]}
          onPress={() => setActiveTab("sensors")}
        >
          <Text style={styles.tabText}>Sensors</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "images" && styles.activeTab]}
          onPress={() => setActiveTab("images")}
        >
          <Text style={styles.tabText}>Images</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Section Content */}
      <View style={styles.content}>{renderTab()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f4f4f4",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#22c55e",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
