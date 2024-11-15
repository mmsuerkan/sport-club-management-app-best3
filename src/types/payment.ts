export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'income' | 'expense';
export type PaymentCategory = 
  | 'membership'
  | 'training'
  | 'tournament'
  | 'equipment'
  | 'facility'
  | 'salary'
  | 'other';

export interface Payment {
  id: string;
  amount: number;
  type: PaymentType;
  category: PaymentCategory;
  status: PaymentStatus;
  description: string;
  studentId?: string;
  trainerId?: string;
  dueDate?: string;
  paidAt?: number;
  createdAt: number;
}

export interface PaymentStats {
  totalIncome: number;
  totalExpenses: number;
  pendingPayments: number;
  monthlyIncome: { [key: string]: number };
  monthlyExpenses: { [key: string]: number };
}