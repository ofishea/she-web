import { formatCurrency } from "@/lib/format";
import type { TransparencyDashboard } from "@/lib/paystack/types";
import { TransferTable } from "./TransferTable";

interface TransfersPanelProps {
  data: TransparencyDashboard;
}

export function TransfersPanel({ data }: TransfersPanelProps) {
  const primaryBalance = data.balances.find((b) => b.currency === "NGN");
  const successfulCount = data.transfers.filter(
    (t) => t.status === "success",
  ).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">
          Outgoing transfer history
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          All transfers sent from your Paystack balance to recipients (rent
          payouts, service charges, etc.).
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-stone-500">Total transfers</dt>
            <dd className="font-medium text-stone-900">
              {data.totals.transfers}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Successful</dt>
            <dd className="font-medium text-stone-900">{successfulCount}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Total sent (successful)</dt>
            <dd className="font-medium text-amber-800">
              {formatCurrency(
                data.totals.totalTransferredKobo,
                primaryBalance?.currency ?? "NGN",
              )}
            </dd>
          </div>
        </dl>
      </div>

      <TransferTable transfers={data.transfers} />
    </div>
  );
}
