import { useEffect, useState } from "react";
import "./DashboardPage.css";

type ScheduleItem = {
  id: string;
  title: string;
  day: string;
  description: string;
};

type DeviceItem = {
  path: string;
  serialNumber?: string;
  manufacturer?: string;
};

export function DashboardPage() {
  const [devices, setDevices] = useState<DeviceItem[] | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[] | null>(null);

  useEffect(() => {
    window.serial.getDevices().then((devices: DeviceItem[]) => {
      setDevices(devices);
    });

    const handleData = (data: string) => {
      console.log(data)
    }

    window.serial.onData(handleData)
    window.serial.write('ON 255 0 0\n')
    return () => { }
  }, [])

  return (
    <main className="dashboard-screen">
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
          {schedules && schedules.map((item: ScheduleItem) => (
            <article key={item.id} className="schedule-card">
              <p className="schedule-day">{item.day}</p>
              <h3>{item.title}</h3>
              <p className="schedule-description">{item.description}</p>
            </article>
          ))}
          <article className="add-schedule-card">+</article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Connected devices</h2>
          <p className="subtle">Status reflects the last uploaded schedule.</p>
        </div>
        <div className="devices-list">
          {devices ? devices.map((device, index) => (
            <article key={index} className="device-card">
              <div>
                <p className="device-label">Device</p>
                <h3>{device.manufacturer}</h3>
                <p className="device-meta">
                  SN: {device.serialNumber}
                </p>
                <p className="device-meta">
                  Port: {device.path}
                </p>
              </div>
              <div className="device-schedules">
                <p className="device-label">
                  Schedules: A B C D E
                </p>
              </div>
            </article>
          )) :
            <div>
              No devices connected
            </div>}
        </div>
      </section>
    </main>
  );
}
