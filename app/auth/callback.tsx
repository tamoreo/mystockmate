import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    token_hash?: string;
    type?: string;
    error_description?: string;
  }>();

  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    let active = true;

    async function confirmEmail() {
      try {
        if (params.error_description) {
          throw new Error(params.error_description);
        }

        // Handle Supabase PKCE confirmation links.
        if (typeof params.code === "string" && params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            params.code,
          );

          if (error) throw error;
        }
        // Handle token-hash confirmation links if your email template uses them.
        else if (
          typeof params.token_hash === "string" &&
          params.token_hash &&
          params.type === "signup"
        ) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: params.token_hash,
            type: "signup",
          });

          if (error) throw error;
        } else {
          throw new Error(
            "The confirmation link is incomplete or has already been used.",
          );
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          throw new Error(
            "Your email was confirmed, but a login session was not created. Please sign in.",
          );
        }

        if (active) {
          setMessage("Email confirmed! Opening your stock...");
          router.replace({ pathname: "/(tabs)/addstock" });
        }
      } catch (error) {
        console.error("Email confirmation error:", error);

        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to confirm your email. Please sign in or request a new confirmation email.",
          );
        }
      }
    }

    void confirmEmail();

    return () => {
      active = false;
    };
  }, [
    params.code,
    params.token_hash,
    params.type,
    params.error_description,
    router,
  ]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3cebc5" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a5658",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    color: "#3cebc5",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 24,
  },
});
