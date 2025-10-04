// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { useEffect } from "react";
// import { Image, StyleSheet, Text, View } from "react-native";
// import Animated, {
//     runOnJS,
//     useAnimatedStyle,
//     useSharedValue,
//     withTiming
// } from "react-native-reanimated";

// export default function SplashScreen() {
//   const router = useRouter();

//   const opacity = useSharedValue(0);
//   const translateX = useSharedValue(0);
//   const translateY = useSharedValue(0);
//   const scale = useSharedValue(1);

//   useEffect(() => {
//     // fade in
//     opacity.value = withTiming(1, { duration: 1500 }, () => {
//       // after fade, move to top-left
//       translateX.value = withTiming(-150, { duration: 1000 });
//       translateY.value = withTiming(-250, { duration: 1000 });
//       scale.value = withTiming(0.6, { duration: 1000 }, async () => {
//         // check auth after animation
//         const token = await AsyncStorage.getItem("userToken");
//         if (token) {
//           runOnJS(router.replace)("/(tabs)");
//         } else {
//           runOnJS(router.replace)("/login");
//         }
//       });
//     });
//   }, []);

//   const animatedStyle = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//     transform: [
//       { translateX: translateX.value },
//       { translateY: translateY.value },
//       { scale: scale.value },
//     ],
//   }));

//   return (
//     <View style={styles.container}>
//       <Animated.View style={[animatedStyle]}>
//         <Image
//           source={require("../assets/images/icon.png")} // <-- put your logo here
//           style={styles.logo}
//           resizeMode="contain"
//         />
//       </Animated.View>
//       <Text style={styles.appName}>Smart Farm</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
//   logo: { width: 150, height: 150 },
//   appName: { fontSize: 22, fontWeight: "bold", marginTop: 20, color: "#333" },
// });


import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../supabase"; // adjust path if needed

const Index = () => {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                router.replace("/(tabs)"); // ✅ go to main app
            } else {
                router.replace("/login"); // ❌ no session, go login
            }
        };

        checkSession();

        // optional: listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) {
                    router.replace("/(tabs)");
                } else {
                    router.replace("/login");
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return null; // nothing to render, just redirect
};

export default Index;
