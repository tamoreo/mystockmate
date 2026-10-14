import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

async function loadProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("No signed-in user");
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.log("Profile error:", error.message);
    return;
  }

  console.log("My profile:", data);
}

export default function Profile() {
  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 3 }}>
        {/* Profile information and settings will be rendered here */}
      </ScrollView>
      <View style={styles.btnContainer}>
        <Pressable
          style={styles.button}
          onPress={() => alert("Profile updated!")}
        >
          <Text style={styles.editBtn}>Edit Account</Text>
        </Pressable>
        <Pressable onPress={() => alert("Account deleted!")}>
          <Text style={styles.deleteBtn}>Delete Account</Text>
        </Pressable>
      </View>
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
});
