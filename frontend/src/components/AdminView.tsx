import { useState } from "react";
import { Department, ROLE_LABELS, User, UserRole } from "../types/kaizen";

interface AdminViewProps {
  currentUser: User;
  users: User[];
  departments: Department[];
  onCreateDepartment: (name: string) => Promise<void>;
  onCreateUser: (payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    departmentId: number;
  }) => Promise<void>;
}

export function AdminView({
  currentUser,
  users,
  departments,
  onCreateDepartment,
  onCreateUser,
}: AdminViewProps) {
  const [depName, setDepName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("kaizen123");
  const [role, setRole] = useState<UserRole>("Author");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 1);

  const handleAddDepartment = async () => {
    if (!depName.trim()) return;
    await onCreateDepartment(depName);
    setDepName("");
  };

  const handleAddUser = async () => {
    if (!fullName.trim() || !email.trim()) return;
    await onCreateUser({ fullName, email, password, role, departmentId });
    setFullName("");
    setEmail("");
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="kpi-card">
        <h3 style={{ marginTop: 0 }}>Подразделения</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={depName}
            onChange={(e) => setDepName(e.target.value)}
            placeholder="Название нового подразделения"
          />
          <button className="btn btn-primary" onClick={handleAddDepartment}>
            Добавить
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {departments.map((d) => (
            <span
              key={d.id}
              className="badge"
              style={{ background: "#f1f5f9", color: "#0f172a", padding: "6px 12px" }}
            >
              {d.name}
            </span>
          ))}
        </div>
      </div>

      <div className="kpi-card">
        <h3 style={{ marginTop: 0 }}>Пользователи и роли</h3>

        {currentUser.role === "Admin" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <input
              className="input"
              placeholder="ФИО"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="input"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select
              className="select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleAddUser}>
              Создать пользователя
            </button>
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>E-mail</th>
              <th>Роль</th>
              <th>Подразделение</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{ROLE_LABELS[u.role]}</td>
                <td>{u.departmentName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
