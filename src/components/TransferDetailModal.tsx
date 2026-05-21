"use client";

import { formatCurrency, formatDate } from "@/lib/format";
import type { TransparencyTransfer } from "@/lib/paystack/types";
import { DetailRow, Modal } from "./Modal";

interface TransferDetailModalProps {
  transfer: TransparencyTransfer | null;
  open: boolean;
  onClose: () => void;
}

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

export function TransferDetailModal({
  transfer,
  open,
  onClose,
}: TransferDetailModalProps) {
  if (!transfer) return null;

  return (
    <Modal open={open} onClose={onClose} title="Transfer details">
      <dl>
        <DetailRow
          label="Amount"
          value={
            <span className="text-amber-800">
              {formatCurrency(transfer.amount, transfer.currency)}
            </span>
          }
        />
        <DetailRow label="Status" value={<StatusBadge status={transfer.status} />} />
        <DetailRow
          label="Transferred at"
          value={formatDate(transfer.transferredAt ?? transfer.createdAt)}
        />
        <DetailRow
          label="Created at"
          value={formatDate(transfer.createdAt)}
        />
        <DetailRow label="Recipient" value={transfer.recipientName} />
        <DetailRow label="Recipient bank" value={transfer.recipientBank} />
        <DetailRow
          label="Recipient account"
          value={transfer.recipientAccount}
          mono
        />
        <DetailRow label="Reason" value={transfer.reason} />
        <DetailRow label="Reference" value={transfer.reference} mono />
        <DetailRow label="Transfer code" value={transfer.transferCode} mono />
        <DetailRow label="Transfer ID" value={transfer.id} mono />
      </dl>
    </Modal>
  );
}
