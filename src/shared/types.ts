export type EventItem = {
  id: string | number;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  r: number;
  g: number;
  b: number;
};

export type ScheduleData = {
  id: string | number;
  title: string;
  description: string;
  day: string;
  events: EventItem[];
};

export type DeviceType = {
  path: string;
  serialNumber?: string;
  manufacturer?: string;
};

export type ApiResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
