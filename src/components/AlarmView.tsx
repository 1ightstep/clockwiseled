import { DEFAULT_COLORS, TOAST_DURATION, TOAST_TYPE, UI } from "@/constants";
import { useConn } from "@/hooks/useConn";
import { useToast } from "@/hooks/useToast";
import {
  formatPauseAlarmCommand,
  formatResetAlarmCommand,
  formatSetAlarmCommand,
} from "@/utils/serialFormatter";
import {
  AlarmClock,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Timer,
  X,
} from "lucide-react";
import { useState } from "react";
import "./AlarmView.css";

export function AlarmView({
  port,
  onClose,
}: {
  port: string;
  onClose: () => void;
}) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [color, setColor] = useState<{ r: number; g: number; b: number }>({
    r: DEFAULT_COLORS.RGB.R,
    g: DEFAULT_COLORS.RGB.G,
    b: DEFAULT_COLORS.RGB.B,
  });
  const [isPaused, setIsPaused] = useState(false);
  const { showToast } = useToast();
  const { connection, connect } = useConn();

  const sendCommand = async (cmd: string) => {
    try {
      if (!connection || connection !== port) {
        await connect(port);
      }
      await window.serial.write(cmd);
    } catch {
      showToast(
        "Couldn't send the command to the clock. Please check the connection.",
        TOAST_DURATION.NORMAL,
        TOAST_TYPE.ERROR,
      );
    }
  };

  const handleSetAlarm = () => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      showToast(
        "Alarm duration must be greater than zero.",
        TOAST_DURATION.NORMAL,
        TOAST_TYPE.ERROR,
      );
      return;
    }
    setIsPaused(false);
    sendCommand(formatSetAlarmCommand(hours, minutes, seconds, color));
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
    sendCommand(formatPauseAlarmCommand());
  };

  const handleReset = () => {
    setIsPaused(false);
    sendCommand(formatResetAlarmCommand());
  };

  const colorHex =
    "#" +
    [color.r, color.g, color.b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");

  return (
    <div className="alarm-fixed-overlay">
      <div className="alarm-container">
        <button className="exit-btn" onClick={onClose}>
          <X size={UI.ICON_SIZES.LARGE} />
        </button>

        <div className="alarm-header">
          <div>
            <h2 className="alarm-header-title">
              <AlarmClock
                size={UI.ICON_SIZES.XLARGE}
                color="var(--color-brand)"
              />{" "}
              Alarm View
            </h2>
            <p className="alarm-header-subtitle">
              Set a countdown timer on the device
            </p>
          </div>
        </div>

        <div className="alarm-grid">
          <div className="alarm-field">
            <label>
              <Timer size={UI.ICON_SIZES.SMALL} /> HOURS
            </label>
            <input
              type="number"
              className="alarm-input"
              min={0}
              max={24}
              value={hours}
              onChange={(e) =>
                setHours(Math.max(0, Math.min(24, Number(e.target.value))))
              }
            />
          </div>

          <div className="alarm-field">
            <label>
              <Timer size={UI.ICON_SIZES.SMALL} /> MINUTES
            </label>
            <input
              type="number"
              className="alarm-input"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) =>
                setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))
              }
            />
          </div>

          <div className="alarm-field">
            <label>
              <Timer size={UI.ICON_SIZES.SMALL} /> SECONDS
            </label>
            <input
              type="number"
              className="alarm-input"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) =>
                setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))
              }
            />
          </div>

          <div className="alarm-field">
            <label>
              <Palette size={UI.ICON_SIZES.SMALL} /> COLOR
            </label>
            <input
              type="color"
              className="alarm-color-swatch"
              value={colorHex}
              onChange={(e) => {
                const r = parseInt(e.target.value.slice(1, 3), 16);
                const g = parseInt(e.target.value.slice(3, 5), 16);
                const b = parseInt(e.target.value.slice(5, 7), 16);
                setColor({ r, g, b });
              }}
            />
          </div>
        </div>

        <footer className="alarm-footer">
          <button
            className="btn-alarm btn-alarm-pause"
            onClick={handlePauseResume}
          >
            {isPaused ? (
              <>
                <Play size={UI.ICON_SIZES.MEDIUM} /> Resume
              </>
            ) : (
              <>
                <Pause size={UI.ICON_SIZES.MEDIUM} /> Pause
              </>
            )}
          </button>
          <div className="alarm-footer-right">
            <button className="btn-alarm btn-alarm-reset" onClick={handleReset}>
              <RotateCcw size={UI.ICON_SIZES.MEDIUM} /> Reset
            </button>
            <button
              className="btn-alarm btn-alarm-set"
              onClick={handleSetAlarm}
            >
              <AlarmClock size={UI.ICON_SIZES.MEDIUM} /> Set Alarm
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
