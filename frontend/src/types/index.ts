export type Role = 'ROLE_MANAGER' | 'ROLE_DISPATCHER' | 'ROLE_TECHNICIAN' | 'ROLE_CUSTOMER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export type WorkOrderStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export type NotificationType = 'ASSIGNMENT' | 'SLA_AT_RISK' | 'SLA_BREACH' | 'STATUS_CHANGE';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  customerId?: number;
  customerName?: string;
  active: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  status: CustomerStatus;
  sitesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: number;
  customerId: number;
  customerName?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  contactPerson?: string;
  contactPhone?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Part {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unitCost: number;
  stockQuantity: number;
  leadTimeDays: number;
  active: boolean;
  lowStock: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: number;
  workOrderId: number;
  fromStatus: WorkOrderStatus;
  toStatus: WorkOrderStatus;
  changedByUserId: number;
  changedByUserName: string;
  changedByUserRole?: string;
  note?: string;
  changedAt: string;
}

export interface PartUsage {
  id: number;
  workOrderId: number;
  partId: number;
  partSku: string;
  partName: string;
  partCategory: string;
  quantity: number;
  unitCostAtUsage: number;
  totalCost: number;
  recordedByUserId: number;
  recordedByUserName: string;
  createdAt: string;
}

export interface TimeLog {
  id: number;
  workOrderId: number;
  technicianId: number;
  technicianName: string;
  minutes: number;
  note?: string;
  loggedAt: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  workOrderId: number;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  caption?: string;
  uploadedByUserId: number;
  uploadedByUserName: string;
  downloadUrl: string;
  createdAt: string;
}

export interface WorkOrderSummary {
  id: number;
  workOrderCode: string;
  title: string;
  priority: Priority;
  status: WorkOrderStatus;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  siteCity: string;
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  slaDueDate: string;
  slaStatus: SlaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderDetail {
  id: number;
  workOrderCode: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  siteAddress: string;
  siteCity: string;
  siteState: string;
  sitePostalCode: string;
  siteContactPerson?: string;
  siteContactPhone?: string;
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  assignedTechnicianEmail?: string;
  assignedTechnicianPhone?: string;
  createdByUserId: number;
  createdByUserName: string;
  slaDueDate: string;
  slaStatus: SlaStatus;
  internalNotes?: string;
  cancellationReason?: string;
  completedAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  totalPartsCost: number;
  totalLabourMinutes: number;
  totalCost: number;
  statusHistory: StatusHistory[];
  partsUsed: PartUsage[];
  timeLogs: TimeLog[];
  attachments: Attachment[];
}

export interface CustomerWorkOrderDetail {
  id: number;
  workOrderCode: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  siteId: number;
  siteName: string;
  siteAddress: string;
  siteCity: string;
  siteState: string;
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  slaDueDate: string;
  slaStatus: SlaStatus;
  completedAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistory[];
  attachments: Attachment[];
}

export interface NotificationItem {
  id: number;
  recipientId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  workOrderId?: number;
  createdAt: string;
}

export interface DashboardSummary {
  totalWorkOrders: number;
  statusCounts: Record<WorkOrderStatus, number>;
  overdueCount: number;
  atRiskCount: number;
  slaCompliancePercentage: number;
  technicianWorkloads: Array<{
    technicianId: number;
    technicianName: string;
    activeJobsCount: number;
  }>;
  siteDistribution: Array<{
    siteId: number;
    siteName: string;
    customerName: string;
    workOrdersCount: number;
  }>;
  recentActivity: WorkOrderSummary[];
}

export interface ReportSummary {
  totalWorkOrders: number;
  completedWorkOrders: number;
  closedWorkOrders: number;
  slaBreachedWorkOrders: number;
  slaComplianceRate: number;
  totalPartsCost: number;
  totalLabourMinutes: number;
  topUsedParts: Array<{
    partId: number;
    sku: string;
    name: string;
    totalQuantity: number;
    totalCost: number;
  }>;
  technicianTimeStats: Array<{
    technicianId: number;
    technicianName: string;
    totalMinutes: number;
    totalHours: number;
  }>;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
