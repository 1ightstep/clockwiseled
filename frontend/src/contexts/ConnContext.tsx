import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ConnContextValue = {
  getConnection: string | undefined;
  connect: (port: string) => Promise<void>;
};

export const ConnContext = createContext<ConnContextValue | undefined>(
  undefined
);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const ConnProvider = ({ children }: { children: ReactNode }) => {
  const [getConnection, setConn] = useState<string | undefined>(undefined);
  const connect = useCallback<ConnContextValue["connect"]>(
    async (port: string) => {
      setConn(port);
      window.serial.connectDevice(port);
      await sleep(1500);
    },
    []
  );

  const value = useMemo<ConnContextValue>(
    () => ({
      getConnection,
      connect,
    }),
    [getConnection, connect]
  );

  return <ConnContext.Provider value={value}>{children}</ConnContext.Provider>;
};
