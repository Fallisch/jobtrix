"use client";

import { useEffect, useState, useCallback } from "react";

type Tab = "overview" | "payments" | "customers" | "refunds";

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  totalPayments: number;
  refundedTotal: number;
  revenueByPackage: Array<{ package: string; total: number; count: number }>;
  dailyRevenue: Array<{ day: string; total: number }>;
}

interface Payment {
  id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  package: string;
  refundedAt: string | null;
  refundAmount: number | null;
  createdAt: string;
}

interface Customer {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  stripeCustomerId: string | null;
  role: string;
  access: {
    package: string;
    validUntil: string | null;
    subscriptionStatus: string | null;
    freeGenerationUsed: boolean;
  } | null;
  payments: { count: number; total: number };
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    succeeded: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    refunded: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    partially_refunded: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    past_due: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-xs font-medium text-text/60 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-primary dark:text-accent mt-1">{value}</p>
      {sub && <p className="text-xs text-text/50 mt-1">{sub}</p>}
    </div>
  );
}

function OverviewTab() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-text/60 text-sm">Lade Umsatzdaten...</p>;
  if (!data) return <p className="text-red-500 text-sm">Fehler beim Laden der Umsatzdaten.</p>;

  const growth =
    data.lastMonthRevenue > 0
      ? Math.round(((data.monthlyRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gesamtumsatz" value={formatEur(data.totalRevenue)} />
        <StatCard
          label="Dieser Monat"
          value={formatEur(data.monthlyRevenue)}
          sub={growth !== null ? `${growth >= 0 ? "+" : ""}${growth}% zum Vormonat` : undefined}
        />
        <StatCard label="Zahlungen" value={String(data.totalPayments)} />
        <StatCard label="Erstattungen" value={formatEur(data.refundedTotal)} />
      </div>

      {data.revenueByPackage.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-text mb-3">Umsatz nach Paket</h3>
          <div className="space-y-2">
            {data.revenueByPackage.map((r) => (
              <div key={r.package} className="flex items-center justify-between text-sm">
                <span className="text-text/80">{r.package}</span>
                <span className="font-medium text-text">
                  {formatEur(r.total)} ({r.count}x)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.dailyRevenue.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-text mb-3">Tagesumsatz (letzte 30 Tage)</h3>
          <div className="flex items-end gap-1 h-32">
            {(() => {
              const max = Math.max(...data.dailyRevenue.map((d) => d.total), 1);
              return data.dailyRevenue.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 bg-accent/70 rounded-t hover:bg-accent transition-colors"
                  style={{ height: `${(d.total / max) * 100}%`, minHeight: "2px" }}
                  title={`${d.day}: ${formatEur(d.total)}`}
                />
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/payments?${params}`)
      .then((r) => (r.ok ? r.json() : { payments: [], total: 0 }))
      .then((d: { payments: Payment[]; total: number }) => {
        setPayments(d.payments);
        setTotal(d.total);
      })
      .catch(() => {
        setPayments([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-3 py-2 text-sm"
        >
          <option value="">Alle Status</option>
          <option value="succeeded">Erfolgreich</option>
          <option value="failed">Fehlgeschlagen</option>
          <option value="refunded">Erstattet</option>
        </select>
        <span className="text-sm text-text/60">{total} Zahlungen</span>
      </div>

      {loading ? (
        <p className="text-text/60 text-sm">Lade...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-surface">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text/70">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Betrag</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Paket</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">User-ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-surface/50">
                  <td className="px-4 py-3 text-text">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-text font-medium">{formatEur(p.amount)}</td>
                  <td className="px-4 py-3 text-text">{p.package}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-text/60 font-mono text-xs">{p.userId.slice(0, 12)}...</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-text/50">Keine Zahlungen gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
          >
            Zurück
          </button>
          <span className="text-sm text-text/60">Seite {page} von {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}

function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    fetch(`/api/admin/customers?${params}`)
      .then((r) => (r.ok ? r.json() : { customers: [], total: 0 }))
      .then((d: { customers: Customer[]; total: number }) => {
        setCustomers(d.customers);
        setTotal(d.total);
      })
      .catch(() => {
        setCustomers([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="E-Mail suchen..."
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-3 py-2 text-sm flex-1 max-w-sm"
        />
        <span className="text-sm text-text/60">{total} Kunden</span>
      </div>

      {loading ? (
        <p className="text-text/60 text-sm">Lade...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-surface">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text/70">E-Mail</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Paket</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Zahlungen</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Umsatz</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Registriert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-surface/50">
                  <td className="px-4 py-3 text-text">{c.email}</td>
                  <td className="px-4 py-3 text-text">{c.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.access?.package ?? "none"} />
                    {c.access?.subscriptionStatus && (
                      <span className="ml-1"><StatusBadge status={c.access.subscriptionStatus} /></span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text">{c.payments.count}</td>
                  <td className="px-4 py-3 text-text font-medium">{formatEur(c.payments.total)}</td>
                  <td className="px-4 py-3 text-text/60">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-text/50">Keine Kunden gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
          >
            Zurück
          </button>
          <span className="text-sm text-text/60">Seite {page} von {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}

function RefundsTab() {
  const [refunds, setRefunds] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/refunds")
      .then((r) => (r.ok ? r.json() : { refunds: [], total: 0 }))
      .then((d: { refunds: Payment[]; total: number }) => {
        setRefunds(d.refunds);
        setTotal(d.total);
      })
      .catch(() => {
        setRefunds([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <span className="text-sm text-text/60">{total} Erstattungen</span>

      {loading ? (
        <p className="text-text/60 text-sm">Lade...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-surface">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text/70">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Originalbetrag</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Erstattet</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text/70">Paket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {refunds.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-surface/50">
                  <td className="px-4 py-3 text-text">{r.refundedAt ? formatDate(r.refundedAt) : "—"}</td>
                  <td className="px-4 py-3 text-text">{formatEur(r.amount)}</td>
                  <td className="px-4 py-3 text-text font-medium">{r.refundAmount != null ? formatEur(r.refundAmount) : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-text">{r.package}</td>
                </tr>
              ))}
              {refunds.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-text/50">Keine Erstattungen vorhanden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "overview", label: "Übersicht" },
  { key: "payments", label: "Zahlungen" },
  { key: "customers", label: "Kunden" },
  { key: "refunds", label: "Erstattungen" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary dark:text-accent">Admin-Dashboard</h1>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition -mb-px ${
              activeTab === tab.key
                ? "border-b-2 border-accent text-accent"
                : "text-text/60 hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "payments" && <PaymentsTab />}
      {activeTab === "customers" && <CustomersTab />}
      {activeTab === "refunds" && <RefundsTab />}
    </div>
  );
}
