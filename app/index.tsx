import { COLORS } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const { user } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      {user ? (
        <Text>Welcome, {user.name}!</Text>
      ) : (
        <Redirect href="/auth/signin" />
      )}
    </View>
  );
}
