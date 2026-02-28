import { SERIAL_CONFIG } from "@/constants";
import { ConnContext, type ConnContextValue } from "@/contexts/ConnContextDef";
import { formatSetClockCommand } from "@/utils/serialFormatter";
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

      await new Promise((resolve) =>
        setTimeout(resolve, SERIAL_CONFIG.ARDUINO_BOOT_DELAY_MS),
      );

      await window.serial.write(formatSetClockCommand());
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
