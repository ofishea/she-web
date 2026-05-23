import { sumTodayIncome } from "@/lib/format";
import { paystackFetch, paystackFetchAllPages } from "./client";
import type {
  AccountWithTransactions,
  PaystackBalance,
  PaystackDedicatedAccount,
  PaystackTransaction,
  PaystackTransactionMetadata,
  PaystackTransfer,
  TransparencyAccount,
  TransparencyBalance,
  TransparencyDashboard,
  TransparencyTransaction,
  TransparencyTransfer,
} from "./types";

const DVA_CHANNELS = new Set(["dedicated_nuban", "bank_transfer"]);

function toTransparencyAccount(
  account: PaystackDedicatedAccount,
): TransparencyAccount {
  return {
    id: String(account.id),
    accountNumber: account.account_number,
    accountName: account.account_name,
    bankName: account.bank.name,
    currency: account.currency,
    customerEmail: account.customer.email,
    active: account.active && account.assigned,
  };
}

function toTransparencyTransaction(
  tx: PaystackTransaction,
): TransparencyTransaction {
  const auth = tx.authorization ?? ({} as PaystackTransaction["authorization"]);

  return {
    id: String(tx.id),
    reference: tx.reference,
    amount: tx.amount,
    currency: tx.currency,
    status: tx.status,
    channel: tx.channel,
    paidAt: tx.paid_at,
    createdAt: tx.created_at,
    fees: tx.fees,
    senderName: auth.sender_name ?? null,
    senderBank: auth.sender_bank ?? auth.bank ?? null,
    senderAccount: auth.sender_bank_account_number ?? null,
    narration: auth.narration ?? tx.message,
    gatewayResponse: tx.gateway_response,
  };
}

function parseMetadata(
  metadata: PaystackTransaction["metadata"],
): PaystackTransactionMetadata | null {
  if (!metadata) return null;
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) as PaystackTransactionMetadata;
    } catch {
      return null;
    }
  }
  return metadata;
}

function getReceiverAccountNumber(
  tx: PaystackTransaction,
): string | null {
  const fromAuth = tx.authorization?.receiver_bank_account_number;
  if (fromAuth) return fromAuth.trim();

  const meta = parseMetadata(tx.metadata);
  const fromMeta = meta?.receiver_account_number;
  if (typeof fromMeta === "string" && fromMeta) return fromMeta.trim();

  return null;
}

function buildCustomerAccountMap(
  accounts: PaystackDedicatedAccount[],
): Map<number, string> {
  const map = new Map<number, string>();
  for (const account of accounts) {
    map.set(account.customer.id, account.account_number);
  }
  return map;
}

function assignTransactionToAccount(
  tx: PaystackTransaction,
  accountNumbers: Set<string>,
  customerToAccount: Map<number, string>,
): string | null {
  const receiver = getReceiverAccountNumber(tx);
  if (receiver && accountNumbers.has(receiver)) {
    return receiver;
  }

  const customerId = tx.customer?.id;
  if (customerId && customerToAccount.has(customerId)) {
    const accountNumber = customerToAccount.get(customerId)!;
    if (DVA_CHANNELS.has(tx.channel) || tx.authorization?.channel === "dedicated_nuban") {
      return accountNumber;
    }
  }

  return null;
}

function toTransparencyTransfer(transfer: PaystackTransfer): TransparencyTransfer {
  const details = transfer.recipient?.details;

  return {
    id: String(transfer.id),
    transferCode: transfer.transfer_code,
    reference: transfer.reference,
    amount: transfer.amount,
    currency: transfer.currency,
    status: transfer.status,
    reason: transfer.reason,
    recipientName: transfer.recipient?.name ?? "—",
    recipientAccount: details?.account_number ?? null,
    recipientBank: details?.bank_name ?? null,
    createdAt: transfer.createdAt,
    transferredAt: transfer.transferred_at,
  };
}

export async function fetchTransparencyDashboard(): Promise<TransparencyDashboard> {
  const maxTransactionPages = Number(
    process.env.PAYSTACK_MAX_TRANSACTION_PAGES ?? "20",
  );
  const maxTransferPages = Number(
    process.env.PAYSTACK_MAX_TRANSFER_PAGES ?? "20",
  );

  // Note: Paystack returns HTTP 500 when `active=true` is passed to this endpoint.
  // We fetch all accounts and filter client-side instead.
  const [dedicatedAccounts, transactions, transfers, balanceResult] =
    await Promise.all([
      paystackFetchAllPages<PaystackDedicatedAccount>("/dedicated_account", {
        currency: "NGN",
      }),
      paystackFetchAllPages<PaystackTransaction>(
        "/transaction",
        { status: "success" },
        maxTransactionPages,
      ),
      paystackFetchAllPages<PaystackTransfer>(
        "/transfer",
        {},
        maxTransferPages,
      ),
      paystackFetch<PaystackBalance[]>("/balance").catch(() => ({
        data: [] as PaystackBalance[],
      })),
    ]);

  const balances: TransparencyBalance[] = balanceResult.data.map((b) => ({
    currency: b.currency,
    balanceKobo: b.balance,
  }));

  const activeAccounts = dedicatedAccounts.filter(
    (a) => a.active && a.assigned && a.account_number,
  );

  const accountNumbers = new Set(
    activeAccounts.map((a) => a.account_number),
  );
  const customerToAccount = buildCustomerAccountMap(activeAccounts);

  const transactionsByAccount = new Map<string, PaystackTransaction[]>();
  const unassigned: PaystackTransaction[] = [];

  for (const account of activeAccounts) {
    transactionsByAccount.set(account.account_number, []);
  }

  for (const tx of transactions) {
    const accountNumber = assignTransactionToAccount(
      tx,
      accountNumbers,
      customerToAccount,
    );

    if (accountNumber) {
      transactionsByAccount.get(accountNumber)!.push(tx);
    } else {
      unassigned.push(tx);
    }
  }

  const accounts: AccountWithTransactions[] = activeAccounts
    .map((account) => {
      const base = toTransparencyAccount(account);
      const accountTxs = (
        transactionsByAccount.get(account.account_number) ?? []
      )
        .map(toTransparencyTransaction)
        .sort(
          (a, b) =>
            new Date(b.paidAt ?? b.createdAt).getTime() -
            new Date(a.paidAt ?? a.createdAt).getTime(),
        );

      const totalReceived = accountTxs.reduce((sum, t) => sum + t.amount, 0);
      const totalCharges = accountTxs.reduce(
        (sum, t) => sum + (t.fees ?? 0),
        0,
      );

      return {
        ...base,
        transactions: accountTxs,
        totalReceived,
        totalCharges,
        transactionCount: accountTxs.length,
      };
    })
    .sort((a, b) => b.accountName.localeCompare(a.accountName));

  const unassignedTransactions = unassigned
    .map(toTransparencyTransaction)
    .sort(
      (a, b) =>
        new Date(b.paidAt ?? b.createdAt).getTime() -
        new Date(a.paidAt ?? a.createdAt).getTime(),
    );

  const allMatched = accounts.flatMap((a) => a.transactions);
  const allIncomeTransactions = [
    ...allMatched,
    ...unassignedTransactions,
  ];
  const nextPayoutKobo = sumTodayIncome(allIncomeTransactions);

  const transparencyTransfers = transfers
    .map(toTransparencyTransfer)
    .sort(
      (a, b) =>
        new Date(b.transferredAt ?? b.createdAt).getTime() -
        new Date(a.transferredAt ?? a.createdAt).getTime(),
    );

  const successfulTransfers = transparencyTransfers.filter(
    (t) => t.status === "success",
  );

  return {
    accounts,
    unassignedTransactions,
    transfers: transparencyTransfers,
    balances,
    lastSyncedAt: new Date().toISOString(),
    totals: {
      accounts: accounts.length,
      transactions: allMatched.length + unassignedTransactions.length,
      totalVolumeKobo:
        allMatched.reduce((s, t) => s + t.amount, 0) +
        unassignedTransactions.reduce((s, t) => s + t.amount, 0),
      nextPayoutKobo,
      transfers: transparencyTransfers.length,
      totalTransferredKobo: successfulTransfers.reduce(
        (s, t) => s + t.amount,
        0,
      ),
    },
  };
}
