import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function Register() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const cleanFirstName = firstName.trim();
    const cleanSurname = surname.trim();
    const cleanBusinessName = businessName.trim();
    const cleanBusinessType = businessType.trim();
    const cleanContactNo = contactNo.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (
      !cleanFirstName ||
      !cleanSurname ||
      !cleanBusinessName ||
      !cleanBusinessType ||
      !cleanEmail ||
      !cleanContactNo ||
      !cleanPassword ||
      !cleanConfirmPassword
    ) {
      Alert.alert("Missing details", "Please complete all fields.");
      return;
    }

    if (cleanPassword.length < 8) {
      Alert.alert("Password too short", "Please use at least 8 characters.");
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      Alert.alert("Passwords do not match", "Please check your password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: "mystockmate://auth/callback",
          data: {
            first_name: cleanFirstName,
            surname: cleanSurname,
            business_name: cleanBusinessName,
            business_type: cleanBusinessType,
            contact_no: cleanContactNo,
          },
        },
      });

      if (error) {
        Alert.alert("Registration failed", error.message);
        return;
      }

      if (data.session) {
        router.replace("/(tabs)/stock" as any);
      } else {
        Alert.alert(
          "Check your email",
          "Your account was created. Confirm your email, then log in to access your stock.",
        );
        router.replace("/login");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

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
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Surname</Text>
        <TextInput
          value={surname}
          onChangeText={setSurname}
          style={styles.input}
          placeholder="Enter your surname"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Business Name</Text>
        <TextInput
          value={businessName}
          onChangeText={setBusinessName}
          style={styles.input}
          placeholder="Enter your business name"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Business Type</Text>
        <TextInput
          value={businessType}
          onChangeText={setBusinessType}
          style={styles.input}
          placeholder="Enter your business type"
          placeholderTextColor="#ccc"
        />

        <Text style={styles.textLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#ccc"
          inputMode="email"
        />
        <Text style={styles.textLabel}>Contact No</Text>
        <TextInput
          value={contactNo}
          onChangeText={setContactNo}
          autoCapitalize="none"
          keyboardType="phone-pad"
          style={styles.input}
          placeholder="e.g 0123456789"
          placeholderTextColor="#ccc"
          inputMode="numeric"
        />
        <Text style={styles.textLabel}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#ccc"
          secureTextEntry={!showPassword}
        />

        <Text style={styles.textLabel}>Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#ccc"
          secureTextEntry={!showPassword}
        />
        <Pressable
          style={styles.showPassword}
          onPress={() => setShowPassword((value) => !value)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={19}
            color="#3cebc5"
          />
          <Text style={styles.showPasswordText}>
            {showPassword ? "Hide passwords" : "Show passwords"}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            {
              shadowRadius: 4,
              elevation: 5,
            },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            {loading ? "Creating account..." : "Register"}
          </Text>
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
    color: "#ffffff",
    fontSize: 17,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#173c3d",
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
  showPassword: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginRight: "6%",
    marginTop: 8,
  },
  showPasswordText: {
    color: "#3cebc5",
    fontSize: 14,
  },
  headerContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
    marginTop: -40,
  },
});
