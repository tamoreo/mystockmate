import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

  const handled = useRef(false);
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    let mounted = true;

    async function confirmEmail(urlString?: string) {
      if (handled.current) return;
      handled.current = true;

      try {
        let code = params.code;
        let tokenHash = params.token_hash;
        let type = params.type;
        let errorDescription = params.error_description;

        if (urlString) {
          const url = new URL(urlString);
          const query = url.searchParams;
          const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));

          code = code ?? query.get("code") ?? undefined;
          tokenHash =
            tokenHash ??
            query.get("token_hash") ??
            fragment.get("token_hash") ??
            undefined;

          type = type ?? query.get("type") ?? fragment.get("type") ?? undefined;

          errorDescription =
            errorDescription ??
            query.get("error_description") ??
            fragment.get("error_description") ??
            undefined;

          const accessToken = fragment.get("access_token");
          const refreshToken = fragment.get("refresh_token");

          if (errorDescription) {
            throw new Error(errorDescription);
          }

          if (accessToken && refreshToken && !code && !tokenHash) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;
          }
        }

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;
        } else if (tokenHash && type === "signup") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "signup",
          });

          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getUser();

          if (error || !data.user?.email_confirmed_at) {
            throw new Error(
              "Confirmation details were not received. Please open the email link again.",
            );
          }
        }

        if (!mounted) return;

        setMessage("Email confirmed! Opening Login...");

        setTimeout(() => {
          if (mounted) router.replace("/login");
        }, 1000);
      } catch (error) {
        console.error("Email confirmation failed:", error);

        if (mounted) {
          handled.current = false;
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to confirm your email. Please try again.",
          );
        }
      }
    }

    if (params.code || params.token_hash || params.error_description) {
      void confirmEmail();
    } else {
      void Linking.getInitialURL().then((url) => {
        if (url) {
          void confirmEmail(url);
        } else {
          setMessage("Waiting for email confirmation...");
        }
      });
    }

    const subscription = Linking.addEventListener(
      "url",
      ({ url }) => void confirmEmail(url),
    );

    return () => {
      mounted = false;
      subscription.remove();
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
