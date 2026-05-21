export function formatCurrency(amountKobo: number, currency = "NGN"): string {
  const amount = amountKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatRelativeSync(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

export function sumTransactionFees(
  transactions: { fees: number | null }[],
): number {
  return transactions.reduce((sum, t) => sum + (t.fees ?? 0), 0);
}

export function maskAccountNumber(account: string | null): string {
  if (!account) return "—";
  if (account.length <= 4) return account;
  return `•••• ${account.slice(-4)}`;
}
