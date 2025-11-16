import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";

type BlogPageParams = {
  params: Promise<{ locale: Locale }>;
};

export default async function BlogPage({ params }: BlogPageParams) {
  await params;
  notFound();
}

export function generateStaticParams() {
  return [];
}
