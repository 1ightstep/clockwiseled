import { ConnContext } from "@/contexts/ConnContext";
import { useContext } from "react";

export const useConn = () => {
  const context = useContext(ConnContext);

  if (!context) {
    throw new Error("useConn must be used within a ConnProvider");
  }

  return context;
};
