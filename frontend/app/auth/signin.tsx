import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { AntDesign } from "@expo/vector-icons";
import { useEffect } from "react";
import styles from "./signin.style";

import * as Google from "expo-auth-session/providers/google";
import { Pressable, Text, View } from "react-native";

export default function AuthLayout() {
  const { showToast } = useToast();

  useEffect(() => {
    showToast("Welcome to the sign-in page!", 3000, "error");
  }, [showToast]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "YOUR_EXPO_CLIENT_ID",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("Authentication successful:", authentication);
    }
  }, [response]);

  return (
    <>
      <Toast />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Clockwise</Text>
          <Pressable style={styles.oauth}>
            <Text style={styles.oauthText}>
              <AntDesign name="google" style={styles.googleIcon} />
              Sign in with Google
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
