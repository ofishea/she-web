import type { PaystackMeta, PaystackResponse } from "./types";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export class PaystackApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "PaystackApiError";
  }
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new PaystackApiError(
      "Paystack secret key is not configured. Set PAYSTACK_SECRET_KEY in your environment.",
    );
  }
  return key;
}

export async function paystackFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<{ data: T; meta?: PaystackMeta }> {
  const url = new URL(`${PAYSTACK_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  let body: PaystackResponse<T>;
  try {
    body = (await response.json()) as PaystackResponse<T>;
  } catch {
    throw new PaystackApiError(
      `Paystack returned a non-JSON response (${response.status}) for ${path}`,
      response.status,
    );
  }

  if (!response.ok || !body.status) {
    throw new PaystackApiError(
      body.message || `Paystack API request failed (${response.status})`,
      response.status,
    );
  }

  return { data: body.data, meta: body.meta };
}

export async function paystackFetchAllPages<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  maxPages = 50,
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (page <= maxPages) {
    const { data, meta } = await paystackFetch<T[]>(path, {
      ...params,
      page,
      perPage: 100,
    });

    results.push(...data);

    if (!meta || page >= meta.pageCount) {
      break;
    }

    page += 1;
  }

  return results;
}
