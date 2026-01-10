
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

export enum TransactionType {
  INGRESO = 'Ingreso',
  EGRESO = 'Egreso'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  referenceId?: string;
}

export interface SupplierDebt {
  id: string;
  supplierName: string;
  concept: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
  isPaid: boolean;
}

export interface Employee {
  id: string;
  name: string;
  dni: string;
  hourlyRate: number;
  role: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  startTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  endTime?: string;
  totalHours: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
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

export interface WorkshopLog {
  id: string;
  date: string;
  text: string;
  user: string;
}

export interface ManufacturingTask {
  id: string;
  label: string;
  isCompleted: boolean;
  notes: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  status: ProjectStatus;
  items: BudgetItem[];
  createdAt: string;
  total: number;
  finalBudgetUrl?: string; 
  requestData?: BudgetRequest; 
  clientCode?: string;
  manufacturingData?: {
    color?: string;
    line?: string;
    details?: string;
    materialsPdfUrl?: string;
    materialsPdfName?: string;
    optimizationPdfUrl?: string;
    optimizationPdfName?: string;
    workshopLogs?: WorkshopLog[];
    productionStatus?: ProductionStatus;
    deliveryDate?: string;
    tasks?: ManufacturingTask[];
  };
  installationData?: {
    scheduledDate?: string;
    teamName?: string;
    notes?: string;
    isCompleted?: boolean;
  };
  paymentData?: {
    downPayment: number;
    isFinalPaid: boolean;
    downPaymentDate?: string;
    finalPaymentDate?: string;
    discountPercent?: number;
  };
}

export interface BudgetRequest {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  files: { name: string; type: string; url: string }[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
