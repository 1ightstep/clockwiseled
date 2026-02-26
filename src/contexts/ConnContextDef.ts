import { createContext } from "react";

export type ConnContextValue = {
  connection: string | undefined;
  connect: (port: string) => Promise<void>;
  listen: (handler: (data: string) => void) => () => void;
};

export const ConnContext = createContext<ConnContextValue | undefined>(
  undefined,
);
