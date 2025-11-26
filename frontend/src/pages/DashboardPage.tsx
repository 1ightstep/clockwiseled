import { ThemeButton } from "@/components/ThemeButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { FiWifi } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";

const schedules = [
  {
    id: "schedule-1",
    title: "Morning Routine",
    days: "Sun · Mon · Tue · Wed · Thu · Fri · Sat",
    tasks: "Lights on, blinds open, brew coffee",
    nextTrigger: "Starts in 15 min",
  },
  {
    id: "schedule-2",
    title: "Work Focus",
    days: "Weekdays",
    tasks: "Desk lamp on, thermostat 70°F, lo-fi playlist",
    nextTrigger: "Starts in 1 hr",
  },
  {
    id: "schedule-3",
    title: "Evening Wind Down",
    days: "Sun - Fri",
    tasks: "Dim lights, diffuser on, lock doors",
    nextTrigger: "Starts in 12 hrs",
  },
];

const devices = [
  {
    id: "device-1",
    name: "Living Room Lamp",
    location: "Living Room",
    status: "Paired",
  },
  {
    id: "device-2",
    name: "Smart Thermostat",
    location: "Hallway",
    status: "Paired",
  },
  {
    id: "device-3",
    name: "Coffee Maker",
    location: "Kitchen",
    status: "Available",
  },
  {
    id: "device-4",
    name: "Bedroom Speaker",
    location: "Primary Bedroom",
    status: "Available",
  },
];

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast("Signed out successfully.", 3000, "info");
    navigate("/auth", { replace: true });
  };

  return (
    <main className="dashboard-screen">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome back, {user?.name ?? "friend"} 👋</h1>
          <p className="subtitle">
            Manage schedules, monitor device health, and trigger automations.
          </p>
        </div>
        <div className="dashboard-hero__actions">
          <ThemeButton label="Create schedule" />
          <ThemeButton
            label="Logout"
            variant="secondary"
            onClick={handleLogout}
          />
        </div>
      </header>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Schedules</h2>
            <p className="section-hint">Manage your daily automations</p>
          </div>
          <button type="button" className="ghost-link">
            View all
          </button>
        </div>
        <div className="schedule-grid">
          {schedules.map((schedule) => (
            <article key={schedule.id} className="schedule-card">
              <div>
                <p className="schedule-days">{schedule.days}</p>
                <h3>{schedule.title}</h3>
                <p className="schedule-tasks">{schedule.tasks}</p>
              </div>
              <p className="schedule-next">{schedule.nextTrigger}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Devices</h2>
            <p className="section-hint">Connect via Bluetooth</p>
          </div>
          <button type="button" className="ghost-link">
            Add device
          </button>
        </div>
        <div className="device-list">
          {devices.map((device) => (
            <article key={device.id} className="device-card">
              <div className="device-icon" aria-hidden>
                <FiWifi />
              </div>
              <div className="device-meta">
                <p className="device-name">{device.name}</p>
                <p className="device-location">{device.location}</p>
              </div>
              <span
                className={`status-chip ${
                  device.status === "Paired"
                    ? "status-chip--paired"
                    : "status-chip--available"
                }`}
              >
                {device.status}
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
