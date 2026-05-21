"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatDate, maskAccountNumber } from "@/lib/format";
import type { TransparencyTransfer } from "@/lib/paystack/types";
import { TransferDetailModal } from "./TransferDetailModal";

interface TransferTableProps {
  transfers: TransparencyTransfer[];
}

const PAGE_SIZE = 25;

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
    reversed: "bg-stone-100 text-stone-700",
    otp: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? "bg-stone-100 text-stone-700"
      }`}
    >
      {status}
    </span>
  );
}

export function TransferTable({ transfers }: TransferTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TransparencyTransfer | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transfers;
    return transfers.filter((t) => {
      const haystack = [
        t.reference,
        t.transferCode,
        t.recipientName,
        t.recipientBank,
        t.recipientAccount,
        t.reason,
        t.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [transfers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (transfers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center">
        <p className="font-medium text-stone-700">No transfers yet</p>
        <p className="mt-1 text-sm text-stone-500">
          Outgoing transfers from your Paystack balance will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
    <TransferDetailModal
      transfer={selected}
      open={selected !== null}
      onClose={() => setSelected(null)}
    />
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-600">
          {filtered.length} transfer{filtered.length === 1 ? "" : "s"} from
          your Paystack balance
          <span className="text-stone-400"> · Click a row for details</span>
        </p>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search transfers</span>
          <input
            type="search"
            placeholder="Search recipient, reference, reason…"
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
                  Recipient
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Reason
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-stone-600 lg:table-cell">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {slice.map((t) => (
                <tr
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(t)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(t);
                    }
                  }}
                  className="cursor-pointer hover:bg-amber-50/60 focus:bg-amber-50/60 focus:outline-none"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                    {formatDate(t.transferredAt ?? t.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-stone-900">
                    {formatCurrency(t.amount, t.currency)}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    <p>{t.recipientName}</p>
                    <p className="text-xs text-stone-500">
                      {t.recipientBank ?? "—"}
                      {t.recipientAccount
                        ? ` · ${maskAccountNumber(t.recipientAccount)}`
                        : ""}
                    </p>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-stone-600">
                    {t.reason ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-stone-500 lg:table-cell">
                    {t.reference}
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
