import { DashboardSummary, STATUS_LABELS } from "../types/kaizen";

export function DashboardView({ summary }: { summary: DashboardSummary }) {
  const maxCount = Math.max(1, ...summary.byStatus.map((x) => x.count));

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Дашборд координатора кайдзен</h2>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div style={{ color: "#64748b", fontSize: 13 }}>Всего подано идей</div>
          <div className="kpi-value">{summary.totalProposals}</div>
        </div>
        <div className="kpi-card">
          <div style={{ color: "#64748b", fontSize: 13 }}>Внедрено</div>
          <div className="kpi-value" style={{ color: "#16a34a" }}>
            {summary.implementedCount}
          </div>
        </div>
        <div className="kpi-card">
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Конверсия во внедрение
          </div>
          <div className="kpi-value" style={{ color: "#2563eb" }}>
            {summary.conversionRatePercent}%
          </div>
        </div>
        <div className="kpi-card">
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Средний срок рассмотрения
          </div>
          <div className="kpi-value">{summary.averageReviewDays} дн.</div>
        </div>
        <div className="kpi-card">
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Просрочено (&gt; 5 раб. дн.)
          </div>
          <div
            className="kpi-value"
            style={{
              color: summary.overdueReviewCount > 0 ? "#dc2626" : "#0f172a",
            }}
          >
            {summary.overdueReviewCount}
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <h3 style={{ marginTop: 0 }}>Распределение предложений по статусам</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {summary.byStatus
            .filter((s) => s.status !== "Draft")
            .map((item) => {
              const widthPercent = Math.round((item.count / maxCount) * 100);
              return (
                <div
                  key={item.status}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr 48px",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 14,
                  }}
                >
                  <span>{STATUS_LABELS[item.status]}</span>
                  <div
                    style={{
                      background: "#e2e8f0",
                      borderRadius: 6,
                      height: 18,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPercent}%`,
                        background:
                          item.status === "Implemented"
                            ? "#16a34a"
                            : item.status === "Rejected"
                            ? "#dc2626"
                            : "#2563eb",
                        height: "100%",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <strong style={{ textAlign: "right" }}>{item.count}</strong>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
