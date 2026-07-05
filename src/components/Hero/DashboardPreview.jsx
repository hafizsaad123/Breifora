import { Bell, Settings, ChevronDown, Home } from "lucide-react";
import PreviewSidebar from "./PreviewSidebar";
import StatCard from "./StatCard";
import MessagesTable from "./MessagesTable";
import "./DashboardPreview.css";

const STATS = [
  {
    title: "Outreach Sent",
    metrics: [
      { label: "Drafted", value: 42, change: "14%", direction: "up" },
      { label: "Sent", value: 68, change: "17%", direction: "up" },
    ],
  },
  {
    title: "Lead Activity",
    metrics: [
      { label: "Opened", value: 13, change: "5%", direction: "up" },
      { label: "Replied", value: 12, change: "2%", direction: "up" },
    ],
  },
  {
    title: "Conversions",
    metrics: [
      { label: "Booked", value: 7, change: "1%", direction: "up" },
      { label: "Ignored", value: 16, change: "5%", direction: "down" },
    ],
  },
];

export default function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <div className="dashboard-preview__frame">
        <div className="dashboard-preview__titlebar">
          <span className="dashboard-preview__dot dashboard-preview__dot--red" />
          <span className="dashboard-preview__dot dashboard-preview__dot--yellow" />
          <span className="dashboard-preview__dot dashboard-preview__dot--green" />
        </div>

        <div className="dashboard-preview__body">
          <PreviewSidebar />

          <div className="preview-main">
            <div className="preview-main__topbar">
              <span className="preview-main__breadcrumb">
                <Home size={13} />
                Home
              </span>
              <div className="preview-main__topbar-icons">
                <Bell size={15} />
                <Settings size={15} />
              </div>
            </div>

            <div className="preview-main__heading">
              <div>
                <h3>Welcome back, Omar</h3>
                <p>
                  Everything you need to monitor, automate, and streamline
                  your briefs.
                </p>
              </div>
              <div className="preview-main__date-filters">
                <span className="preview-main__pill">
                  Last 7 days <ChevronDown size={12} />
                </span>
                <span className="preview-main__pill">
                  7 Jun, 2025 — 13 Jun, 2025 <ChevronDown size={12} />
                </span>
              </div>
            </div>

            <div className="stat-cards">
              {STATS.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>

            <MessagesTable />
          </div>
        </div>
      </div>
    </div>
  );
}
