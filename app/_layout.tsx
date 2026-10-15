import { AuthProvider } from "@/lib/auth";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0a5658" },
          headerShadowVisible: false,
          contentStyle: { marginTop: 0 },
          headerTitleStyle: {
            color: "#3cebc5",
            fontSize: 26,
            fontWeight: "bold",
          },
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, headerLeft: () => <></> }}
        />
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "MyStockMate",
            headerTitleAlign: "center",
            headerLeft: () => "",
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerTitle: "Login",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={styles.backButton}>Back</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerTitle: "Create Account",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={styles.backButton}>Back</Text>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <Image
                source={require("../assets/icon.png")}
                style={styles.stockmateIcon}
              />
            ),
          }}
        />
        <Stack.Screen
          name="resetpw"
          options={{
            headerTitle: "",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={styles.backButton}>Back</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen name="+not-found" options={{}} />
      </Stack>
    </AuthProvider>
  );
}

export const styles = StyleSheet.create({
  backButton: {
    marginLeft: 15,
    color: "#3cebc5",
    fontSize: 18,
    fontWeight: "bold",
  },
  stockmateIcon: {
    width: 60,
    height: 60,
    marginTop: 10,
    marginBottom: 6,
    alignSelf: "center",
  },
});
