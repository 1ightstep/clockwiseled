import { Toast } from "@/components/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Toast />
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
      </ToastProvider>
    </AuthProvider>
  );
}
