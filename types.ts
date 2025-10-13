
export enum Role {
  Admin = 'ADMIN',
  Teacher = 'TEACHER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  stationId?: string; // Only for teachers
}

export interface Station {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  fullName: string;
  stationId: string;
}

export enum PaymentStatus {
  Paid = 'PAID',
  NotPaid = 'NOT_PAID',
}

export interface Payment {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: PaymentStatus;
  recordedBy: string; // User ID
  recordedAt: string; // ISO string
}

export interface ReportData {
  studentName: string;
  stationName: string;
  date: string;
  status: string;
  amount: number;
}
