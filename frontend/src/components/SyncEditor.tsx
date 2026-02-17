import { useToast } from "@/hooks/useToast";
import { type ScheduleData } from "@/shared/types";
import { UploadCloud, X } from "lucide-react";
import { useState } from "react";
import "./SyncEditor.css";

type DeviceSyncProps = {
  schedules: ScheduleData[] | undefined;
  onSync: (assignment: Record<string, ScheduleData>) => void;
  onClose: () => void;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
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
      const dayIndex = DAY_INDEX[day];

      commands.push(`UPLOAD ${dayIndex}`);

      // Sort events by start time
      const sortedEvents = [...schedule.events].sort(
        (a, b) => a.startH * 60 + a.startM - (b.startH * 60 + b.startM),
      );

      sortedEvents.forEach((event) => {
        commands.push(
          `CONT_UPLOAD ${event.startH} ${event.startM} ${event.endH} ${event.endM} ${event.r} ${event.g} ${event.b}`,
        );
      });

      commands.push("END_UPLOAD");
    });

    return commands;
  };

  const sendCommandsToDevice = async (commands: string[]) => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (const command of commands) {
      window.serial.write(command);
      await delay(150); // Delay between commands for Arduino to process
    }
  };

  const validateAndUpload = async () => {
    const assignedDays = Object.keys(assignments).filter(
      (day) => assignments[day] !== "",
    );

    if (assignedDays.length === 0) {
      showToast("Please assign at least one schedule to a day.", 3000, "error");
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
      await sendCommandsToDevice(commands);

      onSync(finalData);
      showToast("Schedules synced to device successfully!", 3000, "success");
      onClose();
    } catch (error) {
      showToast(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        5000,
        "error",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sync-fixed-overlay">
      <div className="sync-container">
        <button className="exit-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="sync-header">
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UploadCloud size={24} color="var(--color-brand)" /> Device Sync
            </h2>
            <p style={{ fontSize: "var(--text-sm)", opacity: 0.6 }}>
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
                    style={{
                      borderLeft: `4px solid rgb(${
                        selectedSchedule.events[0]?.r || 149
                      }, ${selectedSchedule.events[0]?.g || 149}, ${
                        selectedSchedule.events[0]?.b || 216
                      })`,
                    }}
                  >
                    <strong>{selectedSchedule.events.length} Events</strong>
                    <div style={{ opacity: 0.7 }}>{selectedSchedule.title}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="sync-footer">
          <button
            className="btn-sync"
            style={{ background: "transparent", color: "var(--color-primary)" }}
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>

          <button
            className="btn-sync"
            onClick={validateAndUpload}
            disabled={isUploading}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <UploadCloud size={18} />
            {isUploading ? "Uploading..." : "Sync"}
          </button>
        </footer>
      </div>
    </div>
  );
}
