import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/graphics";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Schooling",
  description: "Plan any kind of teaching or learning — a class, a course, a tutee, or your own study.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-dot-grid bg-dots opacity-70 dark:opacity-40" />
        <div className="mx-auto max-w-4xl px-4 py-6">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo />
              <span className="font-display text-lg font-semibold tracking-tight">AI Schooling</span>
            </Link>
            <Link href="/" className="btn-primary">
              + New plan
            </Link>
          </header>
          <div className="animate-fade-up">{children}</div>
          <footer className="mt-16 border-t border-neutral-200/70 pt-5 text-xs text-neutral-400 dark:border-white/10">
            AI drafts, you decide. Every generated plan is an editable draft.
          </footer>
        </div>
      </body>
    </html>
  );
}
