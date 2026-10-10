import { Link } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, width: "100%" }}
      >
        <View style={{ alignItems: "center" }}>
          <View style={styles.headerContainer}>
            <Text style={{ color: "#3cebc5", fontSize: 24, marginTop: 10 }}>
              MyStockMate Account
            </Text>
            <Image
              source={require("../assets/icon.png")}
              style={styles.stockmateIcon}
            />
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.textLabel}>First Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            placeholderTextColor="#ccc"
          />
          <Text style={styles.textLabel}>Surname:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your surname"
            placeholderTextColor="#ccc"
          />
          <Text style={styles.textLabel}>Email:</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor="#ccc"
            inputMode="email"
          />
          <Text style={styles.textLabel}>Contact No:</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="e.g 0123456789"
            placeholderTextColor="#ccc"
            inputMode="numeric"
          />
          <Text style={styles.textLabel}>Password:</Text>
          <TextInput
            autoCapitalize="none"
            style={styles.input}
            placeholder="Enter password"
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
            onPress={() => alert("Profile registered!")}
          >
            <Text style={styles.registerText}>Register</Text>
          </Pressable>
        </View>
        <Link href="/login" style={styles.linkbutton}>
          Already have an account? Sign in
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0a5658",
  },
  input: {
    marginTop: 2,
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
  label: {
    color: "#3cebc5",
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    width: "90%",
    backgroundColor: "#0d473b",
    padding: 10,
    borderRadius: 8,
    shadowRadius: 4,
    elevation: 5,
  },
  linkbutton: {
    marginTop: 20,
    color: "#cddbd7",
    textDecorationLine: "underline",
    textAlign: "center",
  },
  registerText: {
    color: "#3cebc5",
    fontSize: 16,
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
    marginTop: 10,
    marginBottom: 1,
  },
  headerContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
    marginTop: -40,
  },
  stockmateIcon: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 6,
    alignSelf: "center",
  },
});
