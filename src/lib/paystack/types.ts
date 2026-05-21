export interface PaystackMeta {
  total: number;
  skipped: number;
  perPage: number;
  page: number;
  pageCount: number;
  next?: string | null;
  previous?: string | null;
}

export interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
  meta?: PaystackMeta;
}

export interface PaystackCustomer {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  customer_code: string;
  phone: string | null;
}

export interface PaystackBank {
  name: string;
  id: number;
  slug: string;
}

export interface PaystackDedicatedAccount {
  id: number;
  account_name: string;
  account_number: string;
  created_at: string;
  updated_at: string;
  currency: string;
  active: boolean;
  assigned: boolean;
  customer: PaystackCustomer;
  bank: PaystackBank;
}

export interface PaystackAuthorization {
  authorization_code: string;
  channel: string;
  card_type?: string;
  bank?: string | null;
  brand?: string;
  reusable?: boolean;
  account_name?: string | null;
  sender_bank?: string | null;
  sender_bank_account_number?: string | null;
  sender_name?: string | null;
  receiver_bank_account_number?: string | null;
  receiver_bank?: string | null;
  narration?: string | null;
}

export interface PaystackTransactionMetadata {
  receiver_account_number?: string;
  receiver_bank?: string;
  [key: string]: unknown;
}

export interface PaystackTransaction {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string | null;
  gateway_response: string | null;
  paid_at: string | null;
  created_at: string;
  channel: string;
  currency: string;
  fees: number | null;
  metadata?: PaystackTransactionMetadata | string | null;
  customer: PaystackCustomer;
  authorization: PaystackAuthorization;
}

export interface TransparencyAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  currency: string;
  customerEmail: string;
  active: boolean;
}

export interface TransparencyTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  channel: string;
  paidAt: string | null;
  createdAt: string;
  fees: number | null;
  senderName: string | null;
  senderBank: string | null;
  senderAccount: string | null;
  narration: string | null;
  gatewayResponse: string | null;
}

export interface AccountWithTransactions extends TransparencyAccount {
  transactions: TransparencyTransaction[];
  totalReceived: number;
  totalCharges: number;
  transactionCount: number;
}

export interface PaystackBalance {
  currency: string;
  balance: number;
}

export interface PaystackTransferRecipient {
  name: string;
  recipient_code: string;
  details?: {
    account_number?: string;
    account_name?: string | null;
    bank_name?: string;
    bank_code?: string;
  };
}

export interface PaystackTransfer {
  id: number;
  amount: number;
  currency: string;
  reason: string | null;
  reference: string;
  status: string;
  transfer_code: string;
  createdAt: string;
  updatedAt: string;
  transferred_at: string | null;
  recipient: PaystackTransferRecipient;
}

export interface TransparencyBalance {
  currency: string;
  balanceKobo: number;
}

export interface TransparencyTransfer {
  id: string;
  transferCode: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  reason: string | null;
  recipientName: string;
  recipientAccount: string | null;
  recipientBank: string | null;
  createdAt: string;
  transferredAt: string | null;
}

export interface TransparencyDashboard {
  accounts: AccountWithTransactions[];
  unassignedTransactions: TransparencyTransaction[];
  transfers: TransparencyTransfer[];
  balances: TransparencyBalance[];
  lastSyncedAt: string;
  totals: {
    accounts: number;
    transactions: number;
    totalVolumeKobo: number;
    transfers: number;
    totalTransferredKobo: number;
  };
}
