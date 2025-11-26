import { useToast } from "@/hooks/useToast";
import { type ReactElement, useEffect } from "react";
import { Text, View } from "react-native";
import { getToastColor, styles } from "./Toast.style";

export function Toast(): ReactElement | null {
  const { toast, hideToast } = useToast();

  if (!toast) {
    return null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  return (
    <View style={styles.toastContainer}>
      <View
        style={[styles.toast, { backgroundColor: getToastColor(toast.type) }]}
      >
        <Text style={styles.toastText}>{toast.message}</Text>
      </View>
    </View>
  );
}
