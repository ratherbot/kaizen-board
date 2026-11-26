import { ProposalStatus, STATUS_LABELS } from "../types/kaizen";

const STATUS_STYLES: Record<ProposalStatus, { bg: string; color: string }> = {
  Draft: { bg: "#f1f5f9", color: "#475569" },
  UnderReview: { bg: "#dbeafe", color: "#1d4ed8" },
  NeedsRevision: { bg: "#fef3c7", color: "#b45309" },
  UnderExpertise: { bg: "#ede9fe", color: "#6d28d9" },
  Accepted: { bg: "#cffafe", color: "#0e7490" },
  InProgress: { bg: "#ffedd5", color: "#c2410c" },
  Implemented: { bg: "#dcfce7", color: "#15803d" },
  Rejected: { bg: "#fee2e2", color: "#b91c1c" },
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
