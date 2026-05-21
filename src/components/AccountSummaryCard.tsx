import { formatCurrency } from "@/lib/format";
import type { AccountWithTransactions } from "@/lib/paystack/types";

interface AccountSummaryCardProps {
  account: AccountWithTransactions;
}

export function AccountSummaryCard({ account }: AccountSummaryCardProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">
        {account.accountName}
      </h2>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">Account number</dt>
          <dd className="font-mono font-medium text-stone-900">
            {account.accountNumber}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Bank</dt>
          <dd className="font-medium text-stone-900">{account.bankName}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Total received</dt>
          <dd className="font-medium text-emerald-800">
            {formatCurrency(account.totalReceived, account.currency)}
          </dd>
          <dt className="mt-2 text-stone-500">Total charges</dt>
          <dd className="font-medium text-stone-700">
            {formatCurrency(account.totalCharges, account.currency)}
          </dd>
          <p className="mt-0.5 text-xs text-stone-400">
            Combined Paystack fees on all payments
          </p>
        </div>
        <div>
          <dt className="text-stone-500">Transactions</dt>
          <dd className="font-medium text-stone-900">
            {account.transactionCount}
          </dd>
        </div>
      </dl>
    </div>
  );
}
