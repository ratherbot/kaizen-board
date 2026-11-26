import { useState } from "react";
import { X } from "lucide-react";
import { Department } from "../types/kaizen";

interface CreateProposalModalProps {
  departments: Department[];
  defaultDepartmentId: number;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    problem: string;
    idea: string;
    expectedEffect: string;
    departmentId: number;
    submitImmediately: boolean;
  }) => Promise<void>;
}

export function CreateProposalModal({
  departments,
  defaultDepartmentId,
  onClose,
  onSubmit,
}: CreateProposalModalProps) {
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [idea, setIdea] = useState("");
  const [expectedEffect, setExpectedEffect] = useState("");
  const [departmentId, setDepartmentId] = useState(
    defaultDepartmentId || departments[0]?.id || 1
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (submitImmediately: boolean) => {
    if (!title.trim() || !problem.trim() || !idea.trim() || !expectedEffect.trim()) {
      setError("Заполните все 4 обязательных поля формы.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title,
        problem,
        idea,
        expectedEffect,
        departmentId,
        submitImmediately,
      });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить предложение.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 }}>Новое кайдзен-предложение</h2>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Заполните короткую форму — подача занимает не более 2 минут
            </div>
          </div>
          <button className="btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Заголовок предложения *</label>
          <input
            className="input"
            style={{ width: "100%" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Кратко: что предлагается улучшить"
          />
        </div>

        <div className="form-group">
          <label>Подразделение *</label>
          <select
            className="select"
            style={{ width: "100%" }}
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Проблема (как сейчас) *</label>
          <textarea
            className="textarea"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Опишите, что мешает в текущей работе или вызывает потери времени"
          />
        </div>

        <div className="form-group">
          <label>Предлагаемое решение (идея) *</label>
          <textarea
            className="textarea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Что конкретно нужно сделать или изменить"
          />
        </div>

        <div className="form-group">
          <label>Ожидаемый эффект *</label>
          <textarea
            className="textarea"
            value={expectedEffect}
            onChange={(e) => setExpectedEffect(e.target.value)}
            placeholder="Экономия времени, снижение брака, повышение безопасности"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button
            className="btn"
            disabled={loading}
            onClick={() => handleSave(false)}
          >
            Сохранить черновик
          </button>
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={() => handleSave(true)}
          >
            Отправить на рассмотрение
          </button>
        </div>
      </div>
    </div>
  );
}
