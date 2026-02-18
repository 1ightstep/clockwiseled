import { TOAST_DURATION, TOAST_TYPE } from "@/constants";
import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
    type?: ToastType["type"]
  ) => void;
  hideToast: () => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, duration = TOAST_DURATION.NORMAL, type = TOAST_TYPE.INFO) => {
      setToast({ message, duration, type });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toast, showToast, hideToast }),
    [toast, showToast, hideToast]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
