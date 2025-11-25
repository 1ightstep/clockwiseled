import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Dashboard",
          }}
        />
        <Stack.Screen
          name="auth/signin"
          options={{
            headerTitle: "Sign In",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
