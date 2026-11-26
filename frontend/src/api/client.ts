import axios from "axios";
import {
  DashboardSummary,
  Department,
  NotificationItem,
  ProposalComment,
  ProposalDetail,
  ProposalListItem,
  ProposalStatus,
  User,
  UserRole,
} from "../types/kaizen";
import { mockStore } from "./mockStore";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const http = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("kaizen_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  async login(email: string, password: string): Promise<User> {
    if (USE_MOCK) {
      return mockStore.login(email);
    }
    const { data } = await http.post<{ token: string; user: User }>(
      "/auth/login",
      { email, password }
    );
    localStorage.setItem("kaizen_token", data.token);
    return data.user;
  },

  async me(): Promise<User | null> {
    if (USE_MOCK) {
      return mockStore.getCurrentUser();
    }
    if (!localStorage.getItem("kaizen_token")) return null;
    try {
      const { data } = await http.get<User>("/auth/me");
      return data;
    } catch {
      localStorage.removeItem("kaizen_token");
      return null;
    }
  },

  logout() {
    localStorage.removeItem("kaizen_token");
  },

  switchMockUser(userId: number): User {
    return mockStore.switchUserById(userId);
  },

  async getDepartments(): Promise<Department[]> {
    if (USE_MOCK) return mockStore.getDepartments();
    const { data } = await http.get<Department[]>("/departments");
    return data;
  },

  async createDepartment(name: string): Promise<Department> {
    if (USE_MOCK) return mockStore.createDepartment(name);
    const { data } = await http.post<Department>("/departments", { name });
    return data;
  },

  async getUsers(): Promise<User[]> {
    if (USE_MOCK) return mockStore.getUsers();
    const { data } = await http.get<User[]>("/users");
    return data;
  },

  async createUser(payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    departmentId: number;
  }): Promise<User> {
    if (USE_MOCK) return mockStore.createUser(payload);
    const { data } = await http.post<User>("/users", payload);
    return data;
  },

  async getProposals(filters: {
    status?: ProposalStatus | "";
    departmentId?: number | "";
    search?: string;
    onlyMine?: boolean;
    onlyOverdue?: boolean;
  }): Promise<ProposalListItem[]> {
    if (USE_MOCK) return mockStore.getProposals(filters);
    const params: Record<string, string | number | boolean> = {};
    if (filters.status) params.status = filters.status;
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.search) params.search = filters.search;
    if (filters.onlyMine) params.onlyMine = true;
    if (filters.onlyOverdue) params.onlyOverdue = true;
    const { data } = await http.get<ProposalListItem[]>("/proposals", {
      params,
    });
    return data;
  },

  async getProposalById(id: number): Promise<ProposalDetail> {
    if (USE_MOCK) return mockStore.getProposalById(id);
    const { data } = await http.get<ProposalDetail>(`/proposals/${id}`);
    return data;
  },

  async createProposal(payload: {
    title: string;
    problem: string;
    idea: string;
    expectedEffect: string;
    departmentId: number;
    submitImmediately: boolean;
  }): Promise<ProposalDetail> {
    if (USE_MOCK) return mockStore.createProposal(payload);
    const { data } = await http.post<ProposalDetail>("/proposals", payload);
    return data;
  },

  async transitionProposal(
    id: number,
    targetStatus: ProposalStatus,
    comment?: string,
    assigneeId?: number
  ): Promise<ProposalDetail> {
    if (USE_MOCK) {
      return mockStore.transitionProposal(id, targetStatus, comment, assigneeId);
    }
    const { data } = await http.post<ProposalDetail>(
      `/proposals/${id}/transition`,
      { targetStatus, comment, assigneeId }
    );
    return data;
  },

  async updateAssessment(
    id: number,
    effectAssessment: string,
    riskAssessment: string
  ): Promise<ProposalDetail> {
    if (USE_MOCK) {
      return mockStore.updateAssessment(id, effectAssessment, riskAssessment);
    }
    const { data } = await http.put<ProposalDetail>(
      `/proposals/${id}/assessment`,
      { effectAssessment, riskAssessment }
    );
    return data;
  },

  async addComment(id: number, text: string): Promise<ProposalComment> {
    if (USE_MOCK) return mockStore.addComment(id, text);
    const { data } = await http.post<ProposalComment>(
      `/proposals/${id}/comments`,
      { text }
    );
    return data;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    if (USE_MOCK) return mockStore.getNotifications();
    const { data } = await http.get<NotificationItem[]>("/notifications");
    return data;
  },

  async markNotificationRead(id: number): Promise<void> {
    if (USE_MOCK) {
      mockStore.markNotificationRead(id);
      return;
    }
    await http.post(`/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    if (USE_MOCK) {
      mockStore.markAllNotificationsRead();
      return;
    }
    await http.post("/notifications/read-all");
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    if (USE_MOCK) return mockStore.getDashboardSummary();
    const { data } = await http.get<DashboardSummary>("/dashboard/summary");
    return data;
  },
};
