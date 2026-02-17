import { type ApiResult, type ScheduleData } from "@/shared/types";

export const databaseService = {
  async getAllSchedules(): Promise<ApiResult<ScheduleData[]>> {
    try {
      const schedules = await window.db.getAllSchedules();
      return {
        success: true,
        data: schedules,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load schedules: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  async saveSchedule(schedule: ScheduleData): Promise<ApiResult<void>> {
    try {
      await window.db.saveSchedule(schedule);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  async deleteSchedule(id: string | number): Promise<ApiResult<void>> {
    try {
      await window.db.deleteSchedule(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
};
