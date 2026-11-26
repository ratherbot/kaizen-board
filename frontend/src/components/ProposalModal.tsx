import { useState } from "react";
import { AlertTriangle, Send, X } from "lucide-react";
import {
  AvailableTransition,
  ProposalDetail,
  ROLE_LABELS,
  STATUS_LABELS,
  User,
} from "../types/kaizen";
import { StatusBadge } from "./StatusBadge";

interface ProposalModalProps {
  proposal: ProposalDetail;
  allUsers: User[];
  onClose: () => void;
  onTransition: (
    targetStatus: AvailableTransition["targetStatus"],
    comment?: string,
    assigneeId?: number
  ) => Promise<void>;
  onSaveAssessment: (effect: string, risk: string) => Promise<void>;
  onAddComment: (text: string) => Promise<void>;
}

export function ProposalModal({
  proposal,
  allUsers,
  onClose,
  onTransition,
  onSaveAssessment,
  onAddComment,
}: ProposalModalProps) {
  const [selectedTransition, setSelectedTransition] =
    useState<AvailableTransition | null>(null);
  const [transitionComment, setTransitionComment] = useState("");
  const [assigneeId, setAssigneeId] = useState<number | "">(
    proposal.assigneeId || ""
  );

  const [effectText, setEffectText] = useState(
    proposal.expertEffectAssessment ?? ""
  );
  const [riskText, setRiskText] = useState(proposal.expertRiskAssessment ?? "");

  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const executeTransition = async (transition: AvailableTransition) => {
    if (transition.requiresComment || transition.allowsAssignee) {
      setSelectedTransition(transition);
      setError(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onTransition(transition.targetStatus);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка при смене статуса");
    } finally {
      setBusy(false);
    }
  };

  const confirmSelectedTransition = async () => {
    if (!selectedTransition) return;
    if (selectedTransition.requiresComment && !transitionComment.trim()) {
      setError("Укажите обязательную причину в комментарии.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onTransition(
        selectedTransition.targetStatus,
        transitionComment.trim() || undefined,
        assigneeId ? Number(assigneeId) : undefined
      );
      setSelectedTransition(null);
      setTransitionComment("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка при смене статуса");
    } finally {
      setBusy(false);
    }
  };

  const handleAssessmentSave = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSaveAssessment(effectText, riskText);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить оценку");
    } finally {
      setBusy(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setBusy(true);
    try {
      await onAddComment(commentText);
      setCommentText("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <StatusBadge status={proposal.status} />
              {proposal.isOverdue && (
                <span className="badge badge-overdue">
                  <AlertTriangle size={12} />
                  На рассмотрении &gt; 5 рабочих дней
                </span>
              )}
              <span style={{ fontSize: 12, color: "#64748b" }}>
                #{proposal.id}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{proposal.title}</h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
              Автор: <strong>{proposal.authorName}</strong> · Подразделение:{" "}
              <strong>{proposal.departmentName}</strong>
              {proposal.assigneeName && (
                <>
                  {" "}
                  · Исполнитель: <strong>{proposal.assigneeName}</strong>
                </>
              )}
            </div>
          </div>
          <button className="btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="section-box">
          <div style={{ marginBottom: 10 }}>
            <strong>Проблема:</strong>
            <div style={{ marginTop: 4 }}>{proposal.problem}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>Предлагаемое решение:</strong>
            <div style={{ marginTop: 4 }}>{proposal.idea}</div>
          </div>
          <div>
            <strong>Ожидаемый эффект:</strong>
            <div style={{ marginTop: 4 }}>{proposal.expectedEffect}</div>
          </div>
          {proposal.rejectionReason && (
            <div
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                background: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              <strong>Причина отклонения:</strong> {proposal.rejectionReason}
            </div>
          )}
        </div>

        {proposal.availableTransitions.length > 0 && (
          <div className="section-box">
            <strong>Действия по маршруту согласования</strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {proposal.availableTransitions.map((t) => (
                <button
                  key={t.targetStatus}
                  className={`btn ${
                    t.targetStatus === "Rejected"
                      ? "btn-danger"
                      : "btn-primary"
                  }`}
                  disabled={busy}
                  onClick={() => executeTransition(t)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {selectedTransition && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #cbd5e1",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Подтверждение: {selectedTransition.label}
                </div>

                {selectedTransition.allowsAssignee && (
                  <div className="form-group">
                    <label>Назначить исполнителя (опционально)</label>
                    <select
                      className="select"
                      style={{ width: "100%" }}
                      value={assigneeId}
                      onChange={(e) =>
                        setAssigneeId(e.target.value ? Number(e.target.value) : "")
                      }
                    >
                      <option value="">Не назначен</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>
                    Комментарий{" "}
                    {selectedTransition.requiresComment
                      ? "(обязательно)"
                      : "(опционально)"}
                  </label>
                  <textarea
                    className="textarea"
                    value={transitionComment}
                    onChange={(e) => setTransitionComment(e.target.value)}
                    placeholder="Укажите обоснование решения..."
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={confirmSelectedTransition}
                  >
                    Подтвердить переход
                  </button>
                  <button
                    className="btn"
                    onClick={() => setSelectedTransition(null)}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(proposal.canAssess ||
          proposal.expertEffectAssessment ||
          proposal.expertRiskAssessment) && (
          <div className="section-box">
            <strong>Экспертная оценка эффекта и рисков</strong>
            {proposal.canAssess ? (
              <div style={{ marginTop: 10 }}>
                <div className="form-group">
                  <label>Оценка эффекта</label>
                  <textarea
                    className="textarea"
                    value={effectText}
                    onChange={(e) => setEffectText(e.target.value)}
                    placeholder="Экономический или операционный эффект..."
                  />
                </div>
                <div className="form-group">
                  <label>Оценка рисков</label>
                  <textarea
                    className="textarea"
                    value={riskText}
                    onChange={(e) => setRiskText(e.target.value)}
                    placeholder="Технологические, финансовые риски и охрана труда..."
                  />
                </div>
                <button
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={handleAssessmentSave}
                >
                  Сохранить оценку эксперта
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                <div>
                  <strong>Эффект:</strong>{" "}
                  {proposal.expertEffectAssessment || "Не указано"}
                </div>
                <div style={{ marginTop: 4 }}>
                  <strong>Риски:</strong>{" "}
                  {proposal.expertRiskAssessment || "Не указано"}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="section-box">
          <strong>Обсуждение ({proposal.comments.length})</strong>
          <div style={{ marginTop: 10 }}>
            {proposal.comments.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                  <strong>{c.authorName}</strong> ({ROLE_LABELS[c.authorRole]}) ·{" "}
                  {new Date(c.createdAt).toLocaleString("ru-RU")}
                </div>
                <div style={{ fontSize: 14 }}>{c.text}</div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Написать комментарий..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCommentSubmit();
                }}
              />
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={handleCommentSubmit}
              >
                <Send size={15} />
                Отправить
              </button>
            </div>
          </div>
        </div>

        <div className="section-box" style={{ marginBottom: 0 }}>
          <strong>История переходов ({proposal.history.length})</strong>
          {proposal.history.length === 0 ? (
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
              Переходов пока не было.
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {proposal.history.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: "6px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>
                    {new Date(h.createdAt).toLocaleString("ru-RU")} —{" "}
                    <strong>{h.changedByName}</strong>:{" "}
                    {STATUS_LABELS[h.fromStatus]} →{" "}
                    <strong>{STATUS_LABELS[h.toStatus]}</strong>
                  </span>
                  {h.comment && (
                    <div style={{ color: "#475569", marginTop: 2 }}>
                      Комментарий: {h.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
