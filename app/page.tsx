import Link from "next/link";
import { BarChart3, ShieldCheck } from "lucide-react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import data from "./dashboard/data.json";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary-50 via-white to-primary-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <BarChart3 className="size-5 text-primary" />
            CRM Dashboard
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Dashboard preview first. Sign in when ready.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                This is a public preview so you can explore the dashboard look and feel.
                Sign in or register to access full CRM features.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              Secure access after authentication
            </div>
          </div>
        </section>

        <section>
          <SectionCards />
        </section>

        <section className="px-0 lg:px-0">
          <ChartAreaInteractive />
        </section>

        <section>
          <DataTable data={data} />
        </section>
      </main>
    </div>
  );
}
