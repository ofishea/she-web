import { formatCurrency, formatRelativeSync } from "@/lib/format";
import type { TransparencyDashboard } from "@/lib/paystack/types";

interface StatsBarProps {
  data: TransparencyDashboard;
}

export function StatsBar({ data }: StatsBarProps) {
  const primaryBalance =
    data.balances.find((b) => b.currency === "NGN") ?? data.balances[0];

  const items = [
    ...(primaryBalance
      ? [
          {
            label: "Paystack balance",
            value: formatCurrency(
              primaryBalance.balanceKobo,
              primaryBalance.currency,
            ),
            highlight: true,
          },
        ]
      : []),
    {
      label: "Active accounts",
      value: String(data.totals.accounts),
      highlight: false,
    },
    {
      label: "Incoming payments",
      value: String(data.totals.transactions),
      highlight: false,
    },
    {
      label: "Total received",
      value: formatCurrency(data.totals.totalVolumeKobo),
      highlight: false,
    },
    {
      label: "Outgoing transfers",
      value: String(data.totals.transfers),
      highlight: false,
    },
    {
      label: "Last updated",
      value: formatRelativeSync(data.lastSyncedAt),
      highlight: false,
    },
  ];

  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border px-4 py-3 shadow-sm ${
            item.highlight
              ? "border-emerald-200 bg-emerald-50"
              : "border-stone-200 bg-white"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              item.highlight ? "text-emerald-800/70" : "text-stone-500"
            }`}
          >
            {item.label}
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${
              item.highlight ? "text-emerald-900" : "text-stone-900"
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
