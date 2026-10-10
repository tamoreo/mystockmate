import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.headerImage}
        />
        <Text
          style={{
            color: "#3cebc5",
            fontSize: 16,
            lineHeight: 20,
            margin: 14,
            textAlign: "center",
          }}
        >
          MyStockMate Inventory is your personal stock management companion app
          for small to medium-sized businesses.
        </Text>
      </View>
      <Link href="/login" style={styles.linkbutton}>
        Have account? Sign in
      </Link>
      <Link href="/register" style={styles.linkbutton}>
        Create account
      </Link>
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
    fontSize: 18,
  },
  linkbutton: {
    marginTop: 15,
    color: "#76e2c3",
    textDecorationLine: "underline",
  },
  headerImage: {
    width: 300,
    height: 300,
    margin: 30,
  },
});
