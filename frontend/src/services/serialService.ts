import { type ApiResult, type DeviceType } from "@/shared/types";

export const serialService = {
  async getDevices(): Promise<ApiResult<DeviceType[]>> {
    try {
      const devices = await window.serial.getDevices();
      return {
        success: true,
        data: devices,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get serial devices: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  async connect(portPath: string): Promise<ApiResult<void>> {
    try {
      await window.serial.connectDevice(portPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to connect to device: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  write(data: string): void {
    try {
      window.serial.write(data);
    } catch (error) {
      console.error("Serial write error:", error);
      throw new Error(
        `Failed to write to serial: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },

  onData(handler: (data: string) => void): () => void {
    return window.serial.onData(handler);
  },
};
