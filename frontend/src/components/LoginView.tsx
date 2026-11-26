import { FormEvent, useState } from "react";
import { LayoutGrid } from "lucide-react";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("author@plasma.ru");
  const [password, setPassword] = useState("kaizen123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch {
      setError("Неверный e-mail или пароль. Проверьте доступность API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="kpi-card"
        style={{ width: "100%", maxWidth: 420 }}
      >
        <div className="brand" style={{ marginBottom: 16 }}>
          <LayoutGrid size={24} color="#2563eb" />
          <span>Электронная доска кайдзен</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Корпоративный e-mail</label>
          <input
            className="input"
            style={{ width: "100%" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Пароль</label>
          <input
            type="password"
            className="input"
            style={{ width: "100%" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </button>

        <div style={{ marginTop: 16, fontSize: 12, color: "#64748b" }}>
          Тестовые учетные записи (пароль: <code>kaizen123</code>):
          <br />
          author@plasma.ru · head@plasma.ru · expert@plasma.ru ·
          coordinator@plasma.ru · admin@plasma.ru
        </div>
      </form>
    </div>
  );
}
