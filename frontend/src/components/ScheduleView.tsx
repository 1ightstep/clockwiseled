import { useConn } from "@/hooks/useConn";
import { type EventItem } from "@/shared/types";
import { parseSchedules } from "@/utils/parseSchedules";
import { Calendar, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./ScheduleView.css";

type ScheduleViewProps = {
  port: string;
  onClose: () => void;
};

type ScheduleListType = Record<number, EventItem[]>;

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
  const [activeSchedules, setActiveSchedules] = useState<ScheduleListType>({});
  const currentScheduleOutput = useRef<string>("");

  const { connection, connect, listen } = useConn();
  const handleSchedules = (raw: string) => {
    if (raw.includes("_END_")) {
      console.log("END");
      setActiveSchedules(parseSchedules(currentScheduleOutput.current));
      currentScheduleOutput.current = "";
    }
    currentScheduleOutput.current += raw;
  };

  useEffect(() => {
    const connectAndWrite = async (port: string, data: string) => {
      if (!connection || connection !== port) {
        await connect(port);
      }
      window.serial.write(data);
    };
    const cleanup = listen(handleSchedules);
    connectAndWrite(port, "GET_ALL_SCHEDULES");

    return () => {
      cleanup();
    };
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
          {DAYS.map((day: string, index) => {
            const schedule = activeSchedules[index];
            const hasEvents = schedule && schedule.length > 0;

            return (
              <div key={day} className="view-day-column">
                <span className="view-day-label">{day.substring(0, 3)}</span>

                {hasEvents ? (
                  schedule.map((event: EventItem) => (
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
