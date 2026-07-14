import { differenceInCalendarDays, isWithinInterval, parseISO } from "date-fns";
import type { BookingQuote, Villa } from "./types";

export function calculateQuote(villa: Villa, checkIn: string, checkOut: string): BookingQuote {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const nights = differenceInCalendarDays(end, start);
  if (!Number.isFinite(nights) || nights < 1) throw new Error("Check-out must be after check-in");

  let nightlySubtotal = 0;
  for (let index = 0; index < nights; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const seasonal = villa.rates.find((rate) => isWithinInterval(date, { start: parseISO(rate.start), end: parseISO(rate.end) }));
    nightlySubtotal += seasonal?.nightlyThb ?? villa.baseRateThb;
  }
  const serviceFee = Math.round(nightlySubtotal * 0.08);
  const tax = Math.round((nightlySubtotal + serviceFee) * 0.07);
  return { nights, nightlySubtotal, serviceFee, tax, total: nightlySubtotal + serviceFee + tax, currency: "THB" };
}
