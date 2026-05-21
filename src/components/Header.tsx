export function Header() {
  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ?? "Sangotedo Housing Estate";

  return (
    <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-lg font-semibold text-white shadow-sm"
            aria-hidden
          >
            SHE
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-800/70">
              Financial transparency
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              {siteName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Public record of Paystack incoming payments by virtual account and
              outgoing transfers from the estate balance. Use the tabs below to
              switch views.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
