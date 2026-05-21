"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransparencyDashboard as DashboardData } from "@/lib/paystack/types";
import { formatCurrency, sumTransactionFees } from "@/lib/format";
import { AccountSummaryCard } from "./AccountSummaryCard";
import { AccountSelector } from "./AccountSelector";
import { StatsBar } from "./StatsBar";
import { TransactionTable } from "./TransactionTable";
import { TransfersPanel } from "./TransfersPanel";
import { RefreshButton } from "./RefreshButton";
import { ViewTabs, type DashboardView } from "./ViewTabs";

export function TransparencyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<DashboardView>("payments");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transparency");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load data");
      }

      setData(json);
      setSelectedId((prev) => {
        if (prev && (prev === "other" || json.accounts.some((a: { id: string }) => a.id === prev))) {
          return prev;
        }
        return json.accounts[0]?.id ?? (json.unassignedTransactions.length ? "other" : null);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-stone-600">Loading transaction records…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <p className="font-medium text-red-900">Unable to load transactions</p>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => load()}
          className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data || (data.accounts.length === 0 && data.unassignedTransactions.length === 0)) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center">
        <p className="font-medium text-stone-800">No accounts found</p>
        <p className="mt-2 text-sm text-stone-600">
          No dedicated virtual accounts were returned from Paystack. Confirm
          your API key and that DVAs are active on your integration.
        </p>
      </div>
    );
  }

  const selectedAccount =
    selectedId && selectedId !== "other"
      ? data.accounts.find((a) => a.id === selectedId)
      : null;

  const transactions =
    selectedId === "other"
      ? data.unassignedTransactions
      : (selectedAccount?.transactions ?? []);

  const accountLabel =
    selectedId === "other"
      ? "other payment channels"
      : (selectedAccount?.accountName ?? "this account");

  const otherTotalReceived = data.unassignedTransactions.reduce(
    (s, t) => s + t.amount,
    0,
  );
  const otherTotalCharges = sumTransactionFees(data.unassignedTransactions);

  return (
    <div className="space-y-6">
      <StatsBar data={data} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <ViewTabs
          active={view}
          onChange={setView}
          transferCount={data.totals.transfers}
        />
        <RefreshButton onClick={() => load(true)} loading={refreshing} />
      </div>

      {view === "payments" ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(240px,280px)_1fr]">
          <AccountSelector
            accounts={data.accounts}
            selectedId={selectedId ?? ""}
            onSelect={setSelectedId}
            hasOther={data.unassignedTransactions.length > 0}
          />

          <section
            aria-label="Transaction history"
            className="min-w-0 space-y-4"
          >
            {selectedAccount && (
              <AccountSummaryCard account={selectedAccount} />
            )}

            {selectedId === "other" && data.unassignedTransactions.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-5 py-4 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-900">
                  Other transactions
                </h2>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-stone-500">Total received</dt>
                    <dd className="font-medium text-emerald-800">
                      {formatCurrency(otherTotalReceived)}
                    </dd>
                    <dt className="mt-2 text-stone-500">Total charges</dt>
                    <dd className="font-medium text-stone-700">
                      {formatCurrency(otherTotalCharges)}
                    </dd>
                    <p className="mt-0.5 text-xs text-stone-400">
                      Combined Paystack fees on all payments
                    </p>
                  </div>
                  <div>
                    <dt className="text-stone-500">Transactions</dt>
                    <dd className="font-medium text-stone-900">
                      {data.unassignedTransactions.length}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <TransactionTable
              transactions={transactions}
              currency={selectedAccount?.currency ?? "NGN"}
              accountLabel={accountLabel}
            />
          </section>
        </div>
      ) : (
        <TransfersPanel data={data} />
      )}
    </div>
  );
}
