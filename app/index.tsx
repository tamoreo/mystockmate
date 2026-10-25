import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("../assets/icon.png")}
          style={styles.headerImage}
        />
        <Text
          style={{
            color: "#3cebc5",
            fontSize: 16,
            lineHeight: 20,
            marginTop: 20,
            marginLeft: 40,
            marginRight: 40,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          MyStockMate Inventory is your personal stock management companion app
          for small to medium-sized businesses.
        </Text>
      </View>
      <Link href="/register" style={styles.linkbutton}>
        Create account
      </Link>
      <Text style={styles.text}>
        Have account?{" "}
        <Link href="/login" style={styles.linkbutton}>
          Sign in
        </Link>
      </Text>
      <Text style={styles.text}>
        Forgot password?{" "}
        <Link href="/resetpw" style={styles.linkbutton}>
          Reset
        </Link>
      </Text>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0a5658",
  },
  text: {
    color: "#3cebc5",
    fontSize: 15,
    marginTop: 20,
  },
  headerText: {
    color: "#3cebc5",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 50,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 30,
  },
  linkbutton: {
    marginTop: 15,
    color: "#76e2c3",
    textDecorationLine: "underline",
  },
  headerImage: {
    width: 300,
    height: 300,
    marginTop: 10,
  },
});
