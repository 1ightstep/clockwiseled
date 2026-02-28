import { ConnContext, type ConnContextValue } from "@/contexts/ConnContextDef";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const ConnProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<string | undefined>(undefined);

  const connect = useCallback<ConnContextValue["connect"]>(async (port) => {
    try {
      await window.serial.connectDevice(port);
      setConnection(port);
    } catch (err) {
      setConnection(undefined);
      throw err;
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
