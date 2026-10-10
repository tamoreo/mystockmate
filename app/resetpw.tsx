import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Resetpw() {
  return (
    <View style={styles.container}>
      <Text style={{ color: "#3cebc5", fontSize: 24, marginTop: 10 }}>
        Password Reset
      </Text>
      <Text style={styles.textLabel}>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#ccc"
      />
      <Text style={styles.textLabel}>New Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter New Password"
        placeholderTextColor="#ccc"
      />
      <Text style={styles.textLabel}>Confirm New Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        placeholderTextColor="#ccc"
      />
      <Pressable
        style={[
          styles.button,
          {
            shadowRadius: 4,
            elevation: 5,
          },
        ]}
        onPress={() => alert("Profile reset!")}
      >
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
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
    color: "#3cebc5",
    fontSize: 18,
  },
  input: {
    marginTop: 3,
    width: "90%",
    height: 40,
    borderWidth: 0,
    borderColor: "none",
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#b7b7b5",
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#1a4b45",
  },
  button: {
    marginTop: 28,
    marginLeft: 10,
    marginRight: 10,
    width: "90%",
    backgroundColor: "#0d473b",
    padding: 10,
    borderRadius: 8,
  },
  loginText: {
    color: "#3cebc5",
    fontSize: 16,
    textAlign: "center",
  },
  resetText: {
    color: "#3cebc5",
    fontSize: 16,
    textAlign: "center",
  },
  textLabel: {
    color: "#3cebc5",
    fontSize: 16,
    alignSelf: "flex-start",
    marginLeft: "6%",
    marginTop: 15,
    marginBottom: 1,
  },
});
