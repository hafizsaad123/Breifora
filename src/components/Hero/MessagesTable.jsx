import { Search } from "lucide-react";

const MESSAGES = [
  {
    name: "Maya Tran",
    email: "maya@zenli.io",
    message: "Thanks for reaching out—this looks interesting.",
    date: "Jul 9, 2025",
    status: "Booked",
    org: "Zenli",
    tag: "Top priority",
  },
  {
    name: "Lucas Moreno",
    email: "lucas@syncro.io",
    message: "Let's set something up for early next week.",
    date: "Jul 11, 2025",
    status: "Replied",
    org: "Syncro",
    tag: "Meeting booked",
  },
];

export default function MessagesTable() {
  return (
    <div className="messages-panel">
      <div className="messages-panel__header">
        <div>
          <p className="messages-panel__title">Recent messages</p>
        </div>
        <div className="messages-panel__filters">
          <span className="messages-panel__search">
            <Search size={12} />
            Search messages
          </span>
          <span className="messages-panel__filter">Last 7 days</span>
          <span className="messages-panel__filter">Status: All</span>
          <span className="messages-panel__filter">Org: All</span>
          <span className="messages-panel__filter">Tags: All</span>
        </div>
      </div>

      <table className="messages-table">
        <thead>
          <tr>
            <th>Lead Name</th>
            <th>Email Address</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
            <th>Organization</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {MESSAGES.map((row) => (
            <tr key={row.email}>
              <td>
                <span className="messages-table__avatar" />
                {row.name}
              </td>
              <td className="messages-table__muted">{row.email}</td>
              <td className="messages-table__muted">{row.message}</td>
              <td className="messages-table__muted">{row.date}</td>
              <td>
                <span
                  className={`status-pill status-pill--${row.status.toLowerCase()}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="messages-table__muted">{row.org}</td>
              <td>
                <span className="tag-pill">{row.tag}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
