import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SearchBar } from "react-native-screens";

export default function Stock() {
  const [search, setSearch] = useState("");
  return (
    <View style={styles.container}>
      <SearchBar />
      <Ionicons name="search" size={20} color="lightgray" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={search}
        onChangeText={setSearch}
        inputMode="search"
      />
      <ScrollView style={styles.scrollContainer}>
        {/* Stock items will be rendered here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0a5658",
  },
  input: {
    width: "90%",
    height: 36,
    borderWidth: 0,
    borderColor: "none",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingLeft: 8,
    paddingRight: 35,
    color: "#b7b7b1",
    backgroundColor: "#0f2f30",
  },
  icon: {
    position: "absolute",
    left: 20,
    top: 7,
    marginLeft: "83%",
    zIndex: 1,
  },
  scrollContainer: {
    width: "100%",
    height: "100%",
  },
});
