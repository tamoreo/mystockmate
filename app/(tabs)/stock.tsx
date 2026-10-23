import { Ionicons } from "@expo/vector-icons";
import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
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

type StockItem = {
  id: string;
  user_id: string;
  item_name: string;
  item_type: string | null;
  quantity: number;
  item_size: string | null;
  item_description: string | null;
  item_price: number | null;
  item_image_url: string | null;
  created_at: string;
};

export default function Stock() {
  const { session, loading: authLoading } = useAuth();

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit form state
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const userId = session?.user.id;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function fetchStock() {
        if (!userId) {
          setItems([]);
          setLoadingItems(false);
          return;
        }

        setLoadingItems(true);
        setErrorMessage("");

        try {
          const { data, error } = await supabase
            .from("stock_items")
            .select(
              "id, user_id, item_name, item_type, quantity, item_size, item_description, item_price, item_image_url, created_at",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (cancelled) return;

          if (error) {
            setErrorMessage(error.message);
            setItems([]);
          } else {
            setItems((data ?? []) as StockItem[]);
          }
        } catch {
          if (!cancelled) {
            setErrorMessage("Unable to connect. Please try again.");
            setItems([]);
          }
        } finally {
          if (!cancelled) {
            setLoadingItems(false);
          }
        }
      }

      void fetchStock();

      return () => {
        cancelled = true;
      };
    }, [userId]),
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

  const filteredItems = items.filter((item) => {
    const term = search.trim().toLowerCase();

    return (
      item.item_name.toLowerCase().includes(term) ||
      (item.item_type ?? "").toLowerCase().includes(term) ||
      (item.item_size ?? "").toLowerCase().includes(term) ||
      (item.item_description ?? "").toLowerCase().includes(term)
    );
  });

  function openEditModal(item: StockItem) {
    setEditItem(item);
    setItemName(item.item_name);
    setItemType(item.item_type ?? "");
    setQuantity(String(item.quantity));
    setItemSize(item.item_size ?? "");
    setDescription(item.item_description ?? "");
    setPrice(item.item_price != null ? String(item.item_price) : "");
  }

  function closeEditModal() {
    if (saving) return;

    setEditItem(null);
    setItemName("");
    setItemType("");
    setQuantity("");
    setItemSize("");
    setDescription("");
    setPrice("");
  }

  async function handleUpdateItem() {
    if (!editItem || !userId) return;

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

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("stock_items")
        .update({
          item_name: itemName.trim(),
          item_type: itemType.trim(),
          quantity: parsedQuantity,
          item_size: itemSize.trim() || null,
          item_description: description.trim() || null,
          item_price: parsedPrice,
        })
        .eq("id", editItem.id)
        .eq("user_id", userId)
        .select(
          "id, user_id, item_name, item_type, quantity, item_size, item_description, item_price, item_image_url, created_at",
        )
        .single();

      if (error) {
        Alert.alert("Update failed", error.message);
        return;
      }

      if (!data) {
        Alert.alert("Update failed", "The item could not be found.");
        return;
      }

      const updatedItem = data as StockItem;

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      );

      setEditItem(null);
      Alert.alert("Success", "Your stock item has been updated.");
    } catch {
      Alert.alert("Error", "Could not update the item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteItem(item: StockItem) {
    Alert.alert(
      "Delete stock item",
      `Are you sure you want to delete "${item.item_name}"? This cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteItem(item),
        },
      ],
    );
  }

  async function confirmDeleteItem(item: StockItem) {
    if (!userId) return;

    setDeletingId(item.id);

    try {
      const { data, error } = await supabase
        .from("stock_items")
        .delete()
        .eq("id", item.id)
        .eq("user_id", userId)
        .select("id");

      if (error) {
        Alert.alert("Delete failed", error.message);
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert(
          "Not deleted",
          "The item was not deleted. Check your permissions and try again.",
        );
        return;
      }

      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id),
      );

      Alert.alert("Success", "Stock item deleted.");
    } catch {
      Alert.alert("Error", "Could not delete the item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="lightgray"
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          inputMode="search"
          placeholder="Search stock"
          placeholderTextColor="#b7b7b1"
        />
      </View>

      {/* Inventory list */}
      {loadingItems ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3cebc5" />
          <Text style={styles.message}>Loading your stock...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Could not load stock: {errorMessage}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              {item.item_image_url ? (
                <Image
                  source={{ uri: item.item_image_url }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={styles.itemName}>{item.item_name}</Text>

              <Text style={styles.itemDetail}>
                Type: {item.item_type || "Not specified"}
              </Text>

              <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>

              <Text style={styles.itemDetail}>
                Size: {item.item_size || "Not specified"}
              </Text>

              <Text style={styles.itemDetail}>
                Description: {item.item_description || "No description"}
              </Text>

              <Text style={styles.itemPrice}>
                Price:{" "}
                {item.item_price != null
                  ? `R ${Number(item.item_price).toFixed(2)}`
                  : "Not set"}
              </Text>

              {/* Edit and delete actions */}
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.editButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => openEditModal(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.item_name}`}
                >
                  <Ionicons name="create-outline" size={20} color="#0f2f30" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.deleteButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => handleDeleteItem(item)}
                  disabled={deletingId === item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.item_name}`}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ffffff"
                      />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="file-tray-outline" size={42} color="#b7b7b1" />
              <Text style={styles.message}>
                {search.trim()
                  ? "No matching stock items found."
                  : "No stock items yet. Add your first item!"}
              </Text>
            </View>
          }
        />
      )}

      {/* Edit item modal */}
      <Modal
        visible={editItem !== null}
        animationType="slide"
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Stock Item</Text>

              <Pressable
                onPress={closeEditModal}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Close edit form"
              >
                <Ionicons name="close-circle" size={28} color="#3cebc5" />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.fieldLabel}>Item Name *</Text>
              <TextInput
                style={styles.formInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Enter item name"
                placeholderTextColor="#aab8b8"
              />

              <Text style={styles.fieldLabel}>Item Type *</Text>
              <TextInput
                style={styles.formInput}
                value={itemType}
                onChangeText={setItemType}
                placeholder="Enter item type"
                placeholderTextColor="#aab8b8"
              />

              <Text style={styles.fieldLabel}>Quantity *</Text>
              <TextInput
                style={styles.formInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                placeholder="Enter quantity"
                placeholderTextColor="#aab8b8"
              />

              <Text style={styles.fieldLabel}>Item Size</Text>
              <TextInput
                style={styles.formInput}
                value={itemSize}
                onChangeText={setItemSize}
                placeholder="Enter item size"
                placeholderTextColor="#aab8b8"
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                placeholderTextColor="#aab8b8"
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Price (R)</Text>
              <TextInput
                style={styles.formInput}
                value={price}
                onChangeText={setPrice}
                keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                placeholder="Enter price"
                placeholderTextColor="#aab8b8"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                  saving && styles.disabledButton,
                ]}
                onPress={handleUpdateItem}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#0f2f30" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={21} color="#0f2f30" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={closeEditModal}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a5658",
  },
  searchContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
    position: "relative",
  },
  searchInput: {
    width: "90%",
    height: 40,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingLeft: 38,
    paddingRight: 35,
    color: "#ffffff",
    backgroundColor: "#0f2f30",
  },
  searchIcon: {
    position: "absolute",
    left: "7%",
    top: 22,
    zIndex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    color: "#d0dada",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    color: "#ffd2d2",
    textAlign: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },
  itemCard: {
    backgroundColor: "#0f2f30",
    padding: 16,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3cebc5",
  },
  itemImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#173c3d",
  },
  itemName: {
    color: "#3cebc5",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemDetail: {
    color: "#ffffff",
    fontSize: 15,
    marginBottom: 6,
  },
  itemPrice: {
    color: "#3cebc5",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  editButton: {
    backgroundColor: "#3cebc5",
  },
  editButtonText: {
    color: "#0f2f30",
    fontSize: 15,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#b83232",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
  },
  modalContent: {
    maxHeight: "90%",
    backgroundColor: "#0a5658",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#3cebc5",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#3cebc5",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  fieldLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },
  formInput: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0f2f30",
    borderWidth: 1,
    borderColor: "#326d6d",
    color: "#ffffff",
    fontSize: 15,
  },
  descriptionInput: {
    minHeight: 90,
  },
  saveButton: {
    minHeight: 48,
    backgroundColor: "#3cebc5",
    borderRadius: 10,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#0f2f30",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.65,
  },
  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 15,
  },
});
