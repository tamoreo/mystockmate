import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AddStock() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.textLabel}>Item Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Apple iPhone 13"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Item Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 10"
          keyboardType="numeric"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Item Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Large or 5kg"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Item Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., A sleek smartphone with advanced features"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Item Price</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 99.99"
          inputMode="decimal"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.textLabel}>Item Image</Text>
        <TouchableOpacity
          style={styles.image}
          onPress={() => alert("Image picker not implemented yet!")}
        >
          <MaterialCommunityIcons
            name="camera-plus"
            size={30}
            color="#83c4b6"
            alignSelf="center"
            style={{ marginTop: 40 }}
          />
        </TouchableOpacity>
        <Pressable
          style={styles.button}
          onPress={() => alert("Items added successfully!")}
        >
          <Text style={styles.addText}>Save Items</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "transparent",
            marginTop: 25,
            marginBottom: 30,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={() => alert("Fields cleared!")}
        >
          <Text style={styles.addText}>Clear Fields</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a5658",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 125,
    backgroundColor: "#0a5658",
  },
  input: {
    marginTop: 2,
    width: "90%",
    height: 40,
    borderWidth: 0,
    borderColor: "none",
    borderRadius: 8,
    paddingHorizontal: 10,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#1a4b45",
  },
  button: {
    marginTop: 25,
    marginLeft: 10,
    marginRight: 10,
    width: "90%",
    backgroundColor: "#0d473b",
    padding: 10,
    borderRadius: 8,
    shadowRadius: 4,
    elevation: 5,
  },
  addText: {
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
    marginBottom: 2,
  },
  image: {
    marginTop: 10,
    width: 110,
    height: 110,
    borderRadius: 4,
    borderColor: "#3cebc5",
    borderWidth: 0,
    shadowRadius: 8,
    elevation: 2,
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
