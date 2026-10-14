import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  quantity: number;
  created_at: string;
};

export default function Stock() {
  const { session, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userId = session?.user.id;

  useEffect(() => {
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
          .select("id, user_id, item_name, quantity, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (error) {
          setErrorMessage(error.message);
          setItems([]);
        } else {
          setItems(data ?? []);
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

    fetchStock();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="lightgray"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          inputMode="search"
          placeholder="Search stock"
          placeholderTextColor="#b7b7b1"
        />
      </View>

      {loadingItems ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#14b8a6" />
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
          contentContainerStyle={[styles.listContent, { paddingTop: 16 }]}
          renderItem={({ item }) => (
            <View style={styles.stockCard}>
              <View style={styles.itemIcon}>
                <Ionicons name="cube-outline" size={24} color="#14b8a6" />
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
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
    position: "relative",
  },
  input: {
    width: "90%",
    height: 36,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingLeft: 38,
    paddingRight: 35,
    color: "#b7b7b1",
    backgroundColor: "#0f2f30",
  },
  icon: {
    position: "absolute",
    left: 28,
    top: 20,
    zIndex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContainer: {
    width: "100%",
    flex: 1,
  },
  message: {
    marginTop: 12,
    color: "#777777",
    textAlign: "center",
    fontSize: 15,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  stockCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#e6f8f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  quantity: {
    marginTop: 5,
    fontSize: 14,
    color: "#777777",
  },
});
