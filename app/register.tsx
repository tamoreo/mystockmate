import { Link } from "expo-router";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

export default function Register() {
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
        <Text style={styles.textLabel}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Surname</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your surname"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Business Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your business name"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Business Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your business type"
          placeholderTextColor="#ccc"
        />

        <Text style={styles.textLabel}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#ccc"
          inputMode="email"
        />
        <Text style={styles.textLabel}>Contact No</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="phone-pad"
          style={styles.input}
          placeholder="e.g 0123456789"
          placeholderTextColor="#ccc"
          inputMode="numeric"
        />
        <Text style={styles.textLabel}>Password</Text>
        <TextInput
          autoCapitalize="none"
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#ccc"
          secureTextEntry
        />
        <Text style={styles.textLabel}>Confirm Password</Text>
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
        <Text style={{ color: "#3cebc5", fontSize: 16, marginTop: 20 }}>
          Already have an account?{" "}
          <Link href="/login" style={styles.linkbutton}>
            Sign in
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
    width: "50%",
    backgroundColor: "#0d473b",
    padding: 10,
    borderRadius: 8,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: "center",
  },
  linkbutton: {
    marginTop: 40,
    color: "#76e2c3",
    textDecorationLine: "underline",
    textAlign: "center",
    gap: 10,
  },
  registerText: {
    color: "#3cebc5",
    fontSize: 16,
    textAlign: "center",
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
});
