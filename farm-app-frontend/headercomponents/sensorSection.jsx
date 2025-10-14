import { StyleSheet, Text, View } from "react-native";
// Ensure the path to themeContext is correct relative to the file using it
import { useTheme } from "../app/themeContext";

// The component now relies only on the 'stats' prop for data, and gets theme context internally.
export default function SensorsSection({ stats = {} }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Define theme-based colors internally, using the theme context, ensuring dynamic changes.
  const colors = {
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    cardBg: isDark ? "#1e1e1e" : "#f5f5f5",
    primary: "#22c55e", // Assuming a fixed primary color for values
  };

  // Helper for formatting, replicated for display consistency
  const formatValue = (val, suffix = '') => val !== null && !isNaN(val) ? val.toFixed(1) + suffix : 'N/A';
  
  // Helper to format the last updated time (assuming stats.lastUpdated is a valid Date object or timestamp)
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Data not yet loaded';
    try {
      // Assuming stats.lastUpdated is a Date object or a string/number that Date can parse
      const date = new Date(timestamp);
      // Format to a readable time string
      return `Last Updated: ${date.toLocaleTimeString()}`;
    } catch (e) {
      return 'Last Updated: N/A';
    }
  };
  
  // Dynamic sensor data list - CONTEXT REMOVED
  const sensors = [
    { 
        name: "Soil Moisture", 
        value: formatValue(stats.soilMoisture, '%'), 
    },
    { 
        name: "Humidity", 
        value: formatValue(stats.humidity, '%'), 
    },
    { 
        name: "pH Level", 
        value: formatValue(stats.ph), 
    },
    { 
        name: "Nitrogen (N)", 
        value: formatValue(stats.nitrogen, ' ppm'), 
    },
    { 
        name: "Phosphorus (P)", 
        value: formatValue(stats.phosphorus, ' ppm'), 
    },
    { 
        name: "Potassium (K)", 
        value: formatValue(stats.potassium, ' ppm'), 
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Field Sensor Readings
        </Text>
        <Text style={[styles.updateTime, { color: colors.secondaryText }]}>
            {formatLastUpdated(stats.lastUpdated)}
        </Text>
      </View>
      <View style={styles.sensorGrid}>
        {sensors.map((s, idx) => (
          <View
            key={idx}
            style={[
              styles.card,
              {
                // Dynamic styling using internal color variables
                backgroundColor: colors.cardBg,
                borderColor: isDark ? "#333" : "#ddd",
                shadowColor: isDark ? "#000" : "#ccc",
              }
            ]}
          >
            {/* Displaying name and value */}
            <Text style={[styles.cardName, { color: colors.secondaryText, marginBottom: 5 }]}>{s.name}</Text>
            
            <Text style={[styles.cardValue, { color: colors.primary }]}>{s.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  updateTime: {
      fontSize: 12,
      marginTop: 2,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  card: {
    width: "48%", // Two cards per row
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    // Aesthetic shadows
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
