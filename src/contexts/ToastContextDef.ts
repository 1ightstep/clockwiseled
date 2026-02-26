import { createContext } from "react";

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
    type?: ToastType["type"],
  ) => void;
  hideToast: () => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);
