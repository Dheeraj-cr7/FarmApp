import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../app/themeContext";
import { supabase } from '../supabase';

// --- REAL IMPORTS (MOCKED FOR SINGLE FILE RUNNABILITY) ---
// WARNING: Replace this entire mock block with your real Supabase client!



// Helper to format sensor inputs into a single string
const formatInputs = (item) => {
  if (!item.n_input) return "Inputs N/A";
  return `N:${item.n_input.toFixed(1)} P:${item.p_input.toFixed(1)} K:${item.k_input.toFixed(1)} | pH:${item.ph_input.toFixed(1)}`;
};

// Helper to format the date
const formatDate = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Invalid Date';
  }
};

// Main component
export default function HistorySection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define theme-based colors internally
  const colors = {
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#aaa" : "#666",
    cardBg: isDark ? "#1e1e1e" : "#f9f9f9",
    primary: "#22c55e",
    danger: "#ef4444",
    warning: "#f59e0b",
  };

  // --- Core Data Fetching Function ---

  const fetchUserId = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUserId(session?.user?.id || null);
    } catch (e) {
      console.error("Auth Fetch Error:", e.message);
      setError("Authentication failed.");
      setUserId(null);
    }
  };

  const fetchHistory = async (currentUserId) => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('history_data')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (e) {
      console.error("Supabase History Fetch Error:", e.message);
      setError(`Failed to load history: ${e.message}`);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // --- New: History Clearing Function ---
  const handleClearHistory = async () => {
    if (!userId) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete ALL historical predictions? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setLoading(true); // Start loading indicator for the operation
            try {
              // Delete records only for the current user
              const { error } = await supabase
                .from('history_data')
                .delete()
                .eq('user_id', userId);

              if (error) throw error;

              Alert.alert("Success", "Prediction history cleared.");
              // Re-fetch data to update the UI immediately
              await fetchHistory(userId);
            } catch (e) {
              console.error("History Deletion Error:", e.message);
              Alert.alert("Error", `Failed to clear history: ${e.message}`);
              setLoading(false); // Stop loading if error occurred before fetchHistory was called
            }
          }
        }
      ]
    );
  };


  // 1. Fetch User ID on component mount
  useEffect(() => {
    fetchUserId();
  }, []);

  // 2. Fetch History when userId is available (Standard useEffect)
  useEffect(() => {
    if (userId) {
      fetchHistory(userId);
    } else if (userId === null) {
      setLoading(false);
      setError("User not authenticated.");
    }
  }, [userId]);



  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchHistory(userId);
      }
    }, [userId])
  );


  const renderHistoryItem = ({ item }) => {
    const isOptimal = item.predicted_health?.includes('Optimal Health');
    const cardColor = isOptimal ? colors.primary : colors.warning;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBg,
            borderColor: isDark ? "#333" : "#e5e5e5",
            borderLeftColor: cardColor, // Highlight based on prediction
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardDate, { color: colors.secondaryText }]}>
            {formatDate(item.created_at)}
          </Text>
          <Text style={[styles.cardPrediction, { color: cardColor }]}>
            {item.predicted_disease || "Prediction N/A"}
          </Text>
        </View>

        <Text style={[styles.cardDetail, { color: colors.text, marginTop: 5 }]}>
          Root Cause: {item.predicted_health || "N/A"}
        </Text>

        <Text style={[styles.cardDetail, { color: colors.secondaryText }]}>
          Inputs: {formatInputs(item)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.secondaryText, marginTop: 10 }}>Loading prediction history...</Text>
      </View>
    );
  }

  if (error || !userId) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
        <Text style={[styles.title, { color: colors.danger, textAlign: 'center' }]}>
          Error: {error || "Please log in to view history."}
        </Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Prediction History
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText, textAlign: 'center', marginTop: 20 }]}>
          No prediction history found. Run a prediction in the "Prediction" tab to start tracking!
        </Text>
        {/* Clear Button (Disabled when empty) */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.danger, opacity: 0.5 }]}
            onPress={() => Alert.alert("History is Empty", "There is no data to clear.")}
            disabled={true}
          >
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Prediction History
      </Text>

      {/* Clear History Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.danger }]}
          onPress={handleClearHistory}
        >
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      </View>

      {/* List of past readings */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  subtitle: { fontSize: 14, marginBottom: 12 },
  // New Styles for Button
  buttonWrapper: { marginBottom: 15, width: '100%', alignItems: 'center' },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Existing Styles
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardDate: { fontSize: 12, fontWeight: "600" },
  cardPrediction: { fontSize: 16, fontWeight: "bold" },
  cardDetail: { fontSize: 13, lineHeight: 20 },
});
