import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ConnContextValue = {
  connection: string | undefined;
  connect: (port: string) => Promise<void>;
  listen: (handler: (data: string) => void) => () => void;
};

export const ConnContext = createContext<ConnContextValue | undefined>(
  undefined
);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const ConnProvider = ({ children }: { children: ReactNode }) => {
  const [connection, setConnection] = useState<string | undefined>(undefined);

  const connect = useCallback<ConnContextValue["connect"]>(async (port) => {
    try {
      window.serial.connectDevice(port);
      await sleep(1500);
      setConnection(port);
    } catch (err) {
      console.error("Failed to connect:", err);
      setConnection(undefined);
    }
  }, []);

  const listen = useCallback((handler: (data: string) => void) => {
    return window.serial.onData(handler);
  }, []);

  const value = useMemo<ConnContextValue>(
    () => ({ connection, connect, listen }),
    [connection, connect, listen]
  );

  return <ConnContext.Provider value={value}>{children}</ConnContext.Provider>;
};
