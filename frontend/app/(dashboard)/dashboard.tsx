import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import { Text } from "react-native";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) {
    return <Redirect href="/signIn" />;
  }

  return <Text>Dashboard Page</Text>;
}
