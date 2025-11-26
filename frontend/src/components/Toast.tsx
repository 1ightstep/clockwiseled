import { useToast } from "@/hooks/useToast";
import { useEffect } from "react";
import "./Toast.css";

export function Toast() {
  const { toast, hideToast } = useToast();

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      hideToast();
    }, toast.duration);

    return () => window.clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) {
    return null;
  }

  return (
    <div className="toast-layer">
      <div
        className={`toast toast-${toast.type}`}
        role="status"
        aria-live="polite"
      >
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={hideToast}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
