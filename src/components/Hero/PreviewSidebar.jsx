import {
  Home,
  Inbox,
  Link2,
  Users,
  Calendar,
  GitBranch,
  CheckSquare,
  TrendingUp,
  FileText,
  Plug,
  HelpCircle,
  Settings,
  Search,
  ChevronsLeft,
} from "lucide-react";
import Logo from "../Navbar/Logo";

const MAIN_ITEMS = [
  { label: "Home", icon: Home, active: true },
  { label: "Inbox", icon: Inbox, badge: 3 },
  { label: "Sequences", icon: Link2 },
  { label: "Prospects", icon: Users },
  { label: "Meetings", icon: Calendar },
  { label: "Pipeline", icon: GitBranch },
  { label: "Tasks", icon: CheckSquare },
  { label: "Insights", icon: TrendingUp },
];

const UTILITY_ITEMS = [
  { label: "Templates", icon: FileText },
  { label: "Integrations", icon: Plug },
  { label: "Support", icon: HelpCircle },
  { label: "Settings", icon: Settings },
];

function NavItem({ label, icon: Icon, active, badge }) {
  return (
    <div className={`preview-sidebar__item${active ? " is-active" : ""}`}>
      <Icon size={15} strokeWidth={2} />
      <span>{label}</span>
      {badge && <span className="preview-sidebar__badge">{badge}</span>}
    </div>
  );
}

export default function PreviewSidebar() {
  return (
    <aside className="preview-sidebar">
      <div className="preview-sidebar__top">
        <Logo size={20} />
        <ChevronsLeft size={15} color="var(--text-muted)" />
      </div>

      <div className="preview-sidebar__search">
        <Search size={13} strokeWidth={2} />
        <span>Search</span>
      </div>

      <p className="preview-sidebar__label">Main</p>
      <div className="preview-sidebar__group">
        {MAIN_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </div>

      <p className="preview-sidebar__label">Utility</p>
      <div className="preview-sidebar__group">
        {UTILITY_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </div>
    </aside>
  );
}
