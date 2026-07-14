import { notFound } from "next/navigation";
import { LoginCard } from "@/components/login-card";
import { isLocale } from "@/lib/i18n";

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string; error?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const localEnabled = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("127.0.0.1") === true;
  return <LoginCard locale={locale} nextPath={query.next} error={query.error} localEnabled={localEnabled} />;
}
