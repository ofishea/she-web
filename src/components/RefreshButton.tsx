interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function RefreshButton({ onClick, loading }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
        aria-hidden
      >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24M21 3v6h-6" />
      </svg>
      {loading ? "Refreshing…" : "Refresh"}
    </button>
  );
}
