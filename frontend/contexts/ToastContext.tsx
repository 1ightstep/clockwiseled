import { createContext, useMemo, useState, type ReactNode } from "react";

export type ToastType = {
  message: string;
  duration: number;
  type: "success" | "error" | "info";
};

export type ToastContextValue = {
  toast: ToastType | null;
  showToast: (
    message: string,
    duration?: number,
    type?: "success" | "error" | "info"
  ) => void;
  hideToast: () => void;
};

export const ToastContet = createContext<ToastContextValue>({
  toast: null,
  showToast: () => {},
  hideToast: () => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast: ToastContextValue["showToast"] = (
    message,
    duration,
    type
  ) => {
    setToast({ message, duration: duration || 3000, type: type || "info" });
  };

  const hideToast: ToastContextValue["hideToast"] = () => {
    setToast(null);
  };

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      showToast,
      hideToast,
    }),
    [toast, showToast, hideToast]
  );

  return <ToastContet.Provider value={value}>{children}</ToastContet.Provider>;
};
