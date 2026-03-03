import {
  DAYS,
  DEFAULT_COLORS,
  DEFAULT_EVENT,
  TOAST_DURATION,
  TOAST_TYPE,
  UI,
} from "@/constants";
import { useToast } from "@/hooks/useToast";
import { type EventItem, type ScheduleData } from "@/shared/types";
import {
  type ValidationResult,
  getScheduleValidation,
} from "@/utils/getScheduleValidation";
import { X } from "lucide-react";
import { useState } from "react";
import "./ScheduleEditor.css";

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const toTimeStr = (h: number, m: number): string =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

const parseTimeStr = (val: string) => {
  const [h, m] = val.split(":").map(Number);
  return { h, m };
};

type ScheduleEditorProps = {
  initialData?: ScheduleData;
  onSave: (data: ScheduleData, isEditMode: boolean) => void;
  onClose?: () => void;
};

export function ScheduleEditor({
  initialData,
  onSave,
  onClose,
}: ScheduleEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [day, setDay] = useState(initialData?.day || DAYS[0]);
  const [events, setEvents] = useState<EventItem[]>(
    [...(initialData?.events || [])].sort(
      (a, b) => a.startH * 60 + a.startM - (b.startH * 60 + b.startM),
    ),
  );
  const { showToast } = useToast();

  const isEditMode = !!initialData;

  const addEvent = () => {
    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      startH: DEFAULT_EVENT.START_HOUR,
      startM: DEFAULT_EVENT.START_MINUTE,
      endH: DEFAULT_EVENT.END_HOUR,
      endM: DEFAULT_EVENT.END_MINUTE,
      r: DEFAULT_COLORS.RGB.R,
      g: DEFAULT_COLORS.RGB.G,
      b: DEFAULT_COLORS.RGB.B,
    };
    setEvents([...events, newEvent]);
  };

  const removeEvent = (id: string | number) => {
    setEvents(events.filter((ev) => ev.id !== id));
  };

  const handleSave = () => {
    const scheduleData: ScheduleData = {
      id: isEditMode && initialData ? initialData.id : crypto.randomUUID(),
      title,
      description,
      day,
      events,
    };
    const isValidData: ValidationResult = getScheduleValidation(scheduleData);

    if (!isValidData.valid && isValidData.reason) {
      showToast(isValidData.reason, TOAST_DURATION.NORMAL, TOAST_TYPE.ERROR);
      return;
    }

    onSave(scheduleData, isEditMode);
  };

  return (
    <div className="editor-fixed-overlay">
      <div className="schedule-container">
        <button className="exit-btn" onClick={onClose}>
          <X size={UI.ICON_SIZES.LARGE} />
        </button>
        <aside className="editor-sidebar">
          <div className="sidebar-header">
            <h3>{isEditMode ? "Edit Schedule" : "New Schedule"}</h3>
          </div>

          <div className="input-group">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Routine"
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this for?"
            />
          </div>

          <div className="input-group">
            <label>Day of Week</label>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-add" onClick={addEvent}>
            + Add Event
          </button>

          <div className="sidebar-footer">
            <button className="btn-save" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </aside>

        <main className="events-main">
          <header className="events-header">
            <div>
              <h1>{title || "Untitled Schedule"}</h1>
              <p>{description || "No description provided."}</p>
            </div>
            <span className="badge">{day}</span>
          </header>

          <div className="events-list">
            {events.length === 0 && (
              <div className="empty-state">No events added yet.</div>
            )}
            {events.map((ev) => (
              <div
                key={ev.id}
                className="event-card"
                style={
                  {
                    "--event-color": `rgb(${ev.r}, ${ev.g}, ${ev.b})`,
                  } as React.CSSProperties
                }
              >
                <div className="time-row">
                  <div className="time-block">
                    <label>Start</label>
                    <input
                      type="time"
                      className="time-input"
                      value={toTimeStr(ev.startH, ev.startM)}
                      onChange={(e) => {
                        const { h, m } = parseTimeStr(e.target.value);
                        setEvents(
                          events.map((item) =>
                            item.id === ev.id
                              ? { ...item, startH: h, startM: m }
                              : item,
                          ),
                        );
                      }}
                    />
                  </div>
                  <div className="time-block">
                    <label>End</label>
                    <input
                      type="time"
                      className="time-input"
                      value={toTimeStr(ev.endH, ev.endM)}
                      onChange={(e) => {
                        const { h, m } = parseTimeStr(e.target.value);
                        setEvents(
                          events.map((item) =>
                            item.id === ev.id
                              ? { ...item, endH: h, endM: m }
                              : item,
                          ),
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="color-row">
                  <label>Color</label>
                  <input
                    type="color"
                    className="color-picker"
                    value={rgbToHex(ev.r, ev.g, ev.b)}
                    onChange={(e) => {
                      const { r, g, b } = hexToRgb(e.target.value);
                      setEvents(
                        events.map((item) =>
                          item.id === ev.id ? { ...item, r, g, b } : item,
                        ),
                      );
                    }}
                  />

                  <button
                    className="ev-delete-btn"
                    onClick={() => removeEvent(ev.id)}
                    title="Delete Event"
                  >
                    <X />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
