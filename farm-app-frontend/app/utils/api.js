// utils/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.5:5000/api"; 
// 👆 replace with your local IP (or backend server URL)

async function getToken() {
  return await AsyncStorage.getItem("token");
}

// Generic request handler
async function request(endpoint, method = "GET", body = null, auth = true) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API Error");
  }
  return await response.json();
}

export const api = {
  // ---------- Auth ----------
  signup: (data) => request("/auth/signup", "POST", data, false),
  login: (data) => request("/auth/login", "POST", data, false),

  // ---------- Sensor Data ----------
  getSensors: () => request("/sensors", "GET"),
  addSensor: (data) => request("/sensors", "POST", data),

  // ---------- Predictions ----------
  getPrediction: (sensorId) => request(`/predict/${sensorId}`, "GET"),

  // ---------- Theme ----------
  getTheme: () => request("/theme", "GET"),
  setTheme: (theme) => request("/theme", "POST", { theme }),
};
