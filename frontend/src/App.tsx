import { useCallback, useEffect, useState } from "react";
import { api, USE_MOCK } from "./api/client";
import {
  ALL_STATUSES,
  DashboardSummary,
  Department,
  NotificationItem,
  ProposalDetail,
  ProposalListItem,
  ProposalStatus,
  STATUS_LABELS,
  User,
} from "./types/kaizen";
import { ActiveTab, Header } from "./components/Header";
import { KanbanBoard } from "./components/KanbanBoard";
import { CreateProposalModal } from "./components/CreateProposalModal";
import { ProposalModal } from "./components/ProposalModal";
import { DashboardView } from "./components/DashboardView";
import { AdminView } from "./components/AdminView";
import { LoginView } from "./components/LoginView";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>("board");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "">("");
  const [departmentFilter, setDepartmentFilter] = useState<number | "">("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const [selectedProposal, setSelectedProposal] =
    useState<ProposalDetail | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    api.me().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [deps, allUsers, items, notifs] = await Promise.all([
      api.getDepartments(),
      api.getUsers(),
      api.getProposals({
        search,
        status: statusFilter,
        departmentId: departmentFilter,
        onlyMine: activeTab === "mine",
        onlyOverdue,
      }),
      api.getNotifications(),
    ]);

    setDepartments(deps);
    setUsers(allUsers);
    setProposals(items);
    setNotifications(notifs);

    if (
      activeTab === "dashboard" &&
      (user.role === "Coordinator" ||
        user.role === "DepartmentHead" ||
        user.role === "Admin")
    ) {
      const summary = await api.getDashboardSummary();
      setDashboard(summary);
    }
  }, [user, search, statusFilter, departmentFilter, activeTab, onlyOverdue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Периодический опрос уведомлений раз в 30 секунд (вместо сложных очередей в MVP)
  useEffect(() => {
    if (!user || USE_MOCK) return;
    const timer = setInterval(async () => {
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    }, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const openProposal = async (id: number) => {
    const detail = await api.getProposalById(id);
    setSelectedProposal(detail);
  };

  if (!authChecked) {
    return <div className="container">Загрузка...</div>;
  }

  if (!user) {
    return (
      <LoginView
        onLogin={async (email, password) => {
          const loggedIn = await api.login(email, password);
          setUser(loggedIn);
        }}
      />
    );
  }

  return (
    <div>
      <Header
        user={user}
        allUsers={users}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewProposal={() => setCreateOpen(true)}
        notifications={notifications}
        onMarkRead={async (id) => {
          await api.markNotificationRead(id);
          setNotifications(await api.getNotifications());
        }}
        onMarkAllRead={async () => {
          await api.markAllNotificationsRead();
          setNotifications(await api.getNotifications());
        }}
        onOpenProposal={openProposal}
        onSwitchMockUser={(userId) => {
          const switched = api.switchMockUser(userId);
          setUser(switched);
          setSelectedProposal(null);
          if (
            activeTab === "dashboard" &&
            switched.role !== "Coordinator" &&
            switched.role !== "DepartmentHead" &&
            switched.role !== "Admin"
          ) {
            setActiveTab("board");
          }
          if (
            activeTab === "admin" &&
            switched.role !== "Admin" &&
            switched.role !== "Coordinator"
          ) {
            setActiveTab("board");
          }
        }}
        onLogout={() => {
          api.logout();
          setUser(null);
        }}
      />

      <main className="container">
        {(activeTab === "board" || activeTab === "mine") && (
          <>
            <div className="filters-bar">
              <input
                className="input"
                style={{ minWidth: 240, flex: 1 }}
                placeholder="Поиск по заголовку, проблеме или идее..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ProposalStatus | "")
                }
              >
                <option value="">Все статусы</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <select
                className="select"
                value={departmentFilter}
                onChange={(e) =>
                  setDepartmentFilter(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">Все подразделения</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyOverdue}
                  onChange={(e) => setOnlyOverdue(e.target.checked)}
                />
                Только просроченные (&gt; 5 дн.)
              </label>
            </div>

            <KanbanBoard
              proposals={proposals}
              onSelect={openProposal}
              visibleStatuses={statusFilter ? [statusFilter] : ALL_STATUSES}
            />
          </>
        )}

        {activeTab === "dashboard" && dashboard && (
          <DashboardView summary={dashboard} />
        )}

        {activeTab === "admin" && (
          <AdminView
            currentUser={user}
            users={users}
            departments={departments}
            onCreateDepartment={async (name) => {
              await api.createDepartment(name);
              await loadData();
            }}
            onCreateUser={async (payload) => {
              await api.createUser(payload);
              await loadData();
            }}
          />
        )}
      </main>

      {createOpen && (
        <CreateProposalModal
          departments={departments}
          defaultDepartmentId={user.departmentId}
          onClose={() => setCreateOpen(false)}
          onSubmit={async (payload) => {
            await api.createProposal(payload);
            await loadData();
          }}
        />
      )}

      {selectedProposal && (
        <ProposalModal
          proposal={selectedProposal}
          allUsers={users}
          onClose={() => setSelectedProposal(null)}
          onTransition={async (targetStatus, comment, assigneeId) => {
            const updated = await api.transitionProposal(
              selectedProposal.id,
              targetStatus,
              comment,
              assigneeId
            );
            setSelectedProposal(updated);
            await loadData();
          }}
          onSaveAssessment={async (effect, risk) => {
            const updated = await api.updateAssessment(
              selectedProposal.id,
              effect,
              risk
            );
            setSelectedProposal(updated);
            await loadData();
          }}
          onAddComment={async (text) => {
            await api.addComment(selectedProposal.id, text);
            const updated = await api.getProposalById(selectedProposal.id);
            setSelectedProposal(updated);
            await loadData();
          }}
        />
      )}
    </div>
  );
}
