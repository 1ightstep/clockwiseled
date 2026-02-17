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
  const [events, setEvents] = useState<EventItem[]>(initialData?.events || []);
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

  const updateEvent = (
    id: string | number,
    field: keyof EventItem,
    value: number,
  ) => {
    setEvents(
      events.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev)),
    );
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
                    <div className="time-inputs">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={ev.startH}
                        onChange={(e) =>
                          updateEvent(ev.id, "startH", +e.target.value)
                        }
                      />
                      :
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={ev.startM}
                        onChange={(e) =>
                          updateEvent(ev.id, "startM", +e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="time-block">
                    <label>End</label>
                    <div className="time-inputs">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={ev.endH}
                        onChange={(e) =>
                          updateEvent(ev.id, "endH", +e.target.value)
                        }
                      />
                      :
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={ev.endM}
                        onChange={(e) =>
                          updateEvent(ev.id, "endM", +e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="color-row">
                  <label>Color (RGB)</label>
                  <div className="rgb-inputs">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={ev.r}
                      onChange={(e) => updateEvent(ev.id, "r", +e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={ev.g}
                      onChange={(e) => updateEvent(ev.id, "g", +e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={ev.b}
                      onChange={(e) => updateEvent(ev.id, "b", +e.target.value)}
                    />
                  </div>

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
