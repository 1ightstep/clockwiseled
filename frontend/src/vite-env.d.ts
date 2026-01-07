/// <reference types="vite/client" />
export {};

import type { DeviceType } from "./shared/type";

declare global {
  interface Window {
    serial: {
      write: (data: string) => void;
      onData: (callback: (data: string) => void) => () => void;
      getDevices: () => Promise<DeviceType[]>;
      connectDevice: (port: string) => void;
    };
  }
}
