import { Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const { user } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {user ? <Text>Welcome, {user.name}!</Text> : <Text>Please log in.</Text>}
    </View>
  );
}
