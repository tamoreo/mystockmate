import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Profile() {
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
          <Text style={styles.saveBtn}>Edit Account</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => alert("Account deleted!")}
        >
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
  saveBtn: {
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
    color: "red",
    fontSize: 18,
    textAlign: "center",
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
