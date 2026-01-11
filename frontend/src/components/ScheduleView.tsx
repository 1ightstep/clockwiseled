import { useConn } from "@/hooks/useConn";
import { type EventItem, type ScheduleData } from "@/shared/types";
import { Calendar, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./ScheduleView.css";

type ScheduleViewProps = {
  port: string;
  onClose: () => void;
};

type ScheduleListType = Record<string, ScheduleData>;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function ScheduleView({ port, onClose }: ScheduleViewProps) {
  const [activeSchedules, setActiveSchedules] = useState<
    ScheduleListType | undefined
  >(undefined);
  const { getConnection, connect } = useConn(port);
  const handleSchedules = (raw: string) => {
    console.log(raw);
  };
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const connectAndWrite = async (port: string, data: string) => {
      if (!getConnection || getConnection !== port) {
        await connect(port);
      }
      window.serial.write(data);
    };
    window.serial.onData(handleSchedules);
    connectAndWrite(port, "GET_ALL_SCHEDULES");
  }, []);

  return (
    <div className="view-fixed-overlay">
      <div className="view-container">
        <button className="exit-btn" onClick={onClose} title="Close View">
          <X size={20} />
        </button>

        <header className="view-header">
          <h2>
            <Calendar size={24} color="var(--color-brand)" />
            Schedule Viewer
          </h2>
          <p
            style={{
              fontSize: "var(--text-xs)",
              opacity: 0.6,
              margin: "4px 0 0 0",
            }}
          >
            Overview of currently assigned device tasks
          </p>
        </header>

        <div className="view-grid">
          {DAYS.map((day: string) => {
            const schedule = activeSchedules?.[day];
            const hasEvents = schedule && schedule.events.length > 0;

            return (
              <div key={day} className="view-day-column">
                <span className="view-day-label">{day.substring(0, 3)}</span>

                {hasEvents ? (
                  schedule.events.map((event: EventItem) => (
                    <div
                      key={event.id}
                      className="view-event-card"
                      style={{
                        borderLeftColor: `rgb(${event.r}, ${event.g}, ${event.b})`,
                      }}
                    >
                      <span className="view-event-time">
                        {event.startH}:
                        {event.startM.toString().padStart(2, "0")} -{" "}
                        {event.endH}:{event.endM.toString().padStart(2, "0")}
                      </span>
                      <span style={{ opacity: 0.7 }}>{schedule.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="view-empty-tag">No Event</div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="view-footer">
          <button className="view-btn-cancel" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
