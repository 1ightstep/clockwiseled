import { BORDER_RADIUS, COLORS, SPACING, TEXT_SIZES } from "@/constants/theme";
import { StyleSheet } from "react-native";

const TOAST_COLORS = {
  success: COLORS.success,
  error: COLORS.error,
  info: COLORS.brand,
};

export const styles = StyleSheet.create({
  toastContainer: {
    position: "fixed",
    top: SPACING.xlg,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  toast: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.m,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: "#fff",
    fontSize: TEXT_SIZES.m,
    fontWeight: "500",
  },
});

export const getToastColor = (type: "success" | "error" | "info") =>
  TOAST_COLORS[type];
