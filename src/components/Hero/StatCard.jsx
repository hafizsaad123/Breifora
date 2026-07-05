import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatCard({ title, metrics }) {
  return (
    <div className="stat-card">
      <p className="stat-card__title">{title}</p>

      <div className="stat-card__metrics">
        {metrics.map((metric) => (
          <div className="stat-card__metric" key={metric.label}>
            <span className="stat-card__label">{metric.label}</span>
            <div className="stat-card__value-row">
              <span className="stat-card__value">{metric.value}</span>
              <span
                className={`stat-card__change stat-card__change--${
                  metric.direction === "down" ? "down" : "up"
                }`}
              >
                {metric.direction === "down" ? (
                  <ArrowDown size={10} strokeWidth={2.5} />
                ) : (
                  <ArrowUp size={10} strokeWidth={2.5} />
                )}
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="stat-card__footnote">vs last week</p>
    </div>
  );
}
