/// <reference types="vite/client" />
export { };

declare global {
    interface Window {
        serial: {
            write: (data: string | Uint8Array) => void
            onData: (callback: (data: string) => void) => void
            getDevices: () => Promise<DeviceType[]>;
        }
    }
}