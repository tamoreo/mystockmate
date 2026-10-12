import { Link } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

export default function Login() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../assets/icon.png")}
          style={{
            width: 180,
            height: 180,
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        <Text style={styles.textLabel}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="e.g., user@example.com"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Password</Text>
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
        <Text style={[styles.loginText, { marginTop: 20 }]}>
          Forgot password?{" "}
          <Link href="/resetpw" style={styles.linkbutton}>
            Reset
          </Link>
        </Text>
        <Text style={[styles.loginText, { marginTop: 20 }]}>
          Do not have account?{" "}
          <Link href="/register" style={styles.linkbutton}>
            Sign up
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a5658",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 125,
    backgroundColor: "#0a5658",
  },
  text: {
    color: "#3cebc5",
    fontSize: 14,
    paddingTop: 20,
    textAlign: "center",
    gap: 5,
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
    width: "40%",
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
