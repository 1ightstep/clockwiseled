import { Toast } from "@/components/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import { Stack } from "expo-router";

export default function RootLayout() {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <ToastProvider>
        <Toast />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen
            name="/dashboard"
            options={{
              headerTitle: "Dashboard",
              headerShown: false,
              animation: "none",
            }}
          />
          <Stack.Screen
            name="/signin"
            options={{
              headerTitle: "Sign In",
              headerShown: false,
              animation: "none",
            }}
          />
        </Stack>
      </ToastProvider>
    </AuthProvider>
  );
}
