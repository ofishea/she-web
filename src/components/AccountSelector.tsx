import type { AccountWithTransactions } from "@/lib/paystack/types";
import { formatCurrency } from "@/lib/format";

interface AccountSelectorProps {
  accounts: AccountWithTransactions[];
  selectedId: string;
  onSelect: (id: string) => void;
  hasOther: boolean;
}

export function AccountSelector({
  accounts,
  selectedId,
  onSelect,
  hasOther,
}: AccountSelectorProps) {
  return (
    <nav aria-label="Select account" className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Accounts
      </p>
      <div
        role="tablist"
        className="flex flex-col gap-2 sm:max-h-[28rem] sm:overflow-y-auto sm:pr-1"
      >
        {accounts.map((account) => {
          const isSelected = selectedId === account.id;
          return (
            <button
              key={account.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(account.id)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-emerald-700 bg-emerald-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <p className="font-medium text-stone-900">{account.accountName}</p>
              <p className="mt-0.5 font-mono text-xs text-stone-500">
                {account.accountNumber} · {account.bankName}
              </p>
              <p className="mt-2 text-xs text-stone-600">
                {account.transactionCount} transaction
                {account.transactionCount === 1 ? "" : "s"} ·{" "}
                {formatCurrency(account.totalReceived, account.currency)}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                Charges:{" "}
                {formatCurrency(account.totalCharges, account.currency)}
              </p>
            </button>
          );
        })}
        {hasOther && (
          <button
            type="button"
            role="tab"
            aria-selected={selectedId === "other"}
            onClick={() => onSelect("other")}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              selectedId === "other"
                ? "border-amber-600 bg-amber-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <p className="font-medium text-stone-900">Other transactions</p>
            <p className="mt-0.5 text-xs text-stone-500">
              Card, USSD, and other non-DVA payments
            </p>
          </button>
        )}
      </div>
    </nav>
  );
}
