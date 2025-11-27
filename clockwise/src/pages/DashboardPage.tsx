import "./DashboardPage.css";

type ScheduleItem = {
  id: string;
  title: string;
  day: string;
  description: string;
};

type DeviceItem = {
  id: string;
  name: string;
  schedules: string[];
};

const schedules: ScheduleItem[] = [
  {
    id: "wake",
    title: "Wake Up Sync",
    day: "Mon",
    description: "Lights fade up with sunrise tones to ease into the day.",
  },
  {
    id: "focus",
    title: "Deep Focus",
    day: "Tue",
    description: "Muted palette keeps the studio calm during core hours.",
  },
  {
    id: "stretch",
    title: "Midweek Stretch",
    day: "Wed",
    description: "Gentle cues remind the team to pause, move, and reset.",
  },
  {
    id: "sunset",
    title: "Sunset Wind-Down",
    day: "Thu",
    description: "Warm gradients dim devices ahead of evening routines.",
  },

  {
    id: "sunset",
    title: "Sunset Wind-Down",
    day: "Thu",
    description: "Warm gradients dim devices ahead of evening routines.",
  },

  {
    id: "sunset",
    title: "Sunset Wind-Down",
    day: "Thu",
    description: "Warm gradients dim devices ahead of evening routines.",
  },

  {
    id: "sunset",
    title: "Sunset Wind-Down",
    day: "Thu",
    description: "Warm gradients dim devices ahead of evening routines.",
  },
];

const devices: DeviceItem[] = [
  {
    id: "clock-hall",
    name: "Atrium Clock",
    schedules: ["A", "B", "C", "D", "E", "F", "G"],
  },
  {
    id: "clock-lab",
    name: "Lab Clock",
    schedules: ["A", "B", "C"],
  },
  {
    id: "clock-studio",
    name: "Studio Clock",
    schedules: ["B", "C", "D", "E"],
  },
];

export function DashboardPage() {
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
          {schedules.map((item) => (
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
          {devices.map((device) => (
            <article key={device.id} className="device-card">
              <div>
                <p className="device-label">Device</p>
                <h3>{device.name}</h3>
              </div>
              <div className="device-schedules">
                <p className="device-label">
                  Schedules: {device.schedules.join(", ")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section assign-section">
        <div className="assign-content">
          <div>
            <h2>Add schedules to devices</h2>
            <p className="subtle">
              Select a device and upload a schedule bundle to push the latest
              automation.
            </p>
          </div>
          <button type="button" className="assign-button">
            Add schedule to device
          </button>
        </div>
      </section>
    </main>
  );
}
