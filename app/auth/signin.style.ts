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
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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

  subtitle: {
    fontSize: TEXT_SIZES.m,
    color: COLORS.primary,
    marginBottom: 10,
    marginTop: 10,
  },

  formView: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },

  input: {
    width: 250,
    height: 40,
    borderBottomColor: COLORS.primary,
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingLeft: 8,
    color: COLORS.primary,
  },

  submitBtn: {
    width: 250,
    height: 45,
    backgroundColor: COLORS.brand,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.sm,
  },

  submitText: {
    color: COLORS.background,
    fontSize: TEXT_SIZES.m,
    fontWeight: "bold",
  },

  oauth: {
    marginBottom: 20,
    width: 250,
    textAlign: "center",
    color: COLORS.primary,
    borderColor: COLORS.primary,
    borderWidth: 1,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.sm,
  },

  googleIcon: {
    fontSize: 20,
    marginRight: 8,
    color: COLORS.primary,
  },
});

export default styles;
