import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FindVillas — Private villas in Thailand", template: "%s — FindVillas" },
  description: "Handpicked private villas and thoughtful service across Thailand.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning><body>{children}</body></html>;
}
