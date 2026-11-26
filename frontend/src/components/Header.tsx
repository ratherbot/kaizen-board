import { useState } from "react";
import {
  Bell,
  BarChart3,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
} from "lucide-react";
import {
  NotificationItem,
  ROLE_LABELS,
  User,
} from "../types/kaizen";
import { USE_MOCK } from "../api/client";

export type ActiveTab = "board" | "mine" | "dashboard" | "admin";

interface HeaderProps {
  user: User;
  allUsers: User[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onNewProposal: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onOpenProposal: (id: number) => void;
  onSwitchMockUser: (userId: number) => void;
  onLogout: () => void;
}

export function Header({
  user,
  allUsers,
  activeTab,
  onTabChange,
  onNewProposal,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onOpenProposal,
  onSwitchMockUser,
  onLogout,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const canSeeDashboard =
    user.role === "Coordinator" ||
    user.role === "DepartmentHead" ||
    user.role === "Admin";
  const canSeeAdmin = user.role === "Admin" || user.role === "Coordinator";

  return (
    <header className="topbar">
      <div className="brand">
        <LayoutGrid size={22} color="#2563eb" />
        <span>Кайдзен-доска</span>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === "board" ? "active" : ""}`}
          onClick={() => onTabChange("board")}
        >
          <LayoutGrid size={16} />
          Доска предложений
        </button>
        <button
          className={`nav-btn ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => onTabChange("mine")}
        >
          <ClipboardList size={16} />
          Мои предложения
        </button>
        {canSeeDashboard && (
          <button
            className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => onTabChange("dashboard")}
          >
            <BarChart3 size={16} />
            Дашборд
          </button>
        )}
        {canSeeAdmin && (
          <button
            className={`nav-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => onTabChange("admin")}
          >
            <Settings size={16} />
            Справочники и роли
          </button>
        )}
      </nav>

      <div className="topbar-right">
        <button className="btn btn-primary" onClick={onNewProposal}>
          <Plus size={16} />
          Новое предложение
        </button>

        <div style={{ position: "relative" }}>
          <button
            className="btn"
            onClick={() => setNotifOpen((prev) => !prev)}
            title="Уведомления"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="badge"
                style={{ background: "#dc2626", color: "#fff", padding: "1px 6px" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-popover">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <strong>Уведомления</strong>
                {unreadCount > 0 && (
                  <button
                    className="btn"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                    onClick={onMarkAllRead}
                  >
                    Прочитать все
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: 13 }}>
                  Новых уведомлений нет.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) onMarkRead(n.id);
                      if (n.proposalId) {
                        onOpenProposal(n.proposalId);
                        setNotifOpen(false);
                      }
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 6,
                      cursor: "pointer",
                      background: n.isRead ? "#fff" : "#eff6ff",
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                    }}
                  >
                    <div>{n.message}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleString("ru-RU")}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {USE_MOCK ? (
          <select
            className="select"
            value={user.id}
            onChange={(e) => onSwitchMockUser(Number(e.target.value))}
            title="Демо-переключатель роли"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({ROLE_LABELS[u.role]})
              </option>
            ))}
          </select>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right", fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{user.fullName}</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>
                {ROLE_LABELS[user.role]}
              </div>
            </div>
            <button className="btn" onClick={onLogout} title="Выйти">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
