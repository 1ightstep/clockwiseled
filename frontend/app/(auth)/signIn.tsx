import { Toast } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AntDesign } from "@expo/vector-icons";
import { useEffect } from "react";
import styles from "./signIn.style";

import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Platform, Pressable, Text, View } from "react-native";

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export default function SignIn() {
  const { showToast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    const signIn = async () => {
      if (
        response?.type === "success" &&
        response.authentication?.accessToken
      ) {
        showToast("Successfully signed in.", 3000, "success");

        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.authentication.accessToken}`,
            },
          }
        );
        const profile = await res.json();

        login({
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        });

        router.replace("/dashboard");
      }
    };

    signIn();
  }, [response, router, login, showToast]);

  return (
    <>
      <Toast />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Clockwise</Text>
          <Pressable style={styles.oauth} onPress={() => promptAsync()}>
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
