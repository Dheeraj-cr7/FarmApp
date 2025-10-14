import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react"; // Added useCallback for useFocusEffect support
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../app/themeContext";
import { supabase } from '../supabase';



// Initial state structure matching expected UI fields
const initialSensorData = {
  nitrogen: null,
  phosphorus: null,
  potassium: null,
  ph: null,
  soil_moisture: null,
  // Assuming a separate field for general humidity from farmer_details
  humidity: null,
  lastUpdated: null,
};


// The component no longer relies on the 'stats' prop
export default function SensorsSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sensorData, setSensorData] = useState(initialSensorData);

  // Define theme-based colors internally, ensuring dynamic changes.
  const colors = {
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    cardBg: isDark ? "#1e1e1e" : "#f5f5f5",
    primary: "#22c55e",
    danger: isDark ? "#f87171" : "#ef4444",
  };

  // Helper for formatting
  const formatValue = (val, suffix = '') => val !== null && !isNaN(val) ? val.toFixed(1) + suffix : 'N/A';

  // Helper to format the last updated time
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Data not yet loaded';
    try {
      const date = new Date(timestamp);
      return `Last Updated: ${date.toLocaleTimeString()}`;
    } catch (e) {
      return 'Last Updated: N/A';
    }
  };

  // --- Data Fetching Logic ---

  const fetchUserId = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUserId(session?.user?.id || null);
    } catch (e) {
      console.error("Auth Fetch Error:", e.message);
      setUserId(null);
    }
  };

  const fetchSensorData = async (currentUserId) => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Fetch 1: Fetch the latest row from the crop_data table
      const { data: cropData, error: cropError } = await supabase
        .from('crop_data')
        .select('nitrogen, phosphorus, potassium, ph, soil_moisture, created_at')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cropError && cropError.code !== 'PGRST116') throw cropError;

      // Fetch 2: Fetch Humidity from farmer_details
      const { data: detailsData, error: detailsError } = await supabase
        .from('farmer_details')
        .select('default_humidity')
        .eq('user_id', currentUserId)
        .single();

      // Allow fetching to continue if farmer_details is empty (PGRST116)
      if (detailsError && detailsError.code !== 'PGRST116') throw detailsError;

      const humidityValue = detailsData?.default_humidity;

      if (cropData) {
        setSensorData({
          nitrogen: cropData.nitrogen,
          phosphorus: cropData.phosphorus,
          potassium: cropData.potassium,
          ph: cropData.ph,
          soil_moisture: cropData.soil_moisture,
          lastUpdated: cropData.created_at,
          // Use the fetched humidity value from farmer_details
          humidity: humidityValue || null,
        });
      } else {
        setSensorData({
          ...initialSensorData,
          // Still set humidity even if crop data is missing
          humidity: humidityValue || null,
        });
        setError("No crop sensor data found for this user.");
      }

    } catch (e) {
      console.error("Supabase Fetch Error:", e.message);
      setError(`Failed to load sensor data: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };


  // 1. Fetch User ID on component mount
  useEffect(() => {
    fetchUserId();
  }, []);

  // 2. Fetch data whenever user ID changes (or use useFocusEffect)
  useEffect(() => {
    if (userId) {
      fetchSensorData(userId);
    }
  }, [userId]);



  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchSensorData(userId);
      }
    }, [userId])
  );


  // Dynamic sensor data list, now using internal state (sensorData)
  const sensors = [
    {
      name: "Soil Moisture",
      value: formatValue(sensorData.soil_moisture, '%'),
    },
    {
      name: "pH Level",
      value: formatValue(sensorData.ph),
    },
    {
      name: "Nitrogen (N)",
      value: formatValue(sensorData.nitrogen, ' ppm'),
    },
    {
      name: "Phosphorus (P)",
      value: formatValue(sensorData.phosphorus, ' ppm'),
    },
    {
      name: "Potassium (K)",
      value: formatValue(sensorData.potassium, ' ppm'),
    },
    // Humidity is now explicitly sourced from farmer_details fetch
    {
      name: "Humidity",
      value: formatValue(sensorData.humidity, '%'),
    },
  ];


  // --- Render Logic ---

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.secondaryText, marginTop: 10 }}>Loading sensor data...</Text>
      </View>
    );
  }

  if (error || !userId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: colors.danger, fontWeight: 'bold' }}>
          {error || "Authentication required to view sensor data."}
        </Text>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Field Sensor Readings
        </Text>
        <Text style={[styles.updateTime, { color: colors.secondaryText }]}>
          {formatLastUpdated(sensorData.lastUpdated)}
        </Text>
      </View>
      <View style={styles.sensorGrid}>
        {sensors.map((s, idx) => (
          <View
            key={idx}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBg,
                borderColor: isDark ? "#333" : "#ddd",
                shadowColor: isDark ? "#000" : "#ccc",
              }
            ]}
          >
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
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
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
