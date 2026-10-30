import { Ionicons } from "@expo/vector-icons";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const emptyProfile: ProfileData = {
  first_name: "",
  surname: "",
  business_name: "",
  business_type: "",
  contact_no: "",
};

export default function Profile() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileData>(emptyProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDeleteAccount() {
    Alert.alert(
      "Permanently Delete Account?",
      "This will permanently delete your login account, profile, and stock items. You will not be able to use this account to log in again.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              setClearing(true);

              const { error } =
                await supabase.functions.invoke("delete-account");

              if (error) {
                throw error;
              }

              // Clear the session stored on this device.
              const { error: signOutError } = await supabase.auth.signOut({
                scope: "local",
              });

              if (signOutError) {
                console.warn("Local sign-out warning:", signOutError.message);
              }

              Alert.alert(
                "Account Deleted",
                "Your MyStockMate account has been deleted.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/"),
                  },
                ],
              );
            } catch (error) {
              console.error("Account deletion failed:", error);

              Alert.alert(
                "Deletion Failed",
                error instanceof Error
                  ? error.message
                  : "Unable to delete your account. Please try again.",
              );
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  }

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, surname, business_name, business_type, contact_no")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setProfile(null);
      } else if (data) {
        const savedProfile = data as ProfileData;
        setProfile(savedProfile);
        setForm(savedProfile);
      } else {
        setProfile(null);
        setForm(emptyProfile);
        setErrorMessage(
          "No profile record was found. Please check your profiles table.",
        );
      }
    } catch {
      setErrorMessage("Unable to load your profile. Please try again.");
    } finally {
      setLoadingProfile(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

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

  function updateField(key: keyof ProfileData, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEditing() {
    setForm(profile ?? emptyProfile);
    setEditing(true);
  }

  function cancelEditing() {
    setForm(profile ?? emptyProfile);
    setEditing(false);
  }

  async function saveProfile() {
    if (!userId) return;

    if (
      !form.first_name?.trim() ||
      !form.surname?.trim() ||
      !form.business_name?.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Please enter your first name, surname and business name.",
      );
      return;
    }

    setSaving(true);

    try {
      const updatedProfile = {
        first_name: form.first_name.trim(),
        surname: form.surname.trim(),
        business_name: form.business_name.trim(),
        business_type: form.business_type?.trim() || "",
        contact_no: form.contact_no?.trim() || "",
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", userId)
        .select("first_name, surname, business_name, business_type, contact_no")
        .maybeSingle();

      if (error) {
        Alert.alert("Update failed", error.message);
        return;
      }

      if (!data) {
        Alert.alert(
          "Profile not updated",
          "No profile record was updated. Please check that your profile exists and that your Supabase update policy permits this operation.",
        );
        return;
      }

      const saved = data as ProfileData;
      setProfile(saved);
      setForm(saved);
      setEditing(false);

      Alert.alert("Success", "Your profile has been updated.");
    } catch {
      Alert.alert("Error", "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  function renderField(
    label: string,
    field: keyof ProfileData,
    placeholder: string,
  ) {
    const value = form[field] ?? "";

    return (
      <View style={styles.profileRow}>
        <Text style={styles.label}>{label}</Text>

        {editing ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => updateField(field, text)}
            placeholder={placeholder}
            placeholderTextColor="#9caeb1"
            editable={!saving && !clearing}
          />
        ) : (
          <Text style={styles.value}>{value || "Not provided"}</Text>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.profileContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={42} color="#3cebc5" />
          </View>
          <Text style={styles.subtitle}>
            Manage your personal and business details
          </Text>
        </View>

        <View style={styles.profileRow}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>
            {session.user.email ?? "Not provided"}
          </Text>
          <Text style={styles.hint}>
            Your login email is managed separately by Supabase.
          </Text>
        </View>

        {loadingProfile ? (
          <ActivityIndicator
            size="large"
            color="#3cebc5"
            style={styles.loader}
          />
        ) : errorMessage ? (
          <View>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable style={styles.button} onPress={() => void loadProfile()}>
              <Text style={styles.editBtn}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {renderField("First Name", "first_name", "Enter first name")}
            {renderField("Surname", "surname", "Enter surname")}
            {renderField(
              "Business Name",
              "business_name",
              "Enter business name",
            )}
            {renderField(
              "Business Type",
              "business_type",
              "Enter business type",
            )}
            {renderField(
              "Contact Number",
              "contact_no",
              "Enter contact number",
            )}

            {editing ? (
              <>
                <Pressable
                  style={[
                    styles.button,
                    (saving || clearing) && styles.disabledButton,
                  ]}
                  onPress={() => void saveProfile()}
                  disabled={saving || clearing}
                >
                  {saving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.editBtn}>Save Changes</Text>
                  )}
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={cancelEditing}
                  disabled={saving || clearing}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={styles.button}
                onPress={startEditing}
                disabled={clearing}
              >
                <Ionicons name="create-outline" size={19} color="#ffffff" />
                <Text style={styles.editBtn}>Edit Profile</Text>
              </Pressable>
            )}

            <View style={styles.dangerSection}>
              <Text style={[styles.dangerTitle, styles.deleteAccountTitle]}>
                Permanently Delete Account
              </Text>
              <Text style={styles.dangerDescription}>
                Permanently delete your login account, profile and stock items.
              </Text>

              <Pressable
                style={[
                  styles.deleteButton,
                  (clearing || saving) && styles.disabledButton,
                ]}
                onPress={handleDeleteAccount}
                disabled={clearing || saving}
              >
                <Ionicons name="warning-outline" size={19} color="#ffffff" />
                <Text style={styles.deleteBtn}>Delete Account</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a5658",
  },
  scroll: {
    width: "100%",
    flex: 1,
  },
  profileContent: {
    padding: 20,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a5658",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f2f30",
    borderWidth: 2,
    borderColor: "#3cebc5",
    marginBottom: 8,
  },
  headerText: {
    color: "#3cebc5",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 15,
  },
  subtitle: {
    color: "#d0dada",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  profileRow: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#0f2f30",
  },
  label: {
    color: "#9caeb1",
    fontSize: 13,
    marginBottom: 7,
  },
  value: {
    color: "#ffffff",
    fontSize: 17,
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3cebc5",
    backgroundColor: "#173c3d",
    paddingHorizontal: 10,
    color: "#ffffff",
    fontSize: 17,
  },
  hint: {
    color: "#9caeb1",
    fontSize: 12,
    marginTop: 7,
  },
  button: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1e332e",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  editBtn: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3cebc5",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  cancelText: {
    color: "#3cebc5",
    fontSize: 16,
  },
  dangerSection: {
    marginTop: 26,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#326d6d",
  },
  dangerTitle: {
    color: "#ffb4b4",
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteAccountTitle: {
    marginTop: 24,
  },
  dangerDescription: {
    color: "#d0dada",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  deleteButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ff6b6b",
    backgroundColor: "#682d2d",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  deleteBtn: {
    color: "#ffffff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: "#ffb4b4",
    fontSize: 15,
    marginBottom: 10,
  },
  loader: {
    marginVertical: 24,
  },
});
