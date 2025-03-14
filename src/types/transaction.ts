export interface Transaction {
  id: number;
  merchantOrderId: string;
  userId: string | null;
  layananId: number;
  categoryId: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherId: number | null;
  paymentStatus: string | null;
  paymentCode: string;
  paymentReference: string | null;
  paymentUrl: string | null;
  noWa: string;
  statusMessage: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  topUpStatus: string | null;
  topUpReference: string | null;
  topUpMessage: string | null;
  topUpProcessedAt: string | null;
}

export type TransactionWithUser = Transaction & {
  layanan: {
    layanan: string;
  };
  category: {
    name: string;
  };
  user: {
    name: string | null;
    username: string;
    id: string;
    whatsapp: string;
  } | null;
};

export type TransactionAll = {
  totalCount: number;
  transactions: TransactionWithUser[];
};
