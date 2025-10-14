import { useCallback, useEffect, useState } from "react"; // Added useCallback for useFocusEffect support
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { useFocusEffect } from "expo-router";
import { useTheme } from "../app/themeContext";
import { supabase } from '../supabase';


// --- REAL IMPORTS (MOCKED FOR SINGLE FILE RUNNABILITY IN THIS ENVIRONMENT) ---
// Since I cannot access your actual imports, these minimal mocks are left 
// only to prevent compilation errors here, but they should be replaced by
// your actual imports in your app (as per the commented lines above).

// Helper component for displaying key-value pairs
const StatPill = ({ label, value, color, isDark }) => (
  <View style={[styles.statPill, {
    backgroundColor: isDark ? '#1f2937' : '#e0f2f1',
    borderColor: isDark ? '#4b5563' : color,
  }]}>
    <Text style={[styles.statLabel, { color: isDark ? '#9ca3af' : '#475569' }]}>{label}</Text>
    <Text style={[styles.statValue, { color: color || (isDark ? '#fff' : '#0f766e') }]}>{value}</Text>
  </View>
);

// Main component
export default function OverviewSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State to hold the user ID and fetched data
  const [userId, setUserId] = useState(null);
  const [details, setDetails] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- CORE DATA FETCHING LOGIC ---

  const fetchUserId = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUserId(session?.user?.id || null);
    } catch (e) {
      console.error("Auth Fetch Error:", e.message);
      Alert.alert("Auth Error", "Failed to get session. Please log in.");
      setUserId(null);
      setLoading(false);
    }
  };

  const fetchFarmData = async (currentUserId) => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Fetch Farmer Details (Assuming the table name is 'farmer_details')
      const { data: detailsData, error: detailsError } = await supabase
        .from('farmer_details')
        .select('current_crop, default_temp, default_humidity, default_rainfall, farm_size_acres, farm_location, soil_type, fertilizer_history')
        .eq('user_id', currentUserId)
        .single();

      // PGRST116 is the code for "No rows found" in Supabase, which is expected for new users.
      if (detailsError && detailsError.code !== 'PGRST116') throw detailsError;
      setDetails(detailsData || {});

      // 2. Fetch Latest Crop Data (Assuming the table name is 'crop_data')
      const { data: cropData, error: cropError } = await supabase
        .from('crop_data')
        .select('nitrogen, phosphorus, potassium, ph, soil_moisture, predicted_disease, confidence_score')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cropError && cropError.code !== 'PGRST116') throw cropError;
      setCropData(cropData || {});

    } catch (e) {
      console.error("Data fetch error:", e.message);
      setError(`Failed to load farm data: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };


  // 1. Fetch User ID on component mount
  useEffect(() => {
    fetchUserId();
  }, []);

  // 2. Use the commented-out block below with useFocusEffect 
  //    if this component is part of a React Navigation stack.

  useEffect(() => {
    if (userId) {
      fetchFarmData(userId);
    } else if (userId === null) {
      // User ID is null, but we are still loading, so wait for auth to resolve
      setLoading(true);
    } else {
      // userId is defined but falsy (e.g., explicit null from fetchUserId if no session)
      setLoading(false);
      setDetails(null);
      setCropData(null);
      setError("User not authenticated or session expired.");
    }
  }, [userId]); // Dependency array ensures fetch is called when userId is set




  useFocusEffect(
    useCallback(() => {
      // useCallback is required here to prevent infinite loops in the React Native environment.
      if (userId) {
        fetchFarmData(userId);
      }
    }, [userId])
  );



  // --- Render Configuration ---
  const containerStyle = { backgroundColor: isDark ? "#121212" : "#f0fdf4" };
  const titleColor = isDark ? "#fff" : "#059669";
  const cardBackground = isDark ? "#1e1e1e" : "#fff";
  const cardBorder = isDark ? "#333" : "#e5e7eb";
  const textColor = isDark ? "#d1d5db" : "#374151";

  if (loading) {
    return (
      <View style={[styles.loadingContainer, containerStyle]}>
        <ActivityIndicator size="large" color={isDark ? "#34d399" : "#059669"} />
        <Text style={[styles.statusText, { color: textColor }]}>Loading farm profile...</Text>
      </View>
    );
  }

  if (error || !details || !cropData) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={[styles.title, { color: titleColor }]}>Overview</Text>
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Text style={{ color: isDark ? "#ef4444" : "#b91c1c", fontWeight: 'bold' }}>
            Error Loading Data: {error || "No data found. Please ensure you are logged in and have completed the farm setup."}
          </Text>
        </View>
      </View>
    );
  }

  // --- Render with Fetched Data (Ensure fields are accessed safely) ---

  // Helper for displaying rainfall
  const getRainfallDisplay = (rainfallValue) => {
    const precip = parseFloat(rainfallValue);
    if (precip > 0.1) {
      return `${precip.toFixed(1)} mm/h`;
    }
    return 'None';
  };

  // Helper for predicted disease
  const getDiseaseColor = (disease) => {
    return disease?.toLowerCase().includes('healthy') ? '#34d399' : '#f97316';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView >

        <Text style={[styles.title, { color: titleColor }]}>Farm Overview & Health</Text>

        {/* 1. Farm Context and Climate Card */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Text style={[styles.cardTitle, { color: titleColor }]}>Farm Context</Text>

          <View style={styles.contextRow}>
            <Text style={[styles.label, { color: textColor }]}>Location:</Text>
            <Text style={[styles.value, { color: isDark ? '#fff' : '#1f2937', fontWeight: 'bold' }]}>
              {details.farm_location || 'N/A'}
            </Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={[styles.label, { color: textColor }]}>Farm Size:</Text>
            <Text style={[styles.value, { color: isDark ? '#fff' : '#1f2937' }]}>
              {details.farm_size_acres ? `${details.farm_size_acres} acres` : 'N/A'}
            </Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={[styles.label, { color: textColor }]}>Soil Type:</Text>
            <Text style={[styles.value, { color: isDark ? '#fff' : '#1f2937' }]}>
              {details.soil_type || 'N/A'}
            </Text>
          </View>

          {/* Climate Data Pills */}
          <Text style={[styles.cardSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Recent Climate Snapshot</Text>
          <View style={styles.pillsContainer}>
            <StatPill label="Temp (°C)" value={details.default_temp || 'N/A'} color="#3b82f6" isDark={isDark} />
            <StatPill label="Humidity (%)" value={details.default_humidity || 'N/A'} color="#3b82f6" isDark={isDark} />
            <StatPill label="Rainfall" value={getRainfallDisplay(details.default_rainfall || 0)} color="#3b82f6" isDark={isDark} />
          </View>
        </View>

        {/* 2. Crop Health and Soil Analysis Card */}
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Text style={[styles.cardTitle, { color: titleColor }]}>Current Crop: {details.current_crop || 'N/A'}</Text>

          {/* Disease Prediction */}
          <View style={[styles.predictionBox, { backgroundColor: isDark ? '#18272f' : '#f0f9ff' }]}>
            <Text style={[styles.predictionLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>AI Prediction</Text>
            <Text style={[styles.predictionStatus, { color: getDiseaseColor(cropData.predicted_disease) }]}>
              {cropData.predicted_disease || 'Awaiting Data'}
            </Text>
            <Text style={[styles.predictionConfidence, { color: textColor }]}>
              Confidence: {cropData.confidence_score ? `${(cropData.confidence_score * 100).toFixed(0)}%` : 'N/A'}
            </Text>
          </View>

          {/* Soil NPK and Moisture Data Pills */}
          <Text style={[styles.cardSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Soil Nutrients & Moisture</Text>
          <View style={styles.pillsContainer}>
            <StatPill label="Nitrogen (N)" value={cropData.nitrogen ? `${cropData.nitrogen} kg/ha` : 'N/A'} color="#ef4444" isDark={isDark} />
            <StatPill label="Phosphorus (P)" value={cropData.phosphorus ? `${cropData.phosphorus} kg/ha` : 'N/A'} color="#f59e0b" isDark={isDark} />
            <StatPill label="Potassium (K)" value={cropData.potassium ? `${cropData.potassium} kg/ha` : 'N/A'} color="#14b8a6" isDark={isDark} />
          </View>
          <View style={styles.pillsContainer}>
            <StatPill label="pH Level" value={cropData.ph || 'N/A'} color="#2563eb" isDark={isDark} />
            <StatPill label="Soil Moisture (%)" value={cropData.soil_moisture ? `${cropData.soil_moisture}%` : 'N/A'} color="#22c55e" isDark={isDark} />
          </View>

        </View>

        {/* Fertilizer History Footer */}
        <View style={[styles.footerCard, { backgroundColor: isDark ? '#1e1e1e' : '#ecfdf5', borderColor: isDark ? '#333' : '#a7f3d0' }]}>
          <Text style={[styles.footerText, { color: isDark ? '#9ca3af' : '#047857', fontWeight: 'bold' }]}>
            Fertilizer History:
          </Text>
          <Text style={[styles.footerText, { color: isDark ? '#d1d5db' : '#065f46' }]}>
            {details.fertilizer_history || 'No recent history recorded.'}
          </Text>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.3)',
    paddingBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 15,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  statPill: {
    flex: 1,
    minWidth: '30%',
    padding: 8,
    borderRadius: 10,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  // Prediction Box Styles
  predictionBox: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.5)',
    marginBottom: 15,
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  predictionStatus: {
    fontSize: 22,
    fontWeight: '900',
  },
  predictionConfidence: {
    fontSize: 14,
    marginTop: 5,
  },
  // Footer Card for history
  footerCard: {
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
  }
});
