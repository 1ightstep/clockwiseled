import { DAYS, TOAST_DURATION, TOAST_TYPE, UI } from "@/constants";
import { useConn } from "@/hooks/useConn";
import { useToast } from "@/hooks/useToast";
import { type EventItem } from "@/shared/types";
import { parseSchedules } from "@/utils/parseSchedules";
import { formatGetAllSchedulesCommand } from "@/utils/serialFormatter";
import { Calendar, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import "./ScheduleView.css";

const PARSE_DEBOUNCE_MS = 1000;

type ScheduleViewProps = {
  port: string;
  onClose: () => void;
};

type ScheduleListType = Record<number, EventItem[]>;

export function ScheduleView({ port, onClose }: ScheduleViewProps) {
  const [activeSchedules, setActiveSchedules] = useState<ScheduleListType>({});
  const currentScheduleOutput = useRef<string>("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  const triggerParse = useCallback(() => {
    const buffer = currentScheduleOutput.current;
    if (buffer.includes("_SCHEDULE_")) {
      setActiveSchedules(parseSchedules(buffer));
      currentScheduleOutput.current = "";
    }
  }, []);

  const handleSchedules = useCallback(
    (raw: string) => {
      currentScheduleOutput.current += raw + "\n";

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (raw.includes("_END_")) {
        triggerParse();
      } else {
        debounceTimer.current = setTimeout(triggerParse, PARSE_DEBOUNCE_MS);
      }
    },
    [triggerParse],
  );

  const { connection, connect, listen } = useConn();

  useEffect(() => {
    const cleanup = listen(handleSchedules);

    (async () => {
      try {
        if (!connection || connection !== port) {
          await connect(port);
        }
        await window.serial.write(formatGetAllSchedulesCommand());
      } catch (err) {
        showToast(
          "Couldn't read schedules from the clock. Please check the connection and try again.",
          TOAST_DURATION.LONG,
          TOAST_TYPE.ERROR,
        );
      }
    })();

    return () => {
      cleanup();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="view-fixed-overlay">
      <div className="view-container">
        <button className="exit-btn" onClick={onClose} title="Close View">
          <X size={UI.ICON_SIZES.LARGE} />
        </button>

        <header className="view-header">
          <h2>
            <Calendar size={UI.ICON_SIZES.XLARGE} color="var(--color-brand)" />
            Schedule Viewer
          </h2>
          <p className="view-header-subtitle">
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
                      style={
                        {
                          "--event-color": `rgb(${event.r}, ${event.g}, ${event.b})`,
                        } as React.CSSProperties
                      }
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
