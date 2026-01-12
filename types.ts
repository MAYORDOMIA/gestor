
export enum ProjectStatus {
  PRESUPUESTO = 'Presupuesto',
  PRODUCCION = 'En Producción',
  INSTALACION = 'Instalación',
  FINALIZADO = 'Finalizado'
}

export enum ProductionStatus {
  NO_INICIADO = 'No Iniciado',
  EN_FABRICACION = 'En Fabricación',
  PENDIENTE = 'Pendiente',
  FINALIZADA = 'Finalizada'
}

export enum RequestStatus {
  PENDIENTE = 'Pendiente',
  REVISADO = 'En Revisión',
  COTIZADO = 'Cotizado',
  CANCELADO = 'Cancelado'
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  organization_id: string | null;
  organization?: Organization;
}

export interface Subscription {
  organization_id: string;
  has_gestor: boolean;
  has_medidor: boolean;
  // Las 4 aplicaciones principales
  has_app_gestion: boolean;
  has_app_vidrio: boolean;
  has_app_aluminio: boolean;
  has_app_medidor: boolean;
  has_cotizador_aluminio?: boolean;
  has_cotizador_vidrio?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  subscription?: Subscription;
  created_at?: string;
}

export interface BudgetRequest {
  id: string;
  organization_id: string;
  client_name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  status: RequestStatus;
  created_at: string;
  files?: Array<{ name: string; type: string; url: string }>;
}

export interface Project {
  id: string;
  organization_id: string;
  title: string;
  status: ProjectStatus;
  total: number;
  client_code?: string;
  manufacturing_data?: any;
  installation_data?: any;
  payment_data?: any;
  created_at: string;
  request_id?: string;
  requestData?: BudgetRequest;
  finalBudgetUrl?: string;
}

export enum TransactionType {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO'
}

export interface Transaction {
  id: string;
  organization_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
}

export interface SupplierDebt {
  id: string;
  organization_id: string;
  supplier_name: string;
  concept: string;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  is_paid: boolean;
  created_at?: string;
}

export interface Employee {
  id: string;
  organization_id: string;
  name: string;
  dni: string;
  hourly_rate: number;
  role: string;
}

export interface AttendanceRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  break_start?: string;
  break_end?: string;
  total_hours: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  width: number;
  height: number;
  profile: string;
  glass: string;
  quantity: number;
  unitPrice: number;
}

export interface ManufacturingTask {
  id: string;
  label: string;
  isCompleted: boolean;
  notes: string;
}

export interface WorkshopLog {
  id: string;
  date: string;
  text: string;
  user: string;
}
