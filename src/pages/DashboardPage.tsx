import Logo from "@/assets/Logo.svg";
import { ScheduleEditor } from "@/components/ScheduleEditor";
import { ScheduleView } from "@/components/ScheduleView";
import { SyncEditor } from "@/components/SyncEditor";
import { TinkerView } from "@/components/TinkerView";
import {
  DEFAULT_COLORS,
  DEVICE_CONFIG,
  TOAST_DURATION,
  TOAST_TYPE,
  UI,
} from "@/constants";
import { ConnProvider } from "@/contexts/ConnContext";
import { useToast } from "@/hooks/useToast";
import { type DeviceType, type ScheduleData } from "@/shared/types";
import { formatOnCommand } from "@/utils/serialFormatter";
import { Eye, Pen, Terminal, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import "./DashboardPage.css";

export function DashboardPage() {
  const [devices, setDevices] = useState<DeviceType[] | undefined>(undefined);
  const [currDevice, setCurrDevice] = useState<DeviceType | undefined>(
    undefined,
  );
  const [schedules, setSchedules] = useState<ScheduleData[] | undefined>(
    undefined,
  );
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [showTinkerView, setShowTinkerView] = useState<boolean>(false);
  const [showSyncEditor, setShowSyncEditor] = useState<boolean>(false);
  const [showScheduleView, setShowScheduleView] = useState<boolean>(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | undefined>();
  const { showToast } = useToast();

  const handleOnScheduleSave = async (
    schedule: ScheduleData,
    isEditMode: boolean,
  ) => {
    try {
      await window.db.saveSchedule(schedule);

      if (isEditMode && schedules) {
        const newSchedules = schedules.map((s) => {
          if (s.id === schedule.id) return schedule;
          return s;
        });
        setSchedules(newSchedules);
      } else {
        setSchedules((currSchedule) => [...(currSchedule || []), schedule]);
      }

      setScheduleData(undefined);
      setShowEditor(false);
      showToast(
        isEditMode
          ? "Schedule updated successfully!"
          : "Schedule saved successfully!",
        TOAST_DURATION.NORMAL,
        TOAST_TYPE.SUCCESS,
      );
    } catch (error) {
      console.error("Failed to save schedule:", error);
      showToast(
        "Couldn't save your schedule. Please try again.",
        TOAST_DURATION.LONG,
        TOAST_TYPE.ERROR,
      );
    }
  };

  const handleScheduleDelete = async (id: ScheduleData["id"]) => {
    try {
      await window.db.deleteSchedule(id);
      if (!schedules) return;
      const newSchedules: ScheduleData[] = schedules.filter((s) => s.id !== id);
      setSchedules(newSchedules);
      showToast(
        "Schedule deleted successfully!",
        TOAST_DURATION.NORMAL,
        TOAST_TYPE.SUCCESS,
      );
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      showToast(
        "Couldn't delete the schedule. Please try again.",
        TOAST_DURATION.LONG,
        TOAST_TYPE.ERROR,
      );
    }
  };

  const handleEditSchedule = (schedule: ScheduleData) => {
    setScheduleData(schedule);
    setShowEditor(true);
  };

  const handleOnSync = (assignment: Record<string, ScheduleData>) => {
    console.log("Syncing schedules to device:", assignment);
  };

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const savedSchedules = await window.db.getAllSchedules();
        setSchedules(savedSchedules);
      } catch (error) {
        console.error("Failed to load schedules:", error);
        showToast(
          "Couldn't load your saved schedules. Please restart the app.",
          TOAST_DURATION.LONG,
          TOAST_TYPE.ERROR,
        );
      }
    };

    loadSchedules();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (showTinkerView) return;
      window.serial.getDevices().then((devices: DeviceType[]) => {
        const formattedDevices = devices.map((device) => {
          if (device.manufacturer?.toLowerCase() === "wch.cn") {
            return { ...device, manufacturer: "Clockwise Device :)" };
          }
          return device;
        });
        setDevices(formattedDevices);
      });
    }, DEVICE_CONFIG.REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [showTinkerView]);

  useEffect(() => {
    window.serial
      .write(
        formatOnCommand({
          r: DEFAULT_COLORS.RGB.R,
          g: DEFAULT_COLORS.RGB.G,
          b: DEFAULT_COLORS.RGB.B,
        }),
      )
      .catch(() => {
        // Silent on startup — no device connected is expected
      });
  }, []);

  return (
    <main className="dashboard-screen">
      <ConnProvider>
        {showEditor && (
          <ScheduleEditor
            onSave={handleOnScheduleSave}
            onClose={() => setShowEditor(false)}
            initialData={scheduleData}
          />
        )}

        {showSyncEditor && currDevice && (
          <SyncEditor
            port={currDevice.path}
            onSync={handleOnSync}
            schedules={schedules}
            onClose={() => setShowSyncEditor(false)}
          />
        )}

        {showTinkerView && currDevice && (
          <TinkerView
            port={currDevice.path}
            onClose={() => setShowTinkerView(false)}
          />
        )}

        {showScheduleView && currDevice && (
          <ScheduleView
            port={currDevice.path}
            onClose={() => setShowScheduleView(false)}
          />
        )}
      </ConnProvider>

      <header className="dashboard-header">
        <div className="header-content">
          <img src={Logo} alt="Clockwise Logo" className="header-logo" />
          <div>
            <p className="eyebrow">Welcome to</p>
            <h1>Clockwise dashboard</h1>
            <p className="subtle">
              Monitor schedules and keep every device in sync.
            </p>
          </div>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Current schedule</h2>
          <p className="subtle">Tap the + card to create a new schedule</p>
        </div>
        <div className="schedule-grid">
          {schedules &&
            schedules.map((item: ScheduleData) => (
              <article key={item.id} className="schedule-card">
                <p className="schedule-day">{item.day}</p>
                <h3>{item.title}</h3>
                <p className="schedule-description">{item.description}</p>
                <div className="schedule-btn-container">
                  <button
                    className="edit-schedule-btn"
                    onClick={() => handleEditSchedule(item)}
                  >
                    <Pen size={UI.ICON_SIZES.LARGE} />
                  </button>
                  <button
                    className="del-schedule-btn"
                    onClick={() => handleScheduleDelete(item.id)}
                  >
                    <X size={UI.ICON_SIZES.XLARGE} />
                  </button>
                </div>
              </article>
            ))}
          <article
            className="add-schedule-card"
            onClick={() => setShowEditor(true)}
          >
            +
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Connected devices</h2>
          <p className="subtle">Status reflects the last uploaded schedule.</p>
        </div>
        <div className="devices-list">
          {devices?.length ? (
            devices.map((device) => (
              <article key={device.path} className="device-card">
                <div>
                  <p className="device-label">Device</p>
                  <h3>{device.manufacturer}</h3>
                  <p className="device-meta">SN: {device.serialNumber}</p>
                  <p className="device-meta">Port: {device.path}</p>
                </div>
                <div className="device-btn-container">
                  <button
                    className="device-btn"
                    onClick={() => {
                      setCurrDevice(device);
                      setShowSyncEditor(true);
                    }}
                  >
                    <UploadCloud />
                  </button>
                  <button
                    className="device-btn"
                    onClick={() => {
                      setCurrDevice(device);
                      setShowScheduleView(true);
                    }}
                  >
                    <Eye />
                  </button>
                  <button
                    className="device-btn"
                    onClick={() => {
                      setCurrDevice(device);
                      setShowTinkerView(true);
                    }}
                  >
                    <Terminal />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div>No devices connected</div>
          )}
        </div>
      </section>
    </main>
  );
}
