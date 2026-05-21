"use client";

import { formatCurrency, formatDate } from "@/lib/format";
import type { TransparencyTransaction } from "@/lib/paystack/types";
import { DetailRow, Modal } from "./Modal";

interface TransactionDetailModalProps {
  transaction: TransparencyTransaction | null;
  open: boolean;
  onClose: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    abandoned: "bg-stone-100 text-stone-700",
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

export function TransactionDetailModal({
  transaction,
  open,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Modal open={open} onClose={onClose} title="Payment details">
      <dl>
        <DetailRow
          label="Amount"
          value={
            <span className="text-emerald-800">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
          }
        />
        <DetailRow label="Status" value={<StatusBadge status={transaction.status} />} />
        <DetailRow label="Channel" value={transaction.channel} />
        <DetailRow
          label="Paid at"
          value={formatDate(transaction.paidAt ?? transaction.createdAt)}
        />
        <DetailRow
          label="Created at"
          value={formatDate(transaction.createdAt)}
        />
        <DetailRow label="Reference" value={transaction.reference} mono />
        <DetailRow label="Transaction ID" value={transaction.id} mono />
        {transaction.fees != null && (
          <DetailRow
            label="Fees"
            value={formatCurrency(transaction.fees, transaction.currency)}
          />
        )}
        <DetailRow label="Sender name" value={transaction.senderName} />
        <DetailRow label="Sender bank" value={transaction.senderBank} />
        <DetailRow
          label="Sender account"
          value={transaction.senderAccount}
          mono
        />
        <DetailRow label="Narration" value={transaction.narration} />
        <DetailRow
          label="Gateway response"
          value={transaction.gatewayResponse}
        />
      </dl>
    </Modal>
  );
}
