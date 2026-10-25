import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function confirmEmail() {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (!initialUrl) {
          throw new Error(
            "No confirmation link was received. Please open the email link again.",
          );
        }

        const url = new URL(initialUrl);
        const query = url.searchParams;
        const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));

        const errorDescription =
          query.get("error_description") ?? fragment.get("error_description");

        if (errorDescription) {
          throw new Error(
            decodeURIComponent(errorDescription.replace(/\+/g, " ")),
          );
        }

        const code = query.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;
        } else {
          const tokenHash =
            query.get("token_hash") ?? fragment.get("token_hash");

          const type = query.get("type") ?? fragment.get("type");

          if (tokenHash && type === "signup") {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "signup",
            });

            if (error) throw error;
          } else {
            const accessToken = fragment.get("access_token");
            const refreshToken = fragment.get("refresh_token");

            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) throw error;
            } else {
              throw new Error(
                "The link did not contain confirmation details. Request a new confirmation email and try again.",
              );
            }
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          throw new Error(
            "Your email may be confirmed, but no session was created. Please sign in.",
          );
        }

        setMessage("Email confirmed! Opening your stock...");
        router.replace("/(tabs)/addstock");
      } catch (error) {
        console.error("Email confirmation failed:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to confirm your email. Please try again.",
        );
      }
    }

    void confirmEmail();
  }, [router]);

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
