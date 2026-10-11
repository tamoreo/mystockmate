import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3cebc5",
        tabBarInactiveTintColor: "#9caeb1",
        headerStyle: {
          backgroundColor: "#0a5658",
        },
        headerShadowVisible: false,
        headerTintColor: "#ffffff",
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 36,
          marginTop: 25,
          color: "#3cebc5",
          fontWeight: "bold",

          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 30,
        },
        tabBarStyle: {
          backgroundColor: "#0f2f30",
          position: "absolute",
          bottom: 20,
          height: 60,
          borderTopWidth: 0,
          borderRadius: 30,
          marginHorizontal: 10,
          shadowColor: "#445d63",
          shadowOffset: {
            width: 8,
            height: 8,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        tabBarLabelStyle: {
          fontSize: 15,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          headerTitle: "MyStockMate",
          headerTitleAlign: "center",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          tabBarLabel: "Stock",
          headerTitle: "Inventory",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "clipboard" : "clipboard-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="addstock"
        options={{
          tabBarLabel: "Add Items",
          headerTitle: "New Item",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
