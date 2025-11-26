import { BORDER_RADIUS, COLORS, SPACING, TEXT_SIZES } from "@/constants/theme";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xlg,
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
  },

  content: {
    width: "auto",
    paddingVertical: SPACING.xxlg,
    paddingHorizontal: SPACING.xlg,
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  title: {
    fontSize: TEXT_SIZES.xlg,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 25,
  },

  oauth: {
    marginBottom: 20,
    width: 250,
    color: COLORS.primary,
    borderColor: COLORS.primary,
    borderWidth: 1,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.sm,
  },

  oauthText: {
    fontSize: TEXT_SIZES.m,
    color: COLORS.primary,
    textAlign: "center",
  },

  googleIcon: {
    fontSize: TEXT_SIZES.m,
    marginRight: 8,
    color: COLORS.primary,
  },
});

export default styles;
