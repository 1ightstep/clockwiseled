import { Hash, MoveHorizontal, Palette, Send, Terminal, X } from "lucide-react";
import { useMemo, useState } from "react";
import "./TinkerView.css";

type CommandType = "ON" | "OFF" | "SET" | "INC" | "DEC";

interface CommandState {
  type: CommandType;
  value: string;
  side: "l" | "r";
  color: { r: number; g: number; b: number };
}

export function TinkerView({
  port,
  onClose,
}: {
  port: string;
  onClose: () => void;
}) {
  const [cmd, setCmd] = useState<CommandState>({
    type: "ON",
    value: "0",
    side: "l",
    color: { r: 149, g: 149, b: 216 },
  });

  const needsValue = useMemo(
    () => ["SET", "INC", "DEC"].includes(cmd.type),
    [cmd.type]
  );
  const needsColor = useMemo(
    () => ["ON", "SET", "INC"].includes(cmd.type),
    [cmd.type]
  );
  const needsSide = useMemo(
    () => ["INC", "DEC"].includes(cmd.type),
    [cmd.type]
  );

  const formatCommand = () => {
    const { type, value, side, color } = cmd;
    if (type === "OFF") return "OFF";
    if (type === "ON") return `ON ${color.r} ${color.g} ${color.b}`;
    if (type === "SET") return `SET ${value} ${color.r} ${color.g} ${color.b}`;
    if (type === "INC")
      return `INC ${value} ${side} ${color.r} ${color.g} ${color.b}`;
    if (type === "DEC") return `DEC ${value} ${side}`;
    return "";
  };

  const [isAlreadyConn, setIsAlreadyConn] = useState<boolean>(false);
  const handleExecute = (overrideCmd?: string) => {
    const finalString = overrideCmd || formatCommand();

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));
    const connectAndWrite = async (port: string, data: string) => {
      if (!isAlreadyConn) {
        window.serial.connectDevice(port);
        await sleep(1500);
      }
      setIsAlreadyConn(true);
      window.serial.write(data);
    };
    connectAndWrite(port, finalString);
  };

  return (
    <div className="tinker-fixed-overlay">
      <div className="tinker-container">
        <button className="exit-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="tinker-header">
          <div>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
              }}
            >
              <Terminal size={24} color="var(--color-brand)" /> Tinker View
            </h2>
            <p style={{ fontSize: "var(--text-xs)", opacity: 0.6 }}>
              Direct Hardware Command Interface
            </p>
          </div>
        </div>

        <div className="tinker-layout">
          <div className="tinker-main-panel">
            <div className="tinker-grid">
              <div className="tinker-field">
                <label>
                  <Terminal size={14} /> CMD
                </label>
                <select
                  className="tinker-select"
                  value={cmd.type}
                  onChange={(e) =>
                    setCmd({ ...cmd, type: e.target.value as CommandType })
                  }
                >
                  <option value="ON">ON</option>
                  <option value="OFF">OFF</option>
                  <option value="SET">SET</option>
                  <option value="INC">INC</option>
                  <option value="DEC">DEC</option>
                </select>
              </div>

              <div
                className={`tinker-field ${!needsValue ? "is-disabled" : ""}`}
              >
                <label>
                  <Hash size={14} /> {cmd.type === "SET" ? "INDEX" : "QTY"}
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
                  <MoveHorizontal size={14} /> SIDE
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
                  <Palette size={14} /> RGB
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

            <div className="tinker-terminal">
              <span className="terminal-label">BUFFER</span>
              <code>Raw Code: {formatCommand()}</code>
            </div>
          </div>
        </div>

        <footer className="tinker-footer ">
          <button
            className="btn-tinker-execute"
            onClick={onClose}
            style={{ background: "transparent", color: "var(--color-primary)" }}
          >
            Cancel
          </button>
          <button
            className="btn-tinker-execute btn-execute-glow"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() => handleExecute()}
          >
            <Send size={18} /> Execute
          </button>
        </footer>
      </div>
    </div>
  );
}
