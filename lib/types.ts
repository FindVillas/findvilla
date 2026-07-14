export type Locale = "en" | "th";

export type LocalizedText = Record<Locale, string>;

export type Destination = {
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  image: string;
  villaCount: number;
};

export type SeasonalRate = {
  name: LocalizedText;
  start: string;
  end: string;
  nightlyThb: number;
  minimumNights: number;
};

export type Villa = {
  id: string;
  slug: string;
  name: string;
  destination: string;
  area: LocalizedText;
  description: LocalizedText;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  baseRateThb: number;
  rating: number;
  reviews: number;
  amenities: string[];
  tags: LocalizedText[];
  lat: number;
  lng: number;
  featured: boolean;
  managed: boolean;
  rates: SeasonalRate[];
};

export type BookingQuote = {
  nights: number;
  nightlySubtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  currency: "THB";
};

export type BookingStatus =
  | "submitted"
  | "approved_payment_pending"
  | "declined"
  | "expired"
  | "confirmed"
  | "cancelled";
