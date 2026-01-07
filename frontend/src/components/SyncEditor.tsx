import { useToast } from "@/hooks/useToast";
import { type ScheduleData } from "@/shared/types";
import { Calendar, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import "./SyncEditor.css";

type DeviceUploaderProps = {
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

export function SyncEditor({
  schedules,
  onSync,
  onClose,
}: DeviceUploaderProps) {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const handleSelect = (day: string, scheduleId: string) => {
    setAssignments((prev) => ({ ...prev, [day]: scheduleId }));
  };

  const validateAndUpload = () => {
    const assignedDays = Object.keys(assignments).filter(
      (day) => assignments[day] !== ""
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

    onSync(finalData);
    showToast("Schedules synced to device successfully!", 3000, "success");
  };

  return (
    <div className="uploader-fixed-overlay">
      <div className="uploader-container">
        <button className="exit-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="uploader-header">
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={24} /> Device Sync
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
              (s) => s.id === selectedId
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
                  <option value="">No Task</option>
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

        <footer className="upload-footer">
          <button
            className="btn-save"
            style={{ background: "transparent", color: "var(--color-primary)" }}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn-save"
            onClick={validateAndUpload}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <UploadCloud size={18} /> Sync to Device
          </button>
        </footer>
      </div>
    </div>
  );
}
