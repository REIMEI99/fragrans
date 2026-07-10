import type { LogEntry } from "../game/types";

interface LogPanelProps {
  log: LogEntry[];
}

export function LogPanel({ log }: LogPanelProps) {
  return (
    <section className="panel log-panel">
      <div className="panel-header">
        <h2>回合日志</h2>
      </div>
      <div className="log-list">
        {log.map((entry) => (
          <div key={entry.id} className="log-entry">
            {entry.text}
          </div>
        ))}
      </div>
    </section>
  );
}
