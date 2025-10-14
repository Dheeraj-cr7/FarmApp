import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../app/themeContext";
import { supabase } from '../supabase';


// --- CONFIGURATION ---
const API_URL = process.env.EXPO_PUBLIC_PORT || ""
const REFRESH_TIMEOUT = 1000; // Delay for UX consistency after setting data


// Helper function to introduce a delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Phosphor Icon for Refresh (using text for simplicity in this file format)
const RefreshIcon = () => <Text style={{ fontSize: 18, marginRight: 5 }}>🔄</Text>;


// Initial state structure
const initialSensorData = {
  crop_name: "",
  n: 0, p: 0, k: 0, ph: 0,
  soil_moisture: 0,
};

// --- SCENARIO DATA ---
const OPTIMAL_DATA = {
  // Values from the middle of the Optimal Health range
  nitrogen: 100.0,
  phosphorus: 50.0,
  potassium: 65.0,
  ph: 6.8,
  soil_moisture: 75.0,
};

// --- RANDOM PROBLEM SCENARIOS ---
const PROBLEM_SCENARIOS = [
  // Scenario 1: Low Nitrogen
  { name: "Nitrogen Deficiency", values: { nitrogen: 15.0, phosphorus: 50.0, potassium: 65.0, ph: 6.8, soil_moisture: 75.0 } },
  // Scenario 2: Low Phosphorus
  { name: "Phosphorus Deficiency", values: { nitrogen: 100.0, phosphorus: 15.0, potassium: 65.0, ph: 6.8, soil_moisture: 75.0 } },
  // Scenario 3: High Potassium (Toxicity)
  { name: "Potassium Toxicity", values: { nitrogen: 100.0, phosphorus: 50.0, potassium: 200.0, ph: 6.8, soil_moisture: 75.0 } },
  // Scenario 4: pH Stress (Acidic)
  { name: "pH Stress (Acidic)", values: { nitrogen: 100.0, phosphorus: 50.0, potassium: 65.0, ph: 4.5, soil_moisture: 75.0 } }
];

// Helper to select a random problem
const getRandomProblemScenario = () => {
  const randomIndex = Math.floor(Math.random() * PROBLEM_SCENARIOS.length);
  return PROBLEM_SCENARIOS[randomIndex];
};


export default function PredictionSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSettingData, setIsSettingData] = useState(false);

  // FIX: Prediction now stores BOTH the specific disease and the generic status
  const [prediction, setPrediction] = useState({
    predicted_disease: null,
    generic_status: null,
    risk: null,
    advice: null,
    error: null,
  });
  const [sensorData, setSensorData] = useState(initialSensorData);
  const [dataFetched, setDataFetched] = useState(false);


  // --- Core Data Fetching Functions ---

  const fetchUserId = async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        setUserId(session.user.id);
      } else {
        Alert.alert("Authentication Required", "No active Supabase session found. Please log in.");
        setUserId(null);
      }
    } catch (e) {
      console.error("Auth Fetch Error:", e.message);
      Alert.alert("Auth Error", `Failed to get session: ${e.message}`);
    }
  };

  const fetchSensorData = async (currentUserId) => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // NOTE: Using the column names likely existing in your database (nitrogen, phosphorus, etc.)
      const { data, error } = await supabase
        .from('crop_data')
        .select('crop_name, nitrogen, phosphorus, potassium, ph, soil_moisture')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const mappedData = {
          crop_name: data.crop_name || initialSensorData.crop_name,
          n: data.nitrogen || 0,
          p: data.phosphorus || 0,
          k: data.potassium || 0,
          ph: data.ph || 0,
          soil_moisture: data.soil_moisture || 0,
        };
        setSensorData(mappedData);
        setDataFetched(true);
        console.log("Sensor data fetched successfully.");
      } else {
        setDataFetched(true);
      }
    } catch (e) {
      console.error("Supabase Fetch Error:", e.message);
      Alert.alert("Supabase Error", `Failed to fetch data: ${e.message}. Using default values.`);
      setDataFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Data Setting Functions ---
  const updateSupabaseData = async (newValues, scenarioName) => {
    if (!userId) {
      Alert.alert("Error", "User ID is required to update the database.");
      return;
    }
    setIsSettingData(true);
    setPrediction(null);

    try {
      // Find the most recent row to update (by user ID)
      const { data: latestRow, error: fetchError } = await supabase
        .from('crop_data')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (!latestRow) {
        Alert.alert("Error", "No existing row found for this user. Please insert initial data manually.");
        return;
      }

      // Prepare the update payload 
      const updatePayload = {
        ...newValues,
        crop_name: sensorData.crop_name, // Not hardcoded
        predicted_disease: '',
        confidence_score: null,
        created_at: new Date().toISOString() // Force update timestamp
      };

      const { error: updateError } = await supabase
        .from('crop_data')
        .update(updatePayload)
        .eq('id', latestRow.id); // Update the latest row

      if (updateError) throw updateError;

      // Introduce a short delay for the DB update to register properly before fetching
      await sleep(REFRESH_TIMEOUT);

      // Automatically fetch data after setting a scenario
      await fetchSensorData(userId);

      Alert.alert("Scenario Set", `${scenarioName} data set successfully! Sensor data has been updated.`);

    } catch (e) {
      console.error(`Error setting ${scenarioName}:`, e.message);
      Alert.alert("DB Update Error", `Failed to set data: ${e.message}`);
    } finally {
      setIsSettingData(false);
    }
  };

  const setOptimalData = () => updateSupabaseData(OPTIMAL_DATA, "Optimal");

  // --- FIX APPLIED: Randomization for Problem Data ---
  const setProblemData = () => {
    const randomScenario = getRandomProblemScenario();
    updateSupabaseData(randomScenario.values, `Problem (${randomScenario.name})`);
  }

  // --- Prediction Handler ---

  const handlePredict = async () => {
    if (!dataFetched || !userId) {
      Alert.alert("Wait", "Sensor data is not ready.");
      return;
    }

    setIsPredicting(true);
    setPrediction(null);

    // Prepare the payload for the Flask API 
    const payload = {
      user_id: userId,
      crop_name: sensorData.crop_name,
      N: sensorData.n,
      P: sensorData.p,
      K: sensorData.k,
      pH: sensorData.ph,
      Soil_Moisture: sensorData.soil_moisture,
    };

    try {
      const [response] = await Promise.all([
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        sleep(3000)// 3-second delay ⏳
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        } catch {
          throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText}`);
        }
      }

      const data = await response.json();

      // Extract results
      const specificDisease = data.predicted_disease;
      const genericStatus = data.predicted_health;
      const confidenceScore = data.confidence_score || null;

      // --- ADVICE GENERATION (Needed to save to history_data) ---
      let riskLevel = "Optimal";
      let adviceText = "Current conditions are ideal. Maintain management practices.";

      // --- UPDATED ADVICE LOGIC FOR GENERIC HEALTH STATUS ---
      if (genericStatus.includes('Optimal Health')) {
        riskLevel = "Low";
        adviceText = "Current conditions are ideal. Maintain vigilance and management practices.";
      } else {
        riskLevel = "High";
        // Use the generic status for advice type (since it indicates the root problem)
        if (genericStatus.includes('Nitrogen Deficiency')) {
          adviceText = `Action Required: ${specificDisease} risk (due to low Nitrogen). Apply high-nitrogen fertilizer immediately.`;
        } else if (genericStatus.includes('Phosphorus Deficiency')) {
          adviceText = `Action Required: ${specificDisease} risk. Apply superphosphate or DAP and check soil temperature.`;
        } else if (genericStatus.includes('Potassium Toxicity')) {
          adviceText = `Critical Action: ${specificDisease} risk (Potassium Toxicity). Flush the soil thoroughly with clean water to leach excess salts.`;
        } else if (genericStatus.includes('pH Stress')) {
          adviceText = `Critical Action: ${specificDisease} risk (pH Stress). Adjust soil pH immediately using lime or sulfur.`;
        } else {
          adviceText = `Warning: ${specificDisease} detected. Immediate action required. Consult an agronomist for detailed steps.`;
        }
      }
      // --- END ADVICE GENERATION ---


      // --- NEW: INSERT Prediction into history_data table (New Row) ---
      const historyPayload = {
        user_id: userId,
        crop_name: sensorData.crop_name,
        // Save the sensor inputs used for the prediction
        n_input: sensorData.n,
        p_input: sensorData.p,
        k_input: sensorData.k,
        ph_input: sensorData.ph,
        soil_moisture_input: sensorData.soil_moisture,
        // Save the model outputs and advice
        predicted_disease: specificDisease,
        predicted_health: genericStatus,
        confidence_score: confidenceScore,
        advice_given: adviceText,
      };

      const { error: historyInsertError } = await supabase
        .from('history_data')
        .insert([historyPayload]);

      if (historyInsertError) {
        console.error("History Insert Error:", historyInsertError);
        // Log error but continue to update crop_data/UI
        Alert.alert("History Save Failed", "Could not save prediction history.");
      } else {
        console.log("Prediction history saved successfully to history_data.");
      }
      // --- END HISTORY INSERT ---


      // --- UPDATE existing crop_data row (for dashboard summary view) ---

      // 1. Find the most recent row ID
      const { data: latestRow, error: fetchIdError } = await supabase
        .from('crop_data')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchIdError && fetchIdError.code !== 'PGRST116') throw fetchIdError;

      if (latestRow) {
        // 2. Prepare the prediction update payload
        const predictionUpdatePayload = {
          predicted_disease: specificDisease,
          // REMOVED: predicted_health, based on schema cache error
          confidence_score: confidenceScore,
        };

        // 3. Perform the update
        const { error: updateError } = await supabase
          .from('crop_data')
          .update(predictionUpdatePayload)
          .eq('id', latestRow.id);

        if (updateError) throw updateError;
        console.log("Crop data summary updated successfully (without predicted_health).");
      }
      // --- END CROP_DATA UPDATE ---


      // FIX: Set the prediction state with both labels
      setPrediction({
        predicted_disease: specificDisease,
        generic_status: genericStatus,
        risk: riskLevel,
        advice: adviceText
      });

    } catch (e) {
      console.error("Prediction API/Supabase Error:", e.message);
      Alert.alert("Prediction Failed", e.message || "Could not complete prediction and save results.");
      setPrediction({ error: e.message });
    } finally {
      setIsPredicting(false);
    }
  };

  // --- Component Lifecycle & Refresh ---

  const handleRefresh = () => {
    if (userId) {
      fetchSensorData(userId);
      setPrediction(null); // Clear previous prediction on refresh
    } else {
      Alert.alert("Error", "Please log in to refresh data.");
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchSensorData(userId);
    }
  }, [userId]);

  const formatValue = (val) => typeof val === 'number' ? val.toFixed(1) : val;

  // --- Render Component ---

  const isBusy = isLoading || isPredicting || isSettingData;
  const predictDisabled = isBusy || !dataFetched || !userId || !sensorData.crop_name;
  const setDisabled = isBusy || !userId;

  const themeColors = {
    background: isDark ? "#121212" : "#f0f0f0",
    cardBg: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#333",
    subtitle: isDark ? "#ccc" : "#555",
    border: isDark ? "#333" : "#ddd",
    primary: "#22c55e",
    danger: "#ef4444",
    buttonDisabled: "#6b7280",
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Crop Health Prediction</Text>

      {/* --- Data Display Card --- */}
      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.subtitle, { color: themeColors.text, fontWeight: '600' }]}>Latest Sensor Readings</Text>

        </View>

        {isBusy && !dataFetched ? (
          <Text style={{ color: themeColors.subtitle }}>{isSettingData ? 'Updating database...' : 'Loading data from Supabase...'}</Text>
        ) : !userId ? (
          <Text style={{ color: themeColors.danger, fontWeight: "bold" }}>Error: User not authenticated.</Text>
        ) : (
          <>
            <Text style={{ color: themeColors.text, marginTop: 5 }}>Crop: {sensorData.crop_name || 'N/A'}</Text>
            <Text style={{ color: themeColors.text }}>Nitrogen (N): {formatValue(sensorData.n)}</Text>
            <Text style={{ color: themeColors.text }}>Phosphorus (P): {formatValue(sensorData.p)}</Text>
            <Text style={{ color: themeColors.text }}>Potassium (K): {formatValue(sensorData.k)}</Text>
            <Text style={{ color: themeColors.text }}>pH: {formatValue(sensorData.ph)}</Text>
            <Text style={{ color: themeColors.text }}>Soil Moisture: {formatValue(sensorData.soil_moisture)}%</Text>
          </>
        )}
      </View>

      {/* --- Prediction Button --- */}
      <TouchableOpacity
        style={[styles.predictBtn, { backgroundColor: predictDisabled ? themeColors.buttonDisabled : themeColors.primary }]}
        onPress={handlePredict}
        disabled={predictDisabled}
      >
        <Text style={styles.predictText}>
          {isPredicting ? "Predicting..." : "Get Health Prediction"}
        </Text>
      </TouchableOpacity>

      {/* --- Scenario Buttons --- */}
      <View style={styles.scenarioRow}>
        <TouchableOpacity
          style={[styles.scenarioBtn, { backgroundColor: setDisabled ? themeColors.buttonDisabled : themeColors.primary }]}
          onPress={setOptimalData}
          disabled={setDisabled}
        >
          <Text style={styles.predictText}>Set Optimal Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scenarioBtn, { backgroundColor: setDisabled ? themeColors.buttonDisabled : themeColors.danger }]}
          onPress={setProblemData}
          disabled={setDisabled}
        >
          <Text style={styles.predictText}>Set Problem Data</Text>
        </TouchableOpacity>
      </View>

      {/* --- Loading Indicator --- */}
      {(isPredicting || isSettingData) && <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 20 }} />}

      {/* --- Prediction Result Card --- */}
      {prediction && prediction.predicted_disease && (
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border, marginTop: 20 }]}>
          {prediction.error ? (
            <Text style={{ color: themeColors.danger, fontWeight: "bold" }}>Error: {prediction.error}</Text>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: themeColors.text, fontWeight: '600' }]}>Prediction Result</Text>

              {/* FIX: Display Specific Disease Label */}
              <Text style={{ color: themeColors.text, marginTop: 5 }}>Disease Status:
                <Text style={{ fontWeight: "bold", color: prediction.generic_status.includes('Optimal Health') ? themeColors.primary : themeColors.danger }}>
                  {prediction.predicted_disease}
                </Text>
              </Text>

              <Text style={{ color: themeColors.text }}>Root Cause: {prediction.generic_status}</Text>
              <Text style={{ color: themeColors.text }}>Risk Level: {prediction.risk}</Text>
              <Text style={{ color: themeColors.subtitle, marginTop: 8 }}>Advice: {prediction.advice}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  subtitle: { fontSize: 18, marginBottom: 8 },
  // Prediction and Set buttons share style
  predictBtn: { padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  predictText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  // Scenario Row for two buttons side-by-side
  scenarioRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 },
  scenarioBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  // Refresh button styling (modern look)
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  refreshText: { fontSize: 14, fontWeight: 'bold' }
});
