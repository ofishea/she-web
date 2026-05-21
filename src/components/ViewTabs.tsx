export type DashboardView = "payments" | "transfers";

interface ViewTabsProps {
  active: DashboardView;
  onChange: (view: DashboardView) => void;
  transferCount: number;
}

export function ViewTabs({
  active,
  onChange,
  transferCount,
}: ViewTabsProps) {
  const tabs: { id: DashboardView; label: string; hint: string }[] = [
    {
      id: "payments",
      label: "Incoming payments",
      hint: "By virtual account",
    },
    {
      id: "transfers",
      label: "Outgoing transfers",
      hint: `${transferCount} on record`,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Dashboard views"
      className="flex flex-wrap gap-2 border-b border-stone-200 pb-px"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-t-lg px-4 py-2.5 text-left transition-colors ${
              isActive
                ? "border border-b-0 border-stone-200 bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <span className="block text-sm font-semibold">{tab.label}</span>
            <span className="block text-xs text-stone-500">{tab.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
