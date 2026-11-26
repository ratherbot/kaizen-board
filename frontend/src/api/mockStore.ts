import {
  ALL_STATUSES,
  AvailableTransition,
  DashboardSummary,
  Department,
  NotificationItem,
  ProposalComment,
  ProposalDetail,
  ProposalHistoryItem,
  ProposalListItem,
  ProposalStatus,
  STATUS_LABELS,
  User,
  UserRole,
} from "../types/kaizen";

interface StoredProposal {
  id: number;
  title: string;
  problem: string;
  idea: string;
  expectedEffect: string;
  status: ProposalStatus;
  departmentId: number;
  authorId: number;
  assigneeId?: number | null;
  expertEffectAssessment?: string | null;
  expertRiskAssessment?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string;
  history: ProposalHistoryItem[];
  comments: ProposalComment[];
}

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86400 * 1000).toISOString();

const departments: Department[] = [
  { id: 1, name: "Производственный цех №1" },
  { id: 2, name: "Конструкторско-технологический отдел" },
  { id: 3, name: "Логистика и склад" },
  { id: 4, name: "Охрана труда и качество" },
];

const users: User[] = [
  {
    id: 1,
    fullName: "Иван Петров",
    email: "author@plasma.ru",
    role: "Author",
    departmentId: 1,
    departmentName: "Производственный цех №1",
    isActive: true,
  },
  {
    id: 2,
    fullName: "Алексей Смирнов",
    email: "head@plasma.ru",
    role: "DepartmentHead",
    departmentId: 1,
    departmentName: "Производственный цех №1",
    isActive: true,
  },
  {
    id: 3,
    fullName: "Елена Волкова",
    email: "expert@plasma.ru",
    role: "Expert",
    departmentId: 2,
    departmentName: "Конструкторско-технологический отдел",
    isActive: true,
  },
  {
    id: 4,
    fullName: "Ольга Соколова",
    email: "coordinator@plasma.ru",
    role: "Coordinator",
    departmentId: 4,
    departmentName: "Охрана труда и качество",
    isActive: true,
  },
  {
    id: 5,
    fullName: "Дмитрий Кузнецов",
    email: "admin@plasma.ru",
    role: "Admin",
    departmentId: 2,
    departmentName: "Конструкторско-технологический отдел",
    isActive: true,
  },
];

let nextProposalId = 5;
let nextHistoryId = 10;
let nextCommentId = 10;
let nextNotificationId = 10;
let nextUserId = 6;
let nextDepartmentId = 5;

const proposals: StoredProposal[] = [
  {
    id: 1,
    title: "Цветовая маркировка оснастки на участке плазменной резки",
    problem:
      "Операторы тратят 10–15 минут в смену на поиск нужных сопел и электродов в общем шкафу.",
    idea: "Внедрить теневую доску с цветовой маркировкой по диаметру сопла и закрепить ячейки за каждым станком.",
    expectedEffect:
      "Сокращение времени переналадки на 12 минут в смену, снижение числа ошибок установки оснастки.",
    status: "UnderReview",
    departmentId: 1,
    authorId: 1,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    statusChangedAt: daysAgo(8),
    history: [
      {
        id: 1,
        fromStatus: "Draft",
        toStatus: "UnderReview",
        changedById: 1,
        changedByName: "Иван Петров",
        comment: "Отправлено на рассмотрение",
        createdAt: daysAgo(8),
      },
    ],
    comments: [],
  },
  {
    id: 2,
    title: "QR-бирки для быстрого списания расходников со склада",
    problem:
      "Списание комплектующих ведется на бумажных бланках, данные попадают в учет с задержкой 2–3 дня.",
    idea: "Разместить QR-коды на стеллажах и сканировать их при выдаче со склада в цех.",
    expectedEffect:
      "Актуальные остатки в реальном времени и экономия 4 часов работы кладовщика в неделю.",
    status: "UnderExpertise",
    departmentId: 3,
    authorId: 1,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
    statusChangedAt: daysAgo(3),
    history: [
      {
        id: 2,
        fromStatus: "UnderReview",
        toStatus: "UnderExpertise",
        changedById: 2,
        changedByName: "Алексей Смирнов",
        comment: "Передано технологу на оценку эффекта",
        createdAt: daysAgo(3),
      },
    ],
    comments: [
      {
        id: 1,
        authorId: 3,
        authorName: "Елена Волкова",
        authorRole: "Expert",
        text: "Хорошая инициатива, уточню совместимость сканеров с текущим складом и оставлю оценку.",
        createdAt: daysAgo(2),
      },
    ],
  },
  {
    id: 3,
    title: "Чек-лист ежедневной проверки вентиляции перед запуском смены",
    problem:
      "Засорение фильтров выявляется только после снижения тяги во время работы.",
    idea: "Добавить короткий чек-лист из 4 пунктов с контролем перепада давления перед началом смены.",
    expectedEffect:
      "Снижение внеплановых простоев оборудования и улучшение условий труда.",
    status: "InProgress",
    departmentId: 4,
    authorId: 2,
    assigneeId: 1,
    expertEffectAssessment:
      "Высокий эффект: предотвращает простой линии стоимостью ~45 тыс. руб./смена.",
    expertRiskAssessment: "Низкий риск, дополнительных закупок не требуется.",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
    statusChangedAt: daysAgo(2),
    history: [
      {
        id: 3,
        fromStatus: "Accepted",
        toStatus: "InProgress",
        changedById: 4,
        changedByName: "Ольга Соколова",
        comment: "Назначен ответственный за внедрение",
        createdAt: daysAgo(2),
      },
    ],
    comments: [],
  },
  {
    id: 4,
    title: "Стандартизация шаблона маршрутной карты изделия",
    problem:
      "Разные технологи оформляют примечания в разных местах, сборщики пропускают важные допуски.",
    idea: "Утвердить единый шаблон маршрутной карты с выделенным блоком критических допусков.",
    expectedEffect: "Снижение брака при сборке на 15%.",
    status: "Implemented",
    departmentId: 2,
    authorId: 3,
    assigneeId: 3,
    expertEffectAssessment: "Подтверждено снижение возвратов на доработку.",
    expertRiskAssessment: "Риски отсутствуют.",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(4),
    statusChangedAt: daysAgo(4),
    history: [],
    comments: [],
  },
];

const notifications: (NotificationItem & { userId: number })[] = [
  {
    id: 1,
    userId: 1,
    proposalId: 2,
    message:
      "Ваше предложение «QR-бирки для быстрого списания расходников со склада» переведено в статус «На экспертизе».",
    isRead: false,
    createdAt: daysAgo(3),
  },
  {
    id: 2,
    userId: 4,
    proposalId: 1,
    message:
      "Напоминание: предложение «Цветовая маркировка оснастки на участке плазменной резки» на рассмотрении более 5 рабочих дней.",
    isRead: false,
    createdAt: daysAgo(1),
  },
];

let currentUser: User = users[0];

const getDepartmentName = (id: number) =>
  departments.find((d) => d.id === id)?.name ?? "—";

const getUserName = (id?: number | null) =>
  id ? users.find((u) => u.id === id)?.fullName ?? "—" : null;

const isOverdue = (p: StoredProposal) => {
  if (p.status !== "UnderReview") return false;
  const diffDays =
    (Date.now() - new Date(p.statusChangedAt).getTime()) / (86400 * 1000);
  return diffDays > 7; // ~5 рабочих дней
};

function getAvailableTransitions(
  p: StoredProposal,
  user: User
): AvailableTransition[] {
  const isCoord = user.role === "Coordinator";
  const result: AvailableTransition[] = [];

  if (p.status === "Draft" && (p.authorId === user.id || isCoord)) {
    result.push({
      targetStatus: "UnderReview",
      label: "Отправить на рассмотрение",
      requiresComment: false,
      allowsAssignee: false,
    });
  }
  if (
    p.status === "UnderReview" &&
    (user.role === "DepartmentHead" || isCoord)
  ) {
    result.push(
      {
        targetStatus: "UnderExpertise",
        label: "Направить на экспертизу",
        requiresComment: false,
        allowsAssignee: false,
      },
      {
        targetStatus: "NeedsRevision",
        label: "Вернуть на доработку",
        requiresComment: true,
        allowsAssignee: false,
      },
      {
        targetStatus: "Rejected",
        label: "Отклонить",
        requiresComment: true,
        allowsAssignee: false,
      }
    );
  }
  if (p.status === "NeedsRevision" && (p.authorId === user.id || isCoord)) {
    result.push({
      targetStatus: "UnderReview",
      label: "Повторно отправить на рассмотрение",
      requiresComment: false,
      allowsAssignee: false,
    });
  }
  if (p.status === "UnderExpertise" && (user.role === "Expert" || isCoord)) {
    result.push(
      {
        targetStatus: "Accepted",
        label: "Принять в работу",
        requiresComment: false,
        allowsAssignee: true,
      },
      {
        targetStatus: "Rejected",
        label: "Отклонить",
        requiresComment: true,
        allowsAssignee: false,
      }
    );
  }
  if (
    p.status === "Accepted" &&
    (user.role === "DepartmentHead" || isCoord)
  ) {
    result.push({
      targetStatus: "InProgress",
      label: "Передать во внедрение",
      requiresComment: false,
      allowsAssignee: true,
    });
  }
  if (
    p.status === "InProgress" &&
    (p.assigneeId === user.id || user.role === "DepartmentHead" || isCoord)
  ) {
    result.push({
      targetStatus: "Implemented",
      label: "Отметить как внедрено",
      requiresComment: false,
      allowsAssignee: false,
    });
  }

  return result;
}

export const mockStore = {
  getUsers: () => [...users],
  getDepartments: () => [...departments],
  getCurrentUser: () => currentUser,
  switchUserById: (id: number) => {
    const found = users.find((u) => u.id === id);
    if (found) currentUser = found;
    return currentUser;
  },
  login: (email: string) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!found) throw new Error("Неверный e-mail или пароль.");
    currentUser = found;
    return found;
  },

  getProposals: (filters: {
    status?: ProposalStatus | "";
    departmentId?: number | "";
    search?: string;
    onlyMine?: boolean;
    onlyOverdue?: boolean;
  }): ProposalListItem[] => {
    return proposals
      .filter((p) => {
        if (
          p.status === "Draft" &&
          p.authorId !== currentUser.id &&
          currentUser.role !== "Coordinator" &&
          currentUser.role !== "Admin"
        ) {
          return false;
        }
        if (filters.onlyMine && p.authorId !== currentUser.id) return false;
        if (filters.status && p.status !== filters.status) return false;
        if (filters.departmentId && p.departmentId !== filters.departmentId)
          return false;
        if (filters.onlyOverdue && !isOverdue(p)) return false;
        if (filters.search?.trim()) {
          const term = filters.search.trim().toLowerCase();
          if (
            !p.title.toLowerCase().includes(term) &&
            !p.problem.toLowerCase().includes(term) &&
            !p.idea.toLowerCase().includes(term)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .map((p) => ({
        id: p.id,
        title: p.title,
        problem: p.problem,
        expectedEffect: p.expectedEffect,
        status: p.status,
        departmentId: p.departmentId,
        departmentName: getDepartmentName(p.departmentId),
        authorId: p.authorId,
        authorName: getUserName(p.authorId) ?? "—",
        assigneeId: p.assigneeId,
        assigneeName: getUserName(p.assigneeId),
        createdAt: p.createdAt,
        statusChangedAt: p.statusChangedAt,
        isOverdue: isOverdue(p),
        commentsCount: p.comments.length,
      }));
  },

  getProposalById: (id: number): ProposalDetail => {
    const p = proposals.find((x) => x.id === id);
    if (!p) throw new Error("Предложение не найдено");
    return {
      id: p.id,
      title: p.title,
      problem: p.problem,
      idea: p.idea,
      expectedEffect: p.expectedEffect,
      status: p.status,
      departmentId: p.departmentId,
      departmentName: getDepartmentName(p.departmentId),
      authorId: p.authorId,
      authorName: getUserName(p.authorId) ?? "—",
      assigneeId: p.assigneeId,
      assigneeName: getUserName(p.assigneeId),
      expertEffectAssessment: p.expertEffectAssessment,
      expertRiskAssessment: p.expertRiskAssessment,
      rejectionReason: p.rejectionReason,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      statusChangedAt: p.statusChangedAt,
      isOverdue: isOverdue(p),
      canEdit:
        (p.status === "Draft" || p.status === "NeedsRevision") &&
        (p.authorId === currentUser.id || currentUser.role === "Coordinator"),
      canAssess:
        currentUser.role === "Expert" || currentUser.role === "Coordinator",
      availableTransitions: getAvailableTransitions(p, currentUser),
      history: [...p.history].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      comments: [...p.comments],
    };
  },

  createProposal: (data: {
    title: string;
    problem: string;
    idea: string;
    expectedEffect: string;
    departmentId: number;
    submitImmediately: boolean;
  }): ProposalDetail => {
    const now = new Date().toISOString();
    const status: ProposalStatus = data.submitImmediately
      ? "UnderReview"
      : "Draft";
    const created: StoredProposal = {
      id: nextProposalId++,
      title: data.title,
      problem: data.problem,
      idea: data.idea,
      expectedEffect: data.expectedEffect,
      departmentId: data.departmentId,
      authorId: currentUser.id,
      status,
      createdAt: now,
      updatedAt: now,
      statusChangedAt: now,
      history: data.submitImmediately
        ? [
            {
              id: nextHistoryId++,
              fromStatus: "Draft",
              toStatus: "UnderReview",
              changedById: currentUser.id,
              changedByName: currentUser.fullName,
              comment: "Предложение подано на рассмотрение",
              createdAt: now,
            },
          ]
        : [],
      comments: [],
    };
    proposals.unshift(created);
    return mockStore.getProposalById(created.id);
  },

  transitionProposal: (
    id: number,
    targetStatus: ProposalStatus,
    comment?: string,
    assigneeId?: number
  ): ProposalDetail => {
    const p = proposals.find((x) => x.id === id);
    if (!p) throw new Error("Предложение не найдено");

    const allowed = getAvailableTransitions(p, currentUser).find(
      (t) => t.targetStatus === targetStatus
    );
    if (!allowed) throw new Error("Переход недоступен для вашей роли");
    if (allowed.requiresComment && !comment?.trim()) {
      throw new Error("Укажите причину в комментарии");
    }

    const from = p.status;
    const now = new Date().toISOString();
    p.status = targetStatus;
    p.updatedAt = now;
    p.statusChangedAt = now;
    if (assigneeId) p.assigneeId = assigneeId;
    if (targetStatus === "Rejected") p.rejectionReason = comment?.trim();

    p.history.push({
      id: nextHistoryId++,
      fromStatus: from,
      toStatus: targetStatus,
      changedById: currentUser.id,
      changedByName: currentUser.fullName,
      comment: comment?.trim() || null,
      createdAt: now,
    });

    if (p.authorId !== currentUser.id) {
      notifications.unshift({
        id: nextNotificationId++,
        userId: p.authorId,
        proposalId: p.id,
        message: `Предложение «${p.title}» переведено в статус «${STATUS_LABELS[targetStatus]}».`,
        isRead: false,
        createdAt: now,
      });
    }

    return mockStore.getProposalById(p.id);
  },

  updateAssessment: (
    id: number,
    effectAssessment: string,
    riskAssessment: string
  ): ProposalDetail => {
    const p = proposals.find((x) => x.id === id);
    if (!p) throw new Error("Предложение не найдено");
    p.expertEffectAssessment = effectAssessment.trim();
    p.expertRiskAssessment = riskAssessment.trim();
    p.updatedAt = new Date().toISOString();
    return mockStore.getProposalById(p.id);
  },

  addComment: (id: number, text: string): ProposalComment => {
    const p = proposals.find((x) => x.id === id);
    if (!p) throw new Error("Предложение не найдено");
    const comment: ProposalComment = {
      id: nextCommentId++,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    p.comments.push(comment);
    return comment;
  },

  getNotifications: (): NotificationItem[] =>
    notifications
      .filter((n) => n.userId === currentUser.id)
      .map(({ userId: _u, ...rest }) => rest),

  markNotificationRead: (id: number) => {
    const n = notifications.find((x) => x.id === id);
    if (n) n.isRead = true;
  },

  markAllNotificationsRead: () => {
    notifications
      .filter((n) => n.userId === currentUser.id)
      .forEach((n) => (n.isRead = true));
  },

  getDashboardSummary: (): DashboardSummary => {
    const active = proposals.filter((p) => p.status !== "Draft");
    const total = active.length;
    const implemented = active.filter((p) => p.status === "Implemented").length;
    const inWork = active.filter(
      (p) => p.status === "Accepted" || p.status === "InProgress"
    ).length;
    const overdue = active.filter((p) => isOverdue(p)).length;

    return {
      totalProposals: total,
      implementedCount: implemented,
      inWorkCount: inWork,
      overdueReviewCount: overdue,
      conversionRatePercent:
        total === 0 ? 0 : Math.round((implemented / total) * 1000) / 10,
      averageReviewDays: 2.4,
      byStatus: ALL_STATUSES.map((s) => ({
        status: s,
        count: active.filter((p) => p.status === s).length,
      })),
    };
  },

  createDepartment: (name: string): Department => {
    const dep = { id: nextDepartmentId++, name: name.trim() };
    departments.push(dep);
    return dep;
  },

  createUser: (data: {
    fullName: string;
    email: string;
    role: UserRole;
    departmentId: number;
  }): User => {
    const user: User = {
      id: nextUserId++,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      departmentId: data.departmentId,
      departmentName: getDepartmentName(data.departmentId),
      isActive: true,
    };
    users.push(user);
    return user;
  },
};
