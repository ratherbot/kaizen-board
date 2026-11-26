export type UserRole =
  | "Author"
  | "DepartmentHead"
  | "Expert"
  | "Coordinator"
  | "Admin";

export type ProposalStatus =
  | "Draft"
  | "UnderReview"
  | "NeedsRevision"
  | "UnderExpertise"
  | "Accepted"
  | "InProgress"
  | "Implemented"
  | "Rejected";

export const ALL_STATUSES: ProposalStatus[] = [
  "Draft",
  "UnderReview",
  "NeedsRevision",
  "UnderExpertise",
  "Accepted",
  "InProgress",
  "Implemented",
  "Rejected",
];

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  Draft: "Черновик",
  UnderReview: "На рассмотрении",
  NeedsRevision: "На доработке",
  UnderExpertise: "На экспертизе",
  Accepted: "Принято в работу",
  InProgress: "Внедряется",
  Implemented: "Внедрено",
  Rejected: "Отклонено",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  Author: "Автор (сотрудник)",
  DepartmentHead: "Руководитель подразделения",
  Expert: "Эксперт",
  Coordinator: "Координатор кайдзен",
  Admin: "Администратор",
};

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
}

export interface AvailableTransition {
  targetStatus: ProposalStatus;
  label: string;
  requiresComment: boolean;
  allowsAssignee: boolean;
}

export interface ProposalListItem {
  id: number;
  title: string;
  problem: string;
  expectedEffect: string;
  status: ProposalStatus;
  departmentId: number;
  departmentName: string;
  authorId: number;
  authorName: string;
  assigneeId?: number | null;
  assigneeName?: string | null;
  createdAt: string;
  statusChangedAt: string;
  isOverdue: boolean;
  commentsCount: number;
}

export interface ProposalHistoryItem {
  id: number;
  fromStatus: ProposalStatus;
  toStatus: ProposalStatus;
  changedById: number;
  changedByName: string;
  comment?: string | null;
  createdAt: string;
}

export interface ProposalComment {
  id: number;
  authorId: number;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface ProposalDetail {
  id: number;
  title: string;
  problem: string;
  idea: string;
  expectedEffect: string;
  status: ProposalStatus;
  departmentId: number;
  departmentName: string;
  authorId: number;
  authorName: string;
  assigneeId?: number | null;
  assigneeName?: string | null;
  expertEffectAssessment?: string | null;
  expertRiskAssessment?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string;
  isOverdue: boolean;
  canEdit: boolean;
  canAssess: boolean;
  availableTransitions: AvailableTransition[];
  history: ProposalHistoryItem[];
  comments: ProposalComment[];
}

export interface NotificationItem {
  id: number;
  proposalId?: number | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalProposals: number;
  implementedCount: number;
  inWorkCount: number;
  overdueReviewCount: number;
  conversionRatePercent: number;
  averageReviewDays: number;
  byStatus: { status: ProposalStatus; count: number }[];
}
