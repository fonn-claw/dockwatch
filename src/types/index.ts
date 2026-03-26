export type Role = "manager" | "crew" | "inspector";
export type WorkOrderStatus = "created" | "assigned" | "in_progress" | "completed" | "verified";
export type WorkOrderType = "preventive" | "corrective" | "inspection" | "emergency";
export type Priority = "urgent" | "high" | "normal" | "low";

export interface SessionData {
  userId: number;
  email: string;
  name: string;
  role: Role;
  isLoggedIn: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}
