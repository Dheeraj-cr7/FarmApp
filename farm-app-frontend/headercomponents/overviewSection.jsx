import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// --- MOCK IMPORTS FOR RUNNABILITY ---
// NOTE: In a real Expo app, 'supabase' and 'useTheme' would be imported from external files.

// 1. Mock Theme Hook
const useTheme = () => {
  // Always return 'light' or 'dark' for styling.
  const [theme, setTheme] = useState('light'); // Can be toggled if needed
  useEffect(() => {
    // Simulate initial theme setting
    setTheme('dark'); 
  }, []);
  return { theme };
};

// 2. Mock Data (Simulating data fetched from Supabase after successful signup)
const MOCK_USER_ID = "mock-user-123";
const MOCK_FARMER_DETAILS = {
  current_crop: "Rice",
  default_temp: 32.5,
  default_humidity: 75.2,
  default_rainfall: 5.1,
  farm_size_acres: 5.0,
  farm_location: "Maharashtra",
  soil_type: "Black",
  fertilizer_history: "Applied 50kg Urea last month (NPK 18:46:0)",
};

const MOCK_CROP_DATA = {
  nitrogen: 85.5, // N (kg/ha)
  phosphorus: 45.2, // P (kg/ha)
  potassium: 42.1, // K (kg/ha)
  ph: 6.2,
  soil_moisture: 55.7, // %
  predicted_disease: "None (Healthy)",
  confidence_score: 0.98,
};

// 3. Mock Supabase Client and Fetcher
const mockSupabase = {
  // Simulates fetching two different tables simultaneously
  fetchInitialData: (userId) => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        if (userId === MOCK_USER_ID) {
          resolve({
            farmerDetails: MOCK_FARMER_DETAILS,
            cropData: MOCK_CROP_DATA,
            error: null,
          });
        } else {
          resolve({
            farmerDetails: null,
            cropData: null,
            error: "User not found or data missing.",
          });
        }
      }, 1500); // 1.5 second delay
    });
  },
};
// --- END MOCK IMPORTS ---

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

  const [details, setDetails] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, userId would come from a user context (e.g., useAuth())
    const userId = MOCK_USER_ID; 
    
    // Fetch data using the mock Supabase client
    const loadData = async () => {
      setLoading(true);
      const result = await mockSupabase.fetchInitialData(userId);
      
      if (result.error) {
        console.error("Data fetch error:", result.error);
        setError(result.error);
      } else {
        setDetails(result.farmerDetails);
        setCropData(result.cropData);
      }
      setLoading(false);
    };

    loadData();
  }, []);

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
              Error Loading Data: {error || "No farmer or crop data found. Please complete the setup."}
            </Text>
        </View>
      </View>
    );
  }

  // --- Render with Fetched Data ---
  
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
      return disease.toLowerCase().includes('healthy') ? '#34d399' : '#f97316';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      
      <Text style={[styles.title, { color: titleColor }]}>Farm Overview & Health</Text>

      {/* 1. Farm Context and Climate Card */}
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
        <Text style={[styles.cardTitle, { color: titleColor }]}>Farm Context</Text>
        
        <View style={styles.contextRow}>
          <Text style={[styles.label, { color: textColor }]}>Location:</Text>
          <Text style={[styles.value, { color: isDark ? '#fff' : '#1f2937', fontWeight: 'bold' }]}>
            {details.farm_location}
          </Text>
        </View>
        <View style={styles.contextRow}>
          <Text style={[styles.label, { color: textColor }]}>Farm Size:</Text>
          <Text style={[styles.value, { color: isDark ? '#fff' : '#1f2937' }]}>
            {details.farm_size_acres} acres
          </Text>
        </View>
        <View style={styles.contextRow}>
          <Text style={[styles.label, { color: textColor }]}>Soil Type:</Text>
          <Text style={[styles.value, { color: isDark ? '#fff' : '#1f2937' }]}>
            {details.soil_type}
          </Text>
        </View>
        
        {/* Climate Data Pills */}
        <Text style={[styles.cardSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Recent Climate Snapshot</Text>
        <View style={styles.pillsContainer}>
          <StatPill label="Temp (°C)" value={details.default_temp} color="#3b82f6" isDark={isDark} />
          <StatPill label="Humidity (%)" value={details.default_humidity} color="#3b82f6" isDark={isDark} />
          <StatPill label="Rainfall" value={getRainfallDisplay(details.default_rainfall)} color="#3b82f6" isDark={isDark} />
        </View>
      </View>

      {/* 2. Crop Health and Soil Analysis Card */}
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
        <Text style={[styles.cardTitle, { color: titleColor }]}>Current Crop: {details.current_crop}</Text>
        
        {/* Disease Prediction */}
        <View style={[styles.predictionBox, { backgroundColor: isDark ? '#18272f' : '#f0f9ff' }]}>
            <Text style={[styles.predictionLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>AI Prediction</Text>
            <Text style={[styles.predictionStatus, { color: getDiseaseColor(cropData.predicted_disease) }]}>
                {cropData.predicted_disease}
            </Text>
            <Text style={[styles.predictionConfidence, { color: textColor }]}>
                Confidence: {(cropData.confidence_score * 100).toFixed(0)}%
            </Text>
        </View>
        
        {/* Soil NPK and Moisture Data Pills */}
        <Text style={[styles.cardSubtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Soil Nutrients & Moisture</Text>
        <View style={styles.pillsContainer}>
          <StatPill label="Nitrogen (N)" value={`${cropData.nitrogen} kg/ha`} color="#ef4444" isDark={isDark} />
          <StatPill label="Phosphorus (P)" value={`${cropData.phosphorus} kg/ha`} color="#f59e0b" isDark={isDark} />
          <StatPill label="Potassium (K)" value={`${cropData.potassium} kg/ha`} color="#14b8a6" isDark={isDark} />
        </View>
        <View style={styles.pillsContainer}>
          <StatPill label="pH Level" value={cropData.ph} color="#2563eb" isDark={isDark} />
          <StatPill label="Soil Moisture (%)" value={`${cropData.soil_moisture}%`} color="#22c55e" isDark={isDark} />
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
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    paddingVertical: 24,
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
