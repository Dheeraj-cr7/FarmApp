import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from '../../supabase'; // Assuming supabase client is imported
import { useTheme } from "../themeContext"; // adjust path if needed

// --- CONFIGURATION / MOCK DATA STRUCTURE ---

const initialStats = {
  userId: null,
  temperature: null, // Now dynamically set from farmer_details
  humidity: null,    // Now dynamically set from farmer_details
  nitrogen: null,
  phosphorus: null,
  potassium: null,
  soilMoisture: null,
  ph: null,
  // REMOVED: rainStatus
  isLoading: true,
};


export default function HomeScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const [stats, setStats] = useState(initialStats);

  // Theme color map
  const themeColors = {
    background: isDark ? "#121212" : "#fff",
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    cardBg: isDark ? "#1e1e1e" : "#f5f5f5",
    recCardBg: isDark ? "#2a2a2a" : "#eef6ee",
    primary: "#22c55e",
    danger: "#ef4444",
  };

  // --- Data Fetching Logic ---

  const fetchUserId = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session?.user) {
        setStats(prev => ({ ...prev, userId: session.user.id }));
        return session.user.id;
      } else {
        setStats(prev => ({ ...prev, isLoading: false }));
        Alert.alert("Error", "User not logged in.");
        return null;
      }
    } catch (e) {
      console.error("Auth Fetch Error:", e.message);
      setStats(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  };

  // This now fetches N, P, K, pH, Soil Moisture AND Weather details
  const fetchSensorData = async (currentUserId) => {
    if (!currentUserId) return;

    try {
      // --- 1. Fetch Farm Details (Temp, Humidity) ---
      // Removed 'will_rain' from the select query
      const { data: farmDetails, error: weatherError } = await supabase
        .from('farmer_details')
        .select('default_temp, default_humidity')
        .eq('user_id', currentUserId)
        .limit(1)
        .single();



      if (weatherError && weatherError.code !== 'PGRST116') throw weatherError;

      // --- 2. Fetch Sensor Data (NPK, pH, Moisture) ---
      const { data: sensorData, error: sensorError } = await supabase
        .from('crop_data')
        .select('nitrogen, phosphorus, potassium, ph, soil_moisture')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sensorError && sensorError.code !== 'PGRST116') throw sensorError;

      // --- 3. Consolidate Data ---
      setStats(prev => ({
        ...prev,
        // Set Weather/Farm Details
        temperature: farmDetails?.default_temp || null,
        humidity: farmDetails?.default_humidity || null,
        // REMOVED: rainStatus update
        // Set Sensor Data
        nitrogen: sensorData?.nitrogen || null,
        phosphorus: sensorData?.phosphorus || null,
        potassium: sensorData?.potassium || null,
        soilMoisture: sensorData?.soil_moisture || null,
        ph: sensorData?.ph || null,
      }));

    } catch (e) {
      console.error("Combined Data Fetch Error:", e.message);
    } finally {
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Combined fetch on mount
  useEffect(() => {
    const loadData = async () => {
      const id = await fetchUserId();
      if (id) {
        fetchSensorData(id);
      }
    };
    loadData();
  }, []);


  // --- Recommendation Logic (Simplified) ---
  const showIrrigationNeeded = () => {
    // Irrigation check is now solely based on soil moisture < 60%
    return stats.soilMoisture !== null && stats.soilMoisture < 60;
  };

  // Recommendation card message
  const getRecommendationMessage = () => {
    if (showIrrigationNeeded()) {
      return "Irrigation needed! Soil moisture is low.";
    }
    return "Soil moisture is sufficient. Keep monitoring.";
  };


  // Helper for formatting
  const formatValue = (val, suffix = '') => val !== null && !isNaN(val) ? val.toFixed(1) + suffix : 'N/A';

  // Data for the stats grid (N, P, K, pH)
  const gridData = [
    { title: "Nitrogen (N)", value: formatValue(stats.nitrogen) },
    { title: "Phosphorus (P)", value: formatValue(stats.phosphorus) },
    { title: "Potassium (K)", value: formatValue(stats.potassium) },
    { title: "pH", value: formatValue(stats.ph) },
  ];

  if (stats.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={{ color: themeColors.secondaryText, marginTop: 10 }}>Loading farm data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}
      contentContainerStyle={{ padding: 15 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.farmName, { color: themeColors.text }]}>
          My Farm 🌱
        </Text>

        {/* DYNAMIC HEADER CHIP: Displaying Temp and Humidity */}
        <Text style={[styles.weatherChip, { color: themeColors.secondaryText }]}>
          {formatValue(stats.temperature, '°C')} | 💧 Humidity: {formatValue(stats.humidity, '%')}
          {/* REMOVED: Rain Expected status */}
        </Text>
      </View>

      {/* Grid of stats */}
      <Text style={[styles.farmName, { color: themeColors.text, fontSize: 18, marginBottom: 10 }]}>
        Soil Nutrients:
      </Text>
      <View style={styles.grid}>
        {gridData.map((item) => (
          <View
            key={item.title}
            style={[
              styles.card,
              { backgroundColor: themeColors.cardBg },
            ]}
          >
            <Text style={[styles.cardTitle, { color: themeColors.secondaryText }]}>{item.title}</Text>
            <Text style={[styles.cardValue, { color: themeColors.primary }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      {/* <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Recommendations
        </Text>
        <View
          style={[
            styles.recCard,
            {
              // Background color shifts to danger ONLY if irrigation is needed
              backgroundColor: showIrrigationNeeded() ? themeColors.danger : themeColors.recCardBg,
              borderColor: themeColors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.recText, {
            // Text color changes for better contrast on danger background
            color: showIrrigationNeeded() ? themeColors.text : themeColors.secondaryText
          }]}>
            {getRecommendationMessage()}
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaText}>Action</Text>
          </TouchableOpacity>
        </View>
      </View> */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { flex: 1 },
  header: { marginBottom: 20 },
  farmName: { fontSize: 22, fontWeight: "bold" },
  weatherChip: { marginTop: 5, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3
  },
  cardTitle: { fontSize: 14 },
  cardValue: { fontSize: 18, fontWeight: "bold" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  recCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8
  },
  recText: { fontSize: 14 },
  ctaButton: { backgroundColor: "#22c55e", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  ctaText: { color: "#fff", fontSize: 14, fontWeight: 'bold' },
});
