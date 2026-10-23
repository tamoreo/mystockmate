import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { supabase } from "../lib/supabase";

const RECOVERY_REDIRECT = "mystockmate://resetpw";

export default function Resetpw() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && active) {
        setRecoveryMode(true);
      }
    });

    async function handleRecoveryUrl(url: string | null) {
      if (!url || !url.startsWith(RECOVERY_REDIRECT)) {
        return;
      }

      try {
        const parsedUrl = new URL(url);
        const queryParams = new URLSearchParams(parsedUrl.search);
        const hashParams = new URLSearchParams(
          parsedUrl.hash.replace(/^#/, ""),
        );

        const linkError =
          queryParams.get("error_description") ??
          hashParams.get("error_description");

        if (linkError) {
          if (active) {
            Alert.alert("Recovery link error", linkError);
          }
          return;
        }

        // PKCE flow: exchange the authorization code for a session.
        const code = queryParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          if (active) {
            setRecoveryMode(true);
          }
          return;
        }

        // Implicit flow: establish the session using the tokens
        // supplied in the URL fragment.
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          if (active) {
            setRecoveryMode(true);
          }
        }
      } catch (error) {
        console.error("Password recovery link error:", error);

        if (active) {
          Alert.alert(
            "Invalid or expired link",
            "Please request a new password reset link and try again.",
          );
        }
      }
    }

    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      void handleRecoveryUrl(url);
    });

    void Linking.getInitialURL().then(handleRecoveryUrl);

    return () => {
      active = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  async function requestReset() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setSending(true);

    try {
      // First, check the email using the deployed Edge Function.
      const { data, error } = await supabase.functions.invoke(
        "check-reset-email",
        {
          body: { email: cleanEmail },
        },
      );

      if (error) {
        let message = "Unable to check this email right now. Please try again.";

        try {
          const response = (error as { context?: Response }).context;

          if (response) {
            const body = await response.clone().json();
            if (typeof body?.error === "string") {
              message = body.error;
            }
          }
        } catch {
          // Keep the fallback message if the response is unreadable.
        }

        Alert.alert("Password reset", message);
        return;
      }

      if (data?.exists !== true) {
        Alert.alert(
          "Email not found",
          "This email address does not exist. Please check your email and try again.",
        );
        return;
      }

      // Then send the recovery email to the registered address.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: RECOVERY_REDIRECT,
        },
      );

      if (resetError) {
        Alert.alert("Request failed", resetError.message);
        return;
      }

      Alert.alert(
        "Check your email",
        "Your password reset link has been requested. Open the link on the device where MyStockMate is installed to choose a new password.",
      );
    } catch (error) {
      console.error("Password reset request error:", error);

      Alert.alert(
        "Error",
        "Unable to request a reset link. Please check your connection and try again.",
      );
    } finally {
      setSending(false);
    }
  }

  async function updatePassword() {
    if (password.length < 8) {
      Alert.alert(
        "Password too short",
        "Your new password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Please enter matching passwords.");
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        Alert.alert("Password update failed", error.message);
        return;
      }

      setPassword("");
      setConfirmPassword("");

      Alert.alert("Success", "Your password has been updated.", [
        {
          text: "Continue to Login",
          onPress: () => {
            void (async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            })();
          },
        },
      ]);
    } catch {
      Alert.alert("Error", "Unable to update your password.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Ionicons
          name="lock-closed-outline"
          size={54}
          color="#3cebc5"
          style={styles.lockIcon}
        />

        <Text style={styles.title}>
          {recoveryMode ? "Choose New Password" : "Password Reset"}
        </Text>

        {!recoveryMode ? (
          <>
            <Text style={styles.description}>
              Enter your email address and we will send you a password reset
              link.
            </Text>

            <Text style={styles.textLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!sending}
            />

            <Pressable
              style={styles.button}
              onPress={() => void requestReset()}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#3cebc5" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Enter your new password below.
            </Text>

            <Text style={styles.textLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!updating}
            />

            <Text style={styles.textLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!updating}
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
              style={styles.button}
              onPress={() => void updatePassword()}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#3cebc5" />
              ) : (
                <Text style={styles.buttonText}>Update Password</Text>
              )}
            </Pressable>
          </>
        )}

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a5658",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  lockIcon: {
    marginBottom: 10,
  },
  title: {
    color: "#3cebc5",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    color: "#ffffff",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  textLabel: {
    color: "#3cebc5",
    fontSize: 16,
    alignSelf: "flex-start",
    marginLeft: "5%",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    marginTop: 3,
    width: "90%",
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#ffffff",
    backgroundColor: "#1a4b45",
    borderWidth: 1,
    borderColor: "#326d6d",
    elevation: 3,
  },
  button: {
    marginTop: 28,
    width: "90%",
    minHeight: 46,
    backgroundColor: "#0d473b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3cebc5",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  buttonText: {
    color: "#3cebc5",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  showPassword: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginLeft: "5%",
    marginTop: 12,
  },
  showPasswordText: {
    color: "#3cebc5",
    fontSize: 14,
  },
  backButton: {
    marginTop: 22,
    padding: 10,
  },
  backText: {
    color: "#3cebc5",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
