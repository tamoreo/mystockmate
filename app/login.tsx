import { Link } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Image
          source={require("../assets/icon.png")}
          style={{
            width: 180,
            height: 180,
            marginTop: 20,
            marginBottom: 20,
          }}
        />
        <Text style={{ color: "#3cebc5", fontSize: 24, marginTop: 10 }}>
          Login
        </Text>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.textLabel}>Email:</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="e.g., user@example.com"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Password:</Text>
        <TextInput
          autoCapitalize="none"
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#ccc"
          secureTextEntry
        />
        <Pressable
          style={[
            styles.button,
            {
              shadowRadius: 4,
              elevation: 5,
            },
          ]}
          onPress={() => alert("Profile logged in!")}
        >
          <Text style={styles.loginText}>Login</Text>
        </Pressable>
        <View style={{ marginTop: 20 }}>
          <Link href="/resetpw" style={styles.linkbutton}>
            Forgot your password? Reset
          </Link>
          <Link href="/register" style={styles.linkbutton}>
            Do not have an account? Sign up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0a5658",
  },
  text: {
    color: "#3cebc5",
    fontSize: 18,
  },
  input: {
    marginTop: 5,
    width: "90%",
    height: 40,
    borderWidth: 0,
    borderColor: "none",
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#b7b7b5",
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#1a4b45",
  },
  button: {
    marginTop: 35,
    marginLeft: 12,
    marginRight: 12,
    width: "90%",
    backgroundColor: "#0d473b",
    padding: 10,
    borderRadius: 8,
    shadowRadius: 4,
    elevation: 5,
  },
  loginText: {
    color: "#3cebc5",
    fontSize: 16,
    textAlign: "center",
  },
  linkbutton: {
    marginTop: 15,
    color: "#84e6ca",
    textDecorationLine: "underline",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  textLabel: {
    color: "#3cebc5",
    fontSize: 16,
    alignSelf: "flex-start",
    marginLeft: "6%",
    marginTop: 20,
    marginBottom: 1,
  },
});
