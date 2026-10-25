import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Page Not Found" }} />
      <View style={styles.container}>
        <Link href="/" style={styles.button}>
          Go to Home Page
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a5658",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    color: "#fff",
    fontSize: 20,
  },
});
