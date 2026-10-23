import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function AddStock() {
  const router = useRouter();
  const { session } = useAuth();

  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSaveItem() {
    if (!session?.user) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }

    if (!itemName.trim() || !itemType.trim() || !quantity.trim()) {
      Alert.alert(
        "Missing details",
        "Please enter the item name, item type and quantity.",
      );
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedPrice = price.trim() === "" ? null : Number(price);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      Alert.alert("Invalid quantity", "Enter a whole number of 0 or more.");
      return;
    }

    if (
      parsedPrice !== null &&
      (!Number.isFinite(parsedPrice) || parsedPrice < 0)
    ) {
      Alert.alert("Invalid price", "Enter a valid price of 0 or more.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("stock_items").insert({
        user_id: session.user.id,
        item_name: itemName.trim(),
        item_type: itemType.trim(),
        quantity: parsedQuantity,
        item_size: itemSize.trim() || null,
        item_description: description.trim() || null,
        item_price: parsedPrice,
        item_image_url: null,
      });

      if (error) {
        Alert.alert("Save failed", error.message);
        return;
      }

      Alert.alert("Success", "Your stock item has been saved.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/addstock"),
        },
      ]);
    } catch {
      Alert.alert("Error", "Could not save the item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleClearFields() {
    setItemName("");
    setItemType("");
    setQuantity("");
    setItemSize("");
    setDescription("");
    setPrice("");
  }

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
          value={itemName}
          onChangeText={setItemName}
        />
        <Text style={styles.textLabel}>Item Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Elcetronics, Clothing, Food"
          placeholderTextColor="#ccc"
          value={itemType}
          onChangeText={setItemType}
        />
        <Text style={styles.textLabel}>Item Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 10"
          keyboardType="numeric"
          placeholderTextColor="#ccc"
          value={quantity}
          onChangeText={setQuantity}
        />
        <Text style={styles.textLabel}>Item Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Large or 5kg"
          placeholderTextColor="#ccc"
          value={itemSize}
          onChangeText={setItemSize}
        />
        <Text style={styles.textLabel}>Item Description</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., A sleek smartphone with advanced features"
          placeholderTextColor="#ccc"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.textLabel}>Item Price</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 99.99"
          inputMode="decimal"
          placeholderTextColor="#ccc"
          value={price}
          onChangeText={setPrice}
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
          onPress={handleSaveItem}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#3cebc5" />
          ) : (
            <Text style={styles.addText}>Save Items</Text>
          )}
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
          onPress={handleClearFields}
          disabled={saving}
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
    backgroundColor: "#173c3d",
    color: "white",
    fontSize: 15,
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
