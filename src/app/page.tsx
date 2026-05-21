import { Header } from "@/components/Header";
import { TransparencyDashboard } from "@/components/TransparencyDashboard";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <TransparencyDashboard />
      </main>
      <footer className="mt-auto border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-stone-500 sm:px-6 lg:px-8">
          Data sourced from Paystack. Figures reflect successful transactions
          at the time of last sync.
        </div>
      </footer>
    </>
  );
}
