import {
  ARDUINO_COMMANDS,
  DEFAULT_COLORS,
  DEVICE_CONFIG,
  TOAST_DURATION,
  TOAST_TYPE,
  UI,
} from "@/constants";
import { useConn } from "@/hooks/useConn";
import { useToast } from "@/hooks/useToast";
import { formatTinkerCommand } from "@/utils/serialFormatter";
import {
  Hash,
  MoveHorizontal,
  Palette,
  Send,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./TinkerView.css";

const COMMAND_TYPES = [
  ARDUINO_COMMANDS.SET_MAX_LEDS,
  ARDUINO_COMMANDS.SET_CLOCK,
  ARDUINO_COMMANDS.ON,
  ARDUINO_COMMANDS.OFF,
  ARDUINO_COMMANDS.SET,
  ARDUINO_COMMANDS.INC,
  ARDUINO_COMMANDS.DEC,
  ARDUINO_COMMANDS.STATUS,
  ARDUINO_COMMANDS.GET_SCHEDULE,
] as const;

type CommandType = (typeof COMMAND_TYPES)[number];

interface CommandState {
  type: CommandType;
  value: string;
  side: "l" | "r";
  color: { r: number; g: number; b: number };
}

const NEEDS_VALUE_TYPES: CommandType[] = [
  ARDUINO_COMMANDS.SET,
  ARDUINO_COMMANDS.INC,
  ARDUINO_COMMANDS.DEC,
  ARDUINO_COMMANDS.SET_MAX_LEDS,
  ARDUINO_COMMANDS.GET_SCHEDULE,
];

const NEEDS_COLOR_TYPES: CommandType[] = [
  ARDUINO_COMMANDS.ON,
  ARDUINO_COMMANDS.SET,
  ARDUINO_COMMANDS.INC,
];

const NEEDS_SIDE_TYPES: CommandType[] = [
  ARDUINO_COMMANDS.INC,
  ARDUINO_COMMANDS.DEC,
];

export function TinkerView({
  port,
  onClose,
}: {
  port: string;
  onClose: () => void;
}) {
  const [cmd, setCmd] = useState<CommandState>({
    type: ARDUINO_COMMANDS.ON,
    value: "0",
    side: "l",
    color: {
      r: DEFAULT_COLORS.RGB.R,
      g: DEFAULT_COLORS.RGB.G,
      b: DEFAULT_COLORS.RGB.B,
    },
  });
  const [output, setOutput] = useState<string[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const needsValue = useMemo(
    () => NEEDS_VALUE_TYPES.includes(cmd.type),
    [cmd.type],
  );
  const needsColor = useMemo(
    () => NEEDS_COLOR_TYPES.includes(cmd.type),
    [cmd.type],
  );
  const needsSide = useMemo(
    () => NEEDS_SIDE_TYPES.includes(cmd.type),
    [cmd.type],
  );

  const formattedCommand = useMemo(() => formatTinkerCommand(cmd), [cmd]);

  const { connection, connect, listen } = useConn();

  const appendOutput = useCallback((text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length > 0) {
      setOutput((prev) => [...prev, ...lines]);
    }
  }, []);

  useEffect(() => {
    const cleanup = listen(appendOutput);
    return cleanup;
  }, [listen, appendOutput]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleClearOutput = () => setOutput([]);
  const handleExecute = (overrideCmd?: string) => {
    if (cmd.type === ARDUINO_COMMANDS.SET_MAX_LEDS) {
      const count = Number(cmd.value);
      if (
        isNaN(count) ||
        !Number.isInteger(count) ||
        count < DEVICE_CONFIG.MIN_LEDS ||
        count > DEVICE_CONFIG.MAX_LEDS
      ) {
        showToast(
          `LED count must be a whole number between ${DEVICE_CONFIG.MIN_LEDS} and ${DEVICE_CONFIG.MAX_LEDS}.`,
          TOAST_DURATION.NORMAL,
          TOAST_TYPE.ERROR,
        );
        return;
      }
    }

    const finalString = overrideCmd || formattedCommand;

    const connectAndWrite = async (port: string, data: string) => {
      try {
        if (!connection || connection !== port) {
          await connect(port);
        }
        setOutput((prev) => [...prev, `> ${data}`]);
        await window.serial.write(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setOutput((prev) => [...prev, `[ERROR] ${msg}`]);
        showToast(
          `Command failed: ${msg}`,
          TOAST_DURATION.NORMAL,
          TOAST_TYPE.ERROR,
        );
      }
    };
    connectAndWrite(port, finalString);
  };

  return (
    <div className="tinker-fixed-overlay">
      <div className="tinker-container">
        <button className="exit-btn" onClick={onClose}>
          <X size={UI.ICON_SIZES.LARGE} />
        </button>

        <div className="tinker-header">
          <div>
            <h2 className="tinker-header-title">
              <Terminal
                size={UI.ICON_SIZES.XLARGE}
                color="var(--color-brand)"
              />{" "}
              Tinker View
            </h2>
            <p className="tinker-header-subtitle">
              Direct Hardware Command Interface
            </p>
          </div>
        </div>

        <div className="tinker-layout">
          <div className="tinker-main-panel">
            <div className="tinker-grid">
              <div className="tinker-field">
                <label>
                  <Terminal size={UI.ICON_SIZES.SMALL} /> CMD
                </label>
                <select
                  className="tinker-select"
                  value={cmd.type}
                  onChange={(e) =>
                    setCmd({ ...cmd, type: e.target.value as CommandType })
                  }
                >
                  {COMMAND_TYPES.map((commandType) => (
                    <option key={commandType} value={commandType}>
                      {commandType}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`tinker-field ${!needsValue ? "is-disabled" : ""}`}
              >
                <label>
                  <Hash size={UI.ICON_SIZES.SMALL} />{" "}
                  {cmd.type === ARDUINO_COMMANDS.SET
                    ? "INDEX"
                    : cmd.type === ARDUINO_COMMANDS.SET_MAX_LEDS
                      ? "LEDS"
                      : cmd.type === ARDUINO_COMMANDS.GET_SCHEDULE
                        ? "DAY"
                        : "QTY"}
                </label>
                <input
                  type="number"
                  className="tinker-input"
                  disabled={!needsValue}
                  value={cmd.value}
                  onChange={(e) => setCmd({ ...cmd, value: e.target.value })}
                />
              </div>

              <div
                className={`tinker-field ${!needsSide ? "is-disabled" : ""}`}
              >
                <label>
                  <MoveHorizontal size={UI.ICON_SIZES.SMALL} /> SIDE
                </label>
                <div className="tinker-toggle">
                  <button
                    type="button"
                    className={cmd.side === "l" ? "active" : ""}
                    onClick={() => needsSide && setCmd({ ...cmd, side: "l" })}
                  >
                    LEFT
                  </button>
                  <button
                    type="button"
                    className={cmd.side === "r" ? "active" : ""}
                    onClick={() => needsSide && setCmd({ ...cmd, side: "r" })}
                  >
                    RIGHT
                  </button>
                </div>
              </div>

              <div
                className={`tinker-field ${!needsColor ? "is-disabled" : ""}`}
              >
                <label>
                  <Palette size={UI.ICON_SIZES.SMALL} /> RGB
                </label>
                <input
                  type="color"
                  disabled={!needsColor}
                  className="tinker-color-swatch"
                  onChange={(e) => {
                    const r = parseInt(e.target.value.slice(1, 3), 16);
                    const g = parseInt(e.target.value.slice(3, 5), 16);
                    const b = parseInt(e.target.value.slice(5, 7), 16);
                    setCmd({ ...cmd, color: { r, g, b } });
                  }}
                />
              </div>
            </div>

            <div className="tinker-terminal-wrapper">
              <span className="terminal-label">
                OUTPUT
                {output.length > 0 && (
                  <button
                    className="terminal-clear-btn"
                    onClick={handleClearOutput}
                    title="Clear output"
                  >
                    <Trash2 size={UI.ICON_SIZES.SMALL} />
                  </button>
                )}
              </span>
              <div className="tinker-terminal" ref={outputRef}>
                {output.length === 0 ? (
                  <span className="terminal-placeholder">
                    Awaiting response...
                  </span>
                ) : (
                  output.map((line, i) => (
                    <div
                      key={i}
                      className={`terminal-line ${line.startsWith(">") ? "terminal-sent" : ""}`}
                    >
                      <code>{line}</code>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="tinker-footer">
          <button
            className="btn-tinker-execute btn-tinker-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-tinker-execute btn-execute-glow"
            onClick={() => handleExecute()}
          >
            <Send size={UI.ICON_SIZES.MEDIUM} /> Execute
          </button>
        </footer>
      </div>
    </div>
  );
}
