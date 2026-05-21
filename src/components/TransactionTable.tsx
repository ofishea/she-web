"use client";

import { useMemo, useState } from "react";
import {
  formatCurrency,
  formatDate,
  maskAccountNumber,
} from "@/lib/format";
import type { TransparencyTransaction } from "@/lib/paystack/types";
import { TransactionDetailModal } from "./TransactionDetailModal";

interface TransactionTableProps {
  transactions: TransparencyTransaction[];
  currency?: string;
  accountLabel: string;
}

const PAGE_SIZE = 25;

export function TransactionTable({
  transactions,
  currency = "NGN",
  accountLabel,
}: TransactionTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TransparencyTransaction | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((tx) => {
      const haystack = [
        tx.reference,
        tx.senderName,
        tx.senderBank,
        tx.narration,
        tx.gatewayResponse,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [transactions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center">
        <p className="font-medium text-stone-700">No transactions yet</p>
        <p className="mt-1 text-sm text-stone-500">
          Payments to {accountLabel} will appear here once recorded by
          Paystack.
        </p>
      </div>
    );
  }

  return (
    <>
    <TransactionDetailModal
      transaction={selected}
      open={selected !== null}
      onClose={() => setSelected(null)}
    />
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-600">
          Showing {filtered.length} transaction
          {filtered.length === 1 ? "" : "s"} for{" "}
          <span className="font-medium text-stone-900">{accountLabel}</span>
          <span className="text-stone-400"> · Click a row for details</span>
        </p>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search transactions</span>
          <input
            type="search"
            placeholder="Search reference, sender, narration…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Sender
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Reference
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-stone-600 lg:table-cell">
                  Narration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {slice.map((tx) => (
                <tr
                  key={tx.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(tx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(tx);
                    }
                  }}
                  className="cursor-pointer hover:bg-emerald-50/60 focus:bg-emerald-50/60 focus:outline-none"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                    {formatDate(tx.paidAt ?? tx.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-stone-900">
                    {formatCurrency(tx.amount, tx.currency || currency)}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    <p>{tx.senderName ?? "—"}</p>
                    <p className="text-xs text-stone-500">
                      {tx.senderBank ?? "—"}
                      {tx.senderAccount
                        ? ` · ${maskAccountNumber(tx.senderAccount)}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-600">
                    {tx.reference}
                  </td>
                  <td className="hidden max-w-xs truncate px-4 py-3 text-stone-600 lg:table-cell">
                    {tx.narration ?? tx.gatewayResponse ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-stone-50"
          >
            Previous
          </button>
          <span className="text-sm text-stone-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-stone-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
    </>
  );
}
