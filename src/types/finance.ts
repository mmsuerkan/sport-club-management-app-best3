export interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  color: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  total: number;
  count: number;
  color: string;
}

export interface Receipt {
  id: string;
  expenseId: string;
  imageUrl: string;
  uploadedAt: number;
}

export interface Budget {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  categories: {
    [key: string]: {
      allocated: number;
      spent: number;
    };
  };
  createdAt: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  createdAt: number;
}

export interface Report {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'budget' | 'comprehensive';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    categories?: string[];
    status?: string[];
  };
  createdAt: number;
  lastGenerated?: number;
}