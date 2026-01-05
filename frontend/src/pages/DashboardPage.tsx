import { ScheduleEditor } from "@/components/ScheduleEditor";
import { type ScheduleData } from "@/shared/types";
import { Eye, Hammer, Pen, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import "./DashboardPage.css";

type DeviceItem = {
  path: string;
  serialNumber?: string;
  manufacturer?: string;
};

export function DashboardPage() {
  const [devices, setDevices] = useState<DeviceItem[] | null>(null);
  const [schedules, setSchedules] = useState<ScheduleData[] | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | undefined>();

  const handleOnSave = (schedule: ScheduleData, isEditMode: boolean) => {
    if (isEditMode && schedules) {
      const newSchedules = schedules.map((s) => {
        if (s.id == schedule.id) return schedule;
        return s;
      });
      setSchedules(newSchedules);
      setScheduleData(undefined);
      setShowEditor(!showEditor);
      return;
    }

    setSchedules((currSchedule) => [...(currSchedule || []), schedule]);
    setShowEditor(!showEditor);
  };

  const handleOnClose = () => {
    setShowEditor(!showEditor);
  };

  const handleScheduleDelete = (id: ScheduleData["id"]) => {
    if (!schedules) return;
    const newSchedules: ScheduleData[] = schedules.filter((s) => s.id !== id);
    setSchedules(newSchedules);
  };

  const handleEditSchedule = (schedule: ScheduleData) => {
    setScheduleData(schedule);
    setShowEditor(true);
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      window.serial.getDevices().then((devices: DeviceItem[]) => {
        const formattedDevices = devices.map((device) => {
          if (device.manufacturer?.toLowerCase() === "wch.cn") {
            return { ...device, manufacturer: "Clockwise Device :)" };
          }
          return device;
        });
        console.log(formattedDevices);
        setDevices(formattedDevices);
      });
    }, 1000);

    window.serial.write("ON 255 0 0\n");
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="dashboard-screen">
      {showEditor && (
        <ScheduleEditor
          onSave={handleOnSave}
          onClose={handleOnClose}
          initialData={scheduleData}
        />
      )}
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Welcome to</p>
          <h1>Clockwise dashboard</h1>
          <p className="subtle">
            Monitor schedules and keep every device in sync.
          </p>
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
                    <Pen size="1.2rem" />
                  </button>
                  <button
                    className="del-schedule-btn"
                    onClick={() => handleScheduleDelete(item.id)}
                  >
                    <X size="1.5rem" />
                  </button>
                </div>
              </article>
            ))}
          <article
            className="add-schedule-card"
            onClick={() => setShowEditor((prevState) => !prevState)}
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
            devices.map((device, index) => (
              <article key={index} className="device-card">
                <div>
                  <p className="device-label">Device</p>
                  <h3>{device.manufacturer}</h3>
                  <p className="device-meta">SN: {device.serialNumber}</p>
                  <p className="device-meta">Port: {device.path}</p>
                </div>
                <div className="device-btn-container">
                  <button className="device-btn">
                    <Upload />
                  </button>
                  <button className="device-btn">
                    <Eye />
                  </button>
                  <button className="device-btn">
                    <Hammer />
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
