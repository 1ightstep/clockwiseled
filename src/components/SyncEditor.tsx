import {
  DAYS,
  DAY_INDEX,
  DEFAULT_COLORS,
  SERIAL_CONFIG,
  TOAST_DURATION,
  TOAST_TYPE,
  UI,
} from "@/constants";
import { useToast } from "@/hooks/useToast";
import { type ScheduleData } from "@/shared/types";
import {
  formatEndUploadCommand,
  formatEventCommand,
  formatSetClockCommand,
  formatUploadCommand,
  sendCommandSequence,
} from "@/utils/serialFormatter";
import { UploadCloud, X } from "lucide-react";
import { useState } from "react";
import "./SyncEditor.css";

type DeviceSyncProps = {
  schedules: ScheduleData[] | undefined;
  onSync: (assignment: Record<string, ScheduleData>) => void;
  onClose: () => void;
};

export function SyncEditor({ schedules, onSync, onClose }: DeviceSyncProps) {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleSelect = (day: string, scheduleId: string) => {
    setAssignments((prev) => ({ ...prev, [day]: scheduleId }));
  };

  const generateUploadCommands = (
    assignment: Record<string, ScheduleData>,
  ): string[] => {
    const commands: string[] = [];

    Object.entries(assignment).forEach(([day, schedule]) => {
      const dayIndex: number = DAY_INDEX[day as keyof typeof DAY_INDEX];

      commands.push(formatUploadCommand(dayIndex));

      const sortedEvents = [...schedule.events].sort(
        (a, b) => a.startH * 60 + a.startM - (b.startH * 60 + b.startM),
      );

      sortedEvents.forEach((event) => {
        commands.push(formatEventCommand(event));
      });

      commands.push(formatEndUploadCommand());
    });

    return commands;
  };

  const validateAndUpload = async () => {
    const assignedDays = Object.keys(assignments).filter(
      (day) => assignments[day] !== "",
    );

    if (assignedDays.length === 0) {
      showToast(
        "Please assign at least one schedule to a day.",
        TOAST_DURATION.NORMAL,
        TOAST_TYPE.ERROR,
      );
      return;
    }

    const finalData: Record<string, ScheduleData> = {};

    assignedDays.forEach((day) => {
      const found = schedules?.find((s) => s.id === assignments[day]);
      if (found) finalData[day] = found;
    });

    try {
      setIsUploading(true);
      const commands = generateUploadCommands(finalData);
      commands.push(formatSetClockCommand());
      await sendCommandSequence(commands, SERIAL_CONFIG.COMMAND_SEND_DELAY_MS);

      onSync(finalData);
      showToast(
        "Schedules synced to device successfully!",
        TOAST_DURATION.NORMAL,
        TOAST_TYPE.SUCCESS,
      );
      onClose();
    } catch (error) {
      showToast(
        "Couldn't sync schedules to the clock. Please check the connection and try again.",
        TOAST_DURATION.LONG,
        TOAST_TYPE.ERROR,
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sync-fixed-overlay">
      <div className="sync-container">
        <button className="exit-btn" onClick={onClose}>
          <X size={UI.ICON_SIZES.LARGE} />
        </button>

        <div className="sync-header">
          <div>
            <h2 className="sync-header-title">
              <UploadCloud
                size={UI.ICON_SIZES.XLARGE}
                color="var(--color-brand)"
              />{" "}
              Device Sync
            </h2>
            <p className="sync-header-subtitle">
              Assign a schedule to each day of the week.
            </p>
          </div>
        </div>

        <div className="week-grid">
          {DAYS.map((day) => {
            const selectedId = assignments[day] || "";
            const selectedSchedule = schedules?.find(
              (s) => s.id === selectedId,
            );

            return (
              <div
                key={day}
                className={`day-column ${selectedId ? "active" : ""}`}
              >
                <span className="day-label">{day.substring(0, 3)}</span>

                <select
                  className="schedule-selector"
                  value={selectedId}
                  onChange={(e) => handleSelect(day, e.target.value)}
                >
                  <option value="">None</option>
                  {schedules?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                {selectedSchedule && (
                  <div
                    className="preview-card"
                    style={
                      {
                        "--event-color": `rgb(${
                          selectedSchedule.events[0]?.r || DEFAULT_COLORS.RGB.R
                        }, ${selectedSchedule.events[0]?.g || DEFAULT_COLORS.RGB.G}, ${
                          selectedSchedule.events[0]?.b || DEFAULT_COLORS.RGB.B
                        })`,
                      } as React.CSSProperties
                    }
                  >
                    <strong>{selectedSchedule.events.length} Events</strong>
                    <div className="preview-card-title">
                      {selectedSchedule.title}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="sync-footer">
          <button
            className="btn-sync btn-sync-cancel no-brand-icon-hover"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>

          <button
            className="btn-sync btn-sync-primary no-brand-icon-hover"
            onClick={validateAndUpload}
            disabled={isUploading}
          >
            <UploadCloud size={UI.ICON_SIZES.MEDIUM} />
            {isUploading ? "Uploading..." : "Sync"}
          </button>
        </footer>
      </div>
    </div>
  );
}
