import { AlertTriangle, MessageSquare } from "lucide-react";
import {
  ALL_STATUSES,
  ProposalListItem,
  ProposalStatus,
  STATUS_LABELS,
} from "../types/kaizen";
import { StatusBadge } from "./StatusBadge";

interface KanbanBoardProps {
  proposals: ProposalListItem[];
  onSelect: (id: number) => void;
  visibleStatuses?: ProposalStatus[];
}

export function KanbanBoard({
  proposals,
  onSelect,
  visibleStatuses = ALL_STATUSES,
}: KanbanBoardProps) {
  return (
    <div className="kanban-grid">
      {visibleStatuses.map((status) => {
        const items = proposals.filter((p) => p.status === status);
        return (
          <div key={status} className="kanban-col">
            <div className="kanban-col-header">
              <StatusBadge status={status} />
              <span className="col-count">{items.length}</span>
            </div>

            {items.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94a3b8", padding: "8px 4px" }}>
                Нет карточек в статусе «{STATUS_LABELS[status]}»
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="proposal-card"
                  onClick={() => onSelect(item.id)}
                >
                  <h4 className="proposal-title">{item.title}</h4>
                  <div className="proposal-meta">
                    <span>Подразделение: {item.departmentName}</span>
                    <span>Автор: {item.authorName}</span>
                    {item.assigneeName && (
                      <span>Исполнитель: {item.assigneeName}</span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 10,
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <MessageSquare size={13} />
                      {item.commentsCount}
                    </span>

                    {item.isOverdue && (
                      <span className="badge badge-overdue">
                        <AlertTriangle size={12} />
                        Срок &gt; 5 дн.
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
