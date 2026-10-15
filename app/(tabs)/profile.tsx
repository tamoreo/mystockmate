import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

type ProfileData = {
  first_name: string | null;
  surname: string | null;
  business_name: string | null;
  business_type: string | null;
  contact_no: string | null;
};

export default function Profile() {
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, surname, business_name, business_type, contact_no")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;

      setErrorMessage(error?.message ?? "");
      setProfile(error ? null : data);
      setLoadingProfile(false);
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3cebc5" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3cebc5" />
        <Text style={styles.text}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Profile</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.profileContent}
      >
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : !profile ? (
          <Text style={styles.text}>
            No profile information found. Check your Supabase profile table.
          </Text>
        ) : (
          <>
            <ProfileRow label="First name" value={profile.first_name} />
            <ProfileRow label="Surname" value={profile.surname} />
            <ProfileRow label="Business name" value={profile.business_name} />
            <ProfileRow label="Business type" value={profile.business_type} />
            <ProfileRow label="Contact number" value={profile.contact_no} />
            <ProfileRow label="Email" value={session.user.email ?? null} />
          </>
        )}
      </ScrollView>

      <View style={styles.btnContainer}>
        <Pressable
          style={styles.button}
          onPress={() =>
            Alert.alert(
              "Edit Account",
              "The profile editing form has not been connected yet.",
            )
          }
        >
          <Text style={styles.editBtn}>Edit Account</Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert(
              "Delete Account",
              "Account deletion has not been connected yet. Contact your administrator for assistance.",
            )
          }
        >
          <Text style={styles.deleteBtn}>Delete Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not provided"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0a5658",
  },
  text: {
    color: "#fff",
    fontSize: 18,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 10,
    position: "absolute",
    bottom: 95,
    width: "90%",
  },
  editBtn: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    width: "40%",
    backgroundColor: "#1e332e",
    padding: 10,
    borderRadius: 8,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
    padding: 10,
    width: "84%",
    shadowColor: "white",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerText: {
    color: "#3cebc5",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 50,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a5658",
    padding: 20,
  },
  scroll: {
    width: "100%",
    flex: 1,
  },
  profileContent: {
    padding: 20,
    paddingBottom: 130,
  },
  errorText: {
    color: "#ffb4b4",
    fontSize: 15,
  },
  profileRow: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#0f2f30",
  },
  label: {
    color: "#9caeb1",
    fontSize: 13,
    marginBottom: 5,
  },
  value: {
    color: "#ffffff",
    fontSize: 17,
  },
  deleteButton: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "red",
    padding: 12,
    borderRadius: 8,
  },
});
