import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// --- Real Expo Imports ---
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../supabase"; // ASSUMING your Supabase client is exported from './supabase'
// -------------------------

// ====================================================================
// --- CONFIGURATION REQUIRED: API KEY and BASE URL UPDATED FOR WeatherAPI ---
const WEATHER_API_KEY = "695c1939bda04f9aaf2111848250408";
// Base URL for current weather. The query (q) and key are appended below.
const WEATHER_API_BASE_URL = "https://api.weatherapi.com/v1/current.json";
// ====================================================================

// Global utilities for the app
const CROP_OPTIONS = ["Rice", "Wheat", "Sugarcane", "Maize", "Cotton"];
const SOIL_OPTIONS = ["Alluvial", "Black", "Red", "Laterite", "Arid"];

// Mock Theme Hook (Still necessary for Canvas to run light/dark mode styles)
const useTheme = () => ({ theme: 'light' });

// --- HELPER FUNCTION FOR MOCK CROP DATA GENERATION ---
const CROP_PROFILES = {
    rice: { N: [60, 100], P: [30, 50], K: [30, 50], pH: [5.5, 6.5] },
    wheat: { N: [80, 120], P: [40, 60], K: [40, 60], pH: [6.0, 7.5] },
    sugarcane: { N: [150, 200], P: [40, 60], K: [60, 80], pH: [6.0, 8.0] },
    maize: { N: [100, 150], P: [50, 80], K: [50, 80], pH: [5.5, 7.5] },
    cotton: { N: [60, 90], P: [30, 50], K: [30, 50], pH: [6.0, 7.0] },
};

/**
 * Generates mock NPK and pH data based on the selected crop.
 */
const generateMockCropData = (cropName, userId, soilMoisture) => {
    const profile = CROP_PROFILES[cropName.toLowerCase()] || CROP_PROFILES.default;

    const getRandom = (min, max) => Math.random() * (max - min) + min;

    const generateValue = (range) => parseFloat(getRandom(range[0], range[1]).toFixed(2));

    // FIX: Added default non-null values to satisfy database constraints.
    return {
        user_id: userId,
        nitrogen: generateValue(profile.N),
        phosphorus: generateValue(profile.P),
        potassium: generateValue(profile.K),
        ph: generateValue(profile.pH),
        predicted_disease: '',      // Default to empty string (non-null)
        confidence_score: 0,        // Default to 0 (non-null)
        soil_moisture: soilMoisture, // Use the actual collected moisture value
    };
};
// --- END MOCK CROP DATA GENERATION ---


// --- REAL API FETCH FUNCTION WITH EXPONENTIAL BACKOFF ---
const fetchWeatherForLocation = async (location, setTemp, setHumidity, setRainfall, setLoading, setError) => {
    const MAX_RETRIES = 3;
    let attempt = 0;

    setError(null);
    setLoading(true);

    const trimmedLocation = location ? location.trim() : '';
    if (trimmedLocation.length < 3) {
        setLoading(false);
        return;
    }

    const queryUrl = `${WEATHER_API_BASE_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(trimmedLocation)}&aqi=no`;

    while (attempt < MAX_RETRIES) {
        try {
            console.log(`Attempting to fetch weather for ${trimmedLocation} (Attempt ${attempt + 1})`);

            const response = await fetch(queryUrl);

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    const errorMessage = errorData.error?.message || "Location not found or API key invalid.";
                    setError(errorMessage);
                    setLoading(false);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // --- CRITICAL: PARSE RESPONSE DATA FOR WEATHERAPI ---
            let avgTemp, avgHumidity, avgRainfall;

            if (data.current) {
                avgTemp = data.current.temp_c;
                avgHumidity = data.current.humidity;
                avgRainfall = data.current.precip_mm;
            } else {
                throw new Error("API response structure is unfamiliar or incomplete. Check the parsing logic.");
            }

            setTemp(avgTemp.toFixed(1));
            setHumidity(avgHumidity.toFixed(1));
            setRainfall(avgRainfall.toFixed(1));

            setError(null);
            setLoading(false);
            console.log("Weather data successfully fetched and parsed.");
            return;

        } catch (error) {
            console.error(`Fetch attempt ${attempt + 1} failed:`, error.message);
            attempt++;

            if (attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                setError(`Failed to fetch climate data after ${MAX_RETRIES} attempts. Error: ${error.message}.`);
                setLoading(false);
                return;
            }
        }
    }
};


export default function FarmerDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // State for farmer details
    const [currentCropInput, setCurrentCropInput] = useState("");

    // Auto-populated climate states
    const [defaultTemp, setDefaultTemp] = useState(null);
    const [defaultHumidity, setDefaultHumidity] = useState(null);
    const [defaultRainfall, setDefaultRainfall] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);

    // NEW STATE VARIABLES
    const [farmSize, setFarmSize] = useState("");
    const [farmLocation, setFarmLocation] = useState("");
    const [soilType, setSoilType] = useState("");
    // soilMoisture state removed as it is now generated randomly
    const [fertilizerHistory, setFertilizerHistory] = useState("");

    const [loading, setLoading] = useState(false);
    // NEW Loading state for the crop data insertion step
    const [cropDataLoading, setCropDataLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Helper to convert numeric rainfall (mm/h) to "Will Rain?" string for display
    const getRainfallDisplay = (rainfallValue) => {
        if (rainfallValue === null) return '--';
        const precip = parseFloat(rainfallValue);
        if (precip > 0.1) {
            return `Yes (${precip.toFixed(1)} mm/h)`;
        }
        return 'No';
    };


    // 1. Validation and Setup Check
    useEffect(() => {
        // Check if required params are present
        if (!params.email || !params.password || !params.name) {
            console.log("Error: Missing Signup Credentials. Redirecting to signup screen in real app.");
            Alert.alert("Setup Error", "Missing credentials. Restart sign-up.");
            setIsReady(false);
        } else {
            setIsReady(true);
        }
    }, [params]);

    // 2. Auto-fetch weather data on farmLocation change
    useEffect(() => {
        setDefaultTemp(null);
        setDefaultHumidity(null);
        setDefaultRainfall(null);
        setWeatherError(null);

        const handler = setTimeout(() => {
            fetchWeatherForLocation(
                farmLocation,
                setDefaultTemp,
                setDefaultHumidity,
                setDefaultRainfall,
                setWeatherLoading,
                setWeatherError
            );
        }, 500);

        return () => clearTimeout(handler);
    }, [farmLocation]);

    // Validation helper
    const isValidCrop = (crop) => CROP_OPTIONS.map(c => c.toLowerCase()).includes(crop.toLowerCase());
    const isValidSoil = (soil) => SOIL_OPTIONS.map(s => s.toLowerCase()).includes(soil.toLowerCase());

    const handleCompleteSignup = async () => {
        if (!isReady) return;

        const signUpEmail = params.email;
        const signUpPassword = params.password;
        const signUpName = params.name;

        // Validation Checks
        const currentCrop = currentCropInput.trim();
        const size = parseFloat(farmSize);
        const soil = soilType.trim();

        // --- NEW: Randomly generate soil moisture (e.g., 30% to 70%) ---
        const minMoisture = 30;
        const maxMoisture = 70;
        const moisture = parseFloat((Math.random() * (maxMoisture - minMoisture) + minMoisture).toFixed(2));

        if (!signUpEmail || !signUpPassword || !signUpName) {
            Alert.alert("Setup Error", "Missing sign-up credentials. Please restart from the Sign Up page.");
            router.replace("/signup");
            return;
        }

        if (defaultTemp === null || defaultHumidity === null || defaultRainfall === null) {
            Alert.alert("Climate Data Missing", "Please enter a valid farm location and wait for data to load.");
            return;
        }
        if (isNaN(size) || size <= 0 ||
            !currentCrop || !isValidCrop(currentCrop) || !soil || !isValidSoil(soil)) {
            Alert.alert("Validation Error", "Please check all inputs. Ensure Farm Size is a valid number, and Crop/Soil are correct.");
            return;
        }

        const temp = parseFloat(defaultTemp);
        const humidity = parseFloat(defaultHumidity);
        const rainfall = parseFloat(defaultRainfall);

        setLoading(true);

        try {
            // 3. --- SUPABASE SIGN UP & AUTHENTICATION ---
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: signUpEmail,
                password: signUpPassword,
            });

            if (authError) {
                Alert.alert("Signup Error", authError.message);
                setLoading(false);
                return;
            }

            const user = authData.user;
            if (!user || !user.id) {
                Alert.alert("Signup Failed", "Could not retrieve user ID after sign up. Please try again.");
                setLoading(false);
                return;
            }
            const userId = user.id;

            // 4. --- DATABASE INSERTS (Profiles and Farmer Details) ---

            // A) Insert into profiles table
            const { error: profileError } = await supabase.from("profiles").insert([
                { id: userId, full_name: signUpName },
            ]);
            if (profileError) {
                // Throwing the error here ensures it is caught below, displaying the RLS/FK error message.
                throw profileError;
            }

            // B) Insert into farmer_details table
            const { error: detailsError } = await supabase.from("farmer_details").insert([
                {
                    user_id: userId,
                    current_crop: currentCrop,
                    default_temp: temp,
                    default_humidity: humidity,
                    default_rainfall: rainfall,
                    farm_size_acres: size,
                    farm_location: farmLocation,
                    soil_type: soil,
                    // soil_moisture is removed from here
                    fertilizer_history: fertilizerHistory,
                },
            ]);
            if (detailsError) console.error("Farmer details insert error:", detailsError);

            // 5. --- GENERATE AND INSERT CROP DATA (NEW STEP) ---
            setLoading(false); // Stop general loading indicator
            setCropDataLoading(true); // Start dedicated crop data loading

            // Simulate AI/ML model processing time
            await new Promise(resolve => setTimeout(resolve, 1500));

            // moisture (the random value) is passed here for the crop_data record
            const cropDataRecord = generateMockCropData(currentCrop, userId, moisture);

            const { error: cropDataError } = await supabase.from("crop_data").insert([cropDataRecord]);

            if (cropDataError) {
                console.error("Crop data insert error:", cropDataError);
                Alert.alert("Database Error", "Account created, but failed to generate initial crop data.");
            }

            // 6. Final success, prompting user for email verification
            Alert.alert(
                "Setup Complete!",
                "Your farm profile and initial crop data are ready. Check your email to verify your address before logging in.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/login")
                    }
                ]
            );

        } catch (err) {
            console.error("Complete Signup failed:", err);

            let displayMessage = `An error occurred. Check your Supabase configuration.`;

            // Check for the known Foreign Key violation (Profiles table)
            if (err.code === "23503" && err.message.includes("profiles_id_fkey")) {
                displayMessage = "Profile Creation Failed: Check the RLS Policy for your 'profiles' table. It might be blocked or require a database trigger.";
            }
            // Check for the missing column error (though it should be fixed by schema refresh)
            else if (err.code === "PGRST204" && err.message.includes("soil_moisture")) {
                displayMessage = "Database Error: The 'soil_moisture' column may be missing from 'farmer_details'. Please refresh your Supabase schema cache.";
            }

            Alert.alert("Setup Failed", displayMessage);
        } finally {
            setLoading(false);
            setCropDataLoading(false);
        }
    };

    if (!isReady) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
                <ActivityIndicator size="large" color={isDark ? "#22c55e" : "#000000"} />
                <Text style={{ color: isDark ? "#fff" : "#000", marginTop: 10 }}>Preparing Setup...</Text>
            </View>
        );
    }

    // Determine the primary loading indicator
    const finalLoading = loading || cropDataLoading;

    if (finalLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
                <ActivityIndicator size="large" color={isDark ? "#22c55e" : "#000000"} />
                <Text style={{ color: isDark ? "#fff" : "#000", marginTop: 10 }}>
                    {loading ? "Creating Account..." : "Analyzing Soil & Generating Initial Crop Data..."}
                </Text>
            </View>
        );
    }

    const displayedName = params.name || "Farmer";

    const weatherStatusText = weatherLoading
        ? "Fetching latest climate data..."
        : weatherError
            ? weatherError
            : defaultTemp !== null
                ? "Climate data successfully loaded."
                : "Enter your farm location to auto-load climate data.";

    const inputStyle = [styles.input, {
        backgroundColor: isDark ? "#1f2937" : "#fff",
        color: isDark ? "#fff" : "#000",
        borderColor: isDark ? "#4b5563" : "#d1d5db"
    }];

    const gridData = [
        { label: 'Temp (°C)', value: defaultTemp, displayValue: defaultTemp !== null ? defaultTemp : '--', color: '#3b82f6' },
        { label: 'Humidity (%)', value: defaultHumidity, displayValue: defaultHumidity !== null ? defaultHumidity : '--', color: '#3b82f6' },
        { label: 'Will Rain?', value: defaultRainfall, displayValue: getRainfallDisplay(defaultRainfall), color: '#3b82f6' },
    ];

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: isDark ? "#121212" : "#f9fafb" }]}>
                <View style={[styles.card, { backgroundColor: isDark ? "#1f2937" : "#fff" }]}>

                    <Text style={[styles.title, { color: isDark ? "#fff" : "#10b981" }]}>Final Farm Setup 🌾</Text>
                    <Text style={[styles.subtitle, { color: isDark ? "#d1d5db" : "#6b7280" }]}>
                        Welcome, <Text style={styles.boldText}>{displayedName}</Text>! Provide your farm's context for better AI predictions.
                    </Text>

                    {/* 1. Farm Context Inputs */}
                    <Text style={[styles.header, { color: isDark ? "#fff" : "#1f2937" }]}>Farm Size & Location</Text>
                    <TextInput
                        style={inputStyle}
                        placeholder="Farm Size (e.g., 5.0 acres)"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                        value={farmSize}
                        onChangeText={setFarmSize}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={inputStyle}
                        placeholder="Region / State (e.g., Maharashtra)"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                        value={farmLocation}
                        onChangeText={setFarmLocation}
                        autoCapitalize="words"
                    />

                    {/* 2. Auto-Populated Climate Details */}
                    <Text style={[styles.header, { color: isDark ? "#fff" : "#1f2937", marginTop: 25 }]}>Auto-Populated Climate Details</Text>

                    <View style={[styles.statusBox, { backgroundColor: isDark ? "#374151" : "#ecfdf5", borderColor: isDark ? "#4b5563" : "#a7f3d0" }]}>
                        {weatherLoading ? (
                            <View style={styles.statusInner}>
                                <ActivityIndicator size="small" color="#10b981" style={{ marginRight: 8 }} />
                                <Text style={{ color: "#10b981" }}>Fetching latest climate data...</Text>
                            </View>
                        ) : (
                            <Text style={{ color: weatherError ? "#ef4444" : "#059669", fontWeight: '500' }}>
                                {weatherStatusText}
                            </Text>
                        )}
                    </View>

                    {/* Display fetched data in grid */}
                    <View style={styles.gridContainer}>
                        {gridData.map((item, index) => (
                            <View key={index} style={[styles.gridItem, { backgroundColor: isDark ? "#374151" : "#f3f4f6" }]}>
                                <Text style={styles.gridLabel}>{item.label}</Text>
                                <Text style={[styles.gridValue, { color: item.color }]}>{item.displayValue}</Text>
                            </View>
                        ))}
                    </View>

                    {/* 3. Crop, Soil, and Fertilizer History */}
                    <Text style={[styles.header, { color: isDark ? "#fff" : "#1f2937", marginTop: 25 }]}>Crop & Soil Details</Text>

                    <Text style={[styles.miniLabel, { color: isDark ? "#d1d5db" : "#6b7280" }]}>Current Crop (Options: {CROP_OPTIONS.join(", ")})</Text>
                    <TextInput
                        style={inputStyle}
                        placeholder="e.g., Rice"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                        value={currentCropInput}
                        onChangeText={setCurrentCropInput}
                        autoCapitalize="words"
                    />

                    <Text style={[styles.miniLabel, { color: isDark ? "#d1d5db" : "#6b7280" }]}>Soil Type (Options: {SOIL_OPTIONS.join(", ")})</Text>
                    <TextInput
                        style={inputStyle}
                        placeholder="e.g., Black"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                        value={soilType}
                        onChangeText={setSoilType}
                        autoCapitalize="words"
                    />

                    {/* Soil Moisture input is now removed and automatically generated */}

                    <Text style={[styles.miniLabel, { color: isDark ? "#d1d5db" : "#6b7280" }]}>Recent Fertilizer History (Optional)</Text>
                    <TextInput
                        style={[inputStyle, styles.textArea]}
                        placeholder="e.g., Applied 50kg Urea last month"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                        value={fertilizerHistory}
                        onChangeText={setFertilizerHistory}
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCompleteSignup}
                        disabled={finalLoading || weatherLoading || defaultTemp === null}
                        style={[
                            styles.button,
                            { backgroundColor: (finalLoading || weatherLoading || defaultTemp === null) ? "#9ca3af" : "#10b981" }
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {finalLoading ? (cropDataLoading ? "Analyzing Data..." : "Creating Account...") : "Complete Setup & Sign Up"}
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    card: {
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
        padding: 25,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 30,
        textAlign: 'center'
    },
    boldText: {
        fontWeight: '700'
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    miniLabel: {
        fontSize: 13,
        marginBottom: 4,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    statusBox: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    gridItem: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 3,
    },
    gridValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    button: {
        width: "100%",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: '#fff',
    },
});
