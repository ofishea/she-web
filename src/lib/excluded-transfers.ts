/**
 * Outgoing transfer references to hide from the public dashboard.
 *
 * For each matching transfer:
 * - It is removed from the outgoing transfers table
 * - Its amount is added back to Account balance (as if the transfer never left)
 * - It is excluded from outgoing transfer counts and total sent
 *
 * Add Paystack transfer `reference` values (not transfer codes) below.
 */
export const EXCLUDED_TRANSFER_REFERENCES: string[] = [
  "4x52rwrbp1qm3c36d4fr",
];
