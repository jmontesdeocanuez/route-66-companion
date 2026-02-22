import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD", {
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) throw new Error("Error fetching exchange rate");

    const data = await res.json();
    const rate = data.rates?.USD;

    if (!rate) throw new Error("USD rate not found");

    return NextResponse.json({ rate, date: data.date });
  } catch {
    // Fallback rate if API is unavailable
    return NextResponse.json({ rate: 1.08, date: null, fallback: true });
  }
}
