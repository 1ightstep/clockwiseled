import { ToastContet, type ToastContextValue } from "@/contexts/ToastContext";
import { useContext } from "react";

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContet);
  if (!context) {
    throw new Error("useToast must be used within a ToastContextProvider");
  }
  return context;
};
