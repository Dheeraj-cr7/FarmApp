import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../themeContext"; // adjust path if needed

export default function TabLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: isDark ? "#ccc" : "#888",
        tabBarStyle: {
          backgroundColor: isDark ? "#1e1e1e" : "#fff",
          borderTopColor: isDark ? "#333" : "#ddd",
        },
        headerStyle: {
          backgroundColor: isDark ? "#1e1e1e" : "#fff",
        },
        headerTintColor: isDark ? "#fff" : "#333",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="plots"
        options={{
          title: "Plots",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="recommendation"
        options={{
          title: "AI Insights",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="lightbulb-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Connected_Sensors"
        options={{
          title: "Connected Sensors",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sensors" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
