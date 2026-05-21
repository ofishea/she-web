import { NextResponse } from "next/server";
import { PaystackApiError } from "@/lib/paystack/client";
import { fetchTransparencyDashboard } from "@/lib/paystack/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const dashboard = await fetchTransparencyDashboard();
    return NextResponse.json(dashboard, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    if (error instanceof PaystackApiError) {
      console.error("[transparency] Paystack:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode === 401 ? 401 : 502 },
      );
    }

    console.error("[transparency]", error);
    return NextResponse.json(
      { error: "Unable to load transaction data. Please try again later." },
      { status: 500 },
    );
  }
}
