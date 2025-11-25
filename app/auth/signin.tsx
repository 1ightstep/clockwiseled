import { AntDesign } from "@expo/vector-icons";
import { useEffect } from "react";
import styles from "./signin.style";

import * as Google from "expo-auth-session/providers/google";
import { Pressable, Text, TextInput, View } from "react-native";

export default function AuthLayout() {
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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Clockwise</Text>

        <View style={styles.formView}>
          <TextInput placeholder="Email" style={styles.input} />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />
          <Pressable style={styles.submitBtn} onPress={() => promptAsync()}>
            <Text style={styles.submitText}>Sign In</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>or</Text>
        <View>
          <Text style={styles.oauth}>
            <AntDesign name="google" style={styles.googleIcon} />
            Sign in with Google
          </Text>
        </View>
      </View>
    </View>
  );
}
