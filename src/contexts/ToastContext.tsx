import { TOAST_DURATION, TOAST_TYPE } from "@/constants";
import {
  ToastContext,
  type ToastContextValue,
  type ToastType,
} from "@/contexts/ToastContextDef";
import { useCallback, useMemo, useState, type ReactNode } from "react";

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, duration = TOAST_DURATION.NORMAL, type = TOAST_TYPE.INFO) => {
      setToast({ message, duration, type });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toast, showToast, hideToast }),
    [toast, showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
