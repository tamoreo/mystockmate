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
    access_token?: string;
    refresh_token?: string;
  }>();

  const handled = useRef(false);
  const mounted = useRef(true);

  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    mounted.current = true;

    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const goToLogin = () => {
      if (!mounted.current) return;

      setMessage("Email confirmed! Opening Login...");

      router.replace("/login");
    };

    const confirmEmail = async (urlString?: string) => {
      if (handled.current) return;

      handled.current = true;

      try {
        let code = params.code;
        let tokenHash = params.token_hash;
        let type = params.type;
        let errorDescription = params.error_description;

        let accessToken = params.access_token;
        let refreshToken = params.refresh_token;

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

          accessToken =
            accessToken ??
            query.get("access_token") ??
            fragment.get("access_token") ??
            undefined;

          refreshToken =
            refreshToken ??
            query.get("refresh_token") ??
            fragment.get("refresh_token") ??
            undefined;
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
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;
        } else {
          // Check whether Supabase has already confirmed the user.
          const { data, error } = await supabase.auth.getUser();

          if (error) throw error;

          if (!data.user?.email_confirmed_at) {
            throw new Error(
              "Confirmation details were not received. Please open the email link again.",
            );
          }
        }

        goToLogin();
      } catch (error) {
        console.error("Email confirmation failed:", error);

        if (mounted.current) {
          handled.current = false;

          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to confirm your email. Please try again.",
          );
        }
      }
    };

    // Check parameters received by Expo Router.
    if (
      params.code ||
      params.token_hash ||
      params.access_token ||
      params.error_description
    ) {
      void confirmEmail();
    } else {
      // Check the initial deep link.
      void Linking.getInitialURL().then((url) => {
        if (url) {
          void confirmEmail(url);
        } else {
          // Check whether the user is already confirmed.
          void supabase.auth.getUser().then(({ data, error }) => {
            if (!error && data.user?.email_confirmed_at && mounted.current) {
              goToLogin();
            } else if (mounted.current) {
              setMessage("Waiting for email confirmation...");
            }
          });
        }
      });
    }

    // Listen for links opened while this screen is active.
    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      void confirmEmail(url);
    });

    return () => {
      mounted.current = false;

      if (redirectTimer) clearTimeout(redirectTimer);

      linkSubscription.remove();
    };
  }, [params, router]);

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
