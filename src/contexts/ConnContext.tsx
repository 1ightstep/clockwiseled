import { SERIAL_CONFIG } from "@/constants";
import { ConnContext, type ConnContextValue } from "@/contexts/ConnContextDef";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const ConnProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<string | undefined>(undefined);

  const connect = useCallback<ConnContextValue["connect"]>(async (port) => {
    try {
      window.serial.connectDevice(port);
      await sleep(SERIAL_CONFIG.CONNECTION_TIMEOUT_MS);
      setConnection(port);
    } catch (err) {
      console.error("Failed to connect:", err);
      setConnection(undefined);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnection(undefined);
  }, []);

  useEffect(() => {
    const cleanup = window.serial.onDisconnect(() => {
      setConnection(undefined);
    });
    return cleanup;
  }, []);

  const listen = useCallback((handler: (data: string) => void) => {
    return window.serial.onData(handler);
  }, []);

  const value = useMemo<ConnContextValue>(
    () => ({ connection, connect, disconnect, listen }),
    [connection, connect, disconnect, listen],
  );

  return <ConnContext.Provider value={value}>{children}</ConnContext.Provider>;
};
