export type DocumentType = "invoice" | "receipt";
export type DocumentStatus = "未払い" | "支払い済み";

export type DocumentItem = {
  name: string;
  amount: number;
};

export type ExpenseDocument = {
  id: string;
  shareKey: string;
  type: DocumentType;
  title: string;
  requesterName: string;
  buyerName?: string;
  items: DocumentItem[];
  amount: number;
  paidAt: string;
  status?: DocumentStatus;
  transferInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  notes?: string;
  createdAt: string;
};

export type CreateExpenseDocumentInput = {
  type: DocumentType;
  requesterName: string;
  buyerName?: string;
  title?: string;
  items: DocumentItem[];
  paidAt: string;
  status: DocumentStatus;
  transferInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  notes?: string;
};
