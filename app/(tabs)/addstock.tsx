import { MaterialCommunityIcons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

const BUCKET_NAME = "stock-images";

export default function AddStock() {
  const router = useRouter();
  const { session } = useAuth();

  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  async function chooseImage(source: "camera" | "gallery") {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Camera permission required",
            "Allow camera access in your device settings to take an item photo.",
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Gallery permission required",
            "Allow photo library access to select an item picture.",
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Image error", "Could not open the image picker.");
    }
  }

  function handleChooseImage() {
    Alert.alert("Item Picture", "Choose how to add your picture.", [
      {
        text: "Take Photo",
        onPress: () => void chooseImage("camera"),
      },
      {
        text: "Choose from Gallery",
        onPress: () => void chooseImage("gallery"),
      },
      ...(selectedImage
        ? [
            {
              text: "Remove Picture",
              style: "destructive" as const,
              onPress: () => setSelectedImage(null),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  }

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

    let createdItemId: string | null = null;
    let uploadedPath: string | null = null;

    try {
      setSaving(true);

      // Create the stock row first to obtain its ID.
      const { data: item, error: insertError } = await supabase
        .from("stock_items")
        .insert({
          user_id: session.user.id,
          item_name: itemName.trim(),
          item_type: itemType.trim(),
          quantity: parsedQuantity,
          item_size: itemSize.trim() || null,
          item_description: description.trim() || null,
          item_price: parsedPrice,
          item_image_url: null,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      createdItemId = String(item.id);

      // Upload the picture if the user selected one.
      if (selectedImage) {
        if (!selectedImage.base64) {
          throw new Error(
            "The selected picture could not be read. Please select it again.",
          );
        }

        const mimeType = selectedImage.mimeType ?? "image/jpeg";

        const extension =
          mimeType === "image/png"
            ? "png"
            : mimeType === "image/webp"
              ? "webp"
              : "jpg";

        uploadedPath = `${session.user.id}/${createdItemId}.${extension}`;

        const imageData = decode(selectedImage.base64);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uploadedPath, imageData, {
            contentType: mimeType,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Save the private Storage path, not a public URL.
        const { error: updateError } = await supabase
          .from("stock_items")
          .update({ item_image_url: uploadedPath })
          .eq("id", item.id)
          .eq("user_id", session.user.id);

        if (updateError) throw updateError;
      }

      Alert.alert("Success", "Your stock item has been saved.", [
        {
          text: "OK",
          onPress: () => {
            handleClearFields();
            router.replace("/(tabs)/addstock");
          },
        },
      ]);
    } catch (error) {
      console.error("Save stock item error:", error);

      // Best-effort cleanup so a failed image upload
      // does not leave an incomplete stock record.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      if (createdItemId) {
        const { error: cleanupError } = await supabase
          .from("stock_items")
          .delete()
          .eq("id", createdItemId)
          .eq("user_id", session.user.id);

        if (cleanupError) {
          console.error("Stock cleanup failed:", cleanupError);
        }
      }

      Alert.alert(
        "Save failed",
        error instanceof Error
          ? error.message
          : "Could not save the item. Please try again.",
      );
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
    setSelectedImage(null);
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
          placeholder="e.g., Electronics, Clothing, Food"
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
          style={[styles.input, styles.descriptionInput]}
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
          keyboardType="decimal-pad"
          placeholderTextColor="#ccc"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.textLabel}>Item Image</Text>

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handleChooseImage}
          disabled={saving}
          activeOpacity={0.8}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <>
              <MaterialCommunityIcons
                name="camera-plus"
                size={36}
                color="#83c4b6"
              />
              <Text style={styles.imageHint}>Add item picture</Text>
            </>
          )}
        </TouchableOpacity>

        {selectedImage && (
          <Pressable
            style={styles.changeImageButton}
            onPress={handleChooseImage}
            disabled={saving}
          >
            <Text style={styles.changeImageText}>Change or remove picture</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.button, saving && styles.disabledButton]}
          onPress={handleSaveItem}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#3cebc5" />
          ) : (
            <Text style={styles.addText}>Save Item</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.clearButton}
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
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    elevation: 5,
    backgroundColor: "#173c3d",
    color: "#ffffff",
    fontSize: 17,
  },
  descriptionInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 25,
    width: "90%",
    backgroundColor: "#0d473b",
    padding: 12,
    borderRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
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
  imagePicker: {
    marginTop: 10,
    width: 180,
    height: 180,
    borderRadius: 12,
    borderColor: "#3cebc5",
    borderWidth: 1,
    borderStyle: "dashed",
    backgroundColor: "#173c3d",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageHint: {
    color: "#83c4b6",
    marginTop: 8,
    fontSize: 13,
  },
  changeImageButton: {
    marginTop: 10,
    padding: 8,
  },
  changeImageText: {
    color: "#3cebc5",
    textDecorationLine: "underline",
  },
  clearButton: {
    backgroundColor: "transparent",
    marginTop: 25,
    marginBottom: 30,
    padding: 10,
    width: "90%",
  },
});
