'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BarChart3, CheckCircle2, Clock3, FileText } from 'lucide-react';
import { DocumentData } from 'firebase/firestore';
import AdminRoute from '../../../components/AdminRoute';
import DashboardLayout from '../../../components/DashboardLayout';
import { listenToCases } from '../../../lib/firestore';

type CaseStatus = 'active' | 'pending' | 'blocked';

const statusConfig: Record<CaseStatus, {
  label: string;
  color: string;
  iconColor: string;
  bg: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  active: {
    label: 'Active Cases',
    color: 'text-green-600',
    iconColor: 'text-green-600',
    bg: 'from-green-50 to-emerald-50 border-green-100',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending Cases',
    color: 'text-yellow-600',
    iconColor: 'text-yellow-600',
    bg: 'from-yellow-50 to-amber-50 border-yellow-100',
    icon: Clock3,
  },
  blocked: {
    label: 'Blocked Cases',
    color: 'text-red-600',
    iconColor: 'text-red-600',
    bg: 'from-red-50 to-rose-50 border-red-100',
    icon: AlertCircle,
  },
};

export default function CaseStatistics() {
  const [cases, setCases] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToCases((casesData) => {
      setCases(casesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const counts = {
      total: cases.length,
      active: cases.filter((caseItem) => normalizeStatus(caseItem.status) === 'active').length,
      pending: cases.filter((caseItem) => normalizeStatus(caseItem.status) === 'pending').length,
      blocked: cases.filter((caseItem) => normalizeStatus(caseItem.status) === 'blocked').length,
    };

    return {
      ...counts,
      completionRate: counts.total > 0 ? Math.round((counts.active / counts.total) * 100) : 0,
      attentionRate: counts.total > 0 ? Math.round(((counts.pending + counts.blocked) / counts.total) * 100) : 0,
    };
  }, [cases]);

  const recentCases = cases.slice(0, 5);

  return (
    <AdminRoute>
      <DashboardLayout title="Case Statistics" subtitle="Live case analytics from the website data">
        <div className="mx-auto max-w-7xl space-y-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="ml-4 text-sm font-medium text-slate-600">Loading case statistics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <SummaryCard
                  label="Total Cases"
                  value={stats.total}
                  icon={FileText}
                  color="text-slate-900"
                  bg="from-slate-50 to-blue-50 border-slate-100"
                />
                <StatusCard status="active" value={stats.active} total={stats.total} />
                <StatusCard status="pending" value={stats.pending} total={stats.total} />
                <StatusCard status="blocked" value={stats.blocked} total={stats.total} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">Status Breakdown</h2>
                      <p className="mt-1 text-sm text-slate-500">Same status categories used on the website cases page.</p>
                    </div>
                    <BarChart3 className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>

                  <div className="space-y-5">
                    <BreakdownRow label="Active" value={stats.active} total={stats.total} barClassName="bg-green-500" />
                    <BreakdownRow label="Pending" value={stats.pending} total={stats.total} barClassName="bg-yellow-500" />
                    <BreakdownRow label="Blocked" value={stats.blocked} total={stats.total} barClassName="bg-red-500" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-950">Health Snapshot</h2>
                  <div className="mt-6 space-y-4">
                    <MetricTile label="Active share" value={`${stats.completionRate}%`} description="Cases currently marked active" />
                    <MetricTile label="Needs attention" value={`${stats.attentionRate}%`} description="Pending or blocked cases" />
                    <MetricTile label="Total records" value={String(stats.total)} description="Synced from the cases collection" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Recent Cases</h2>
                    <p className="mt-1 text-sm text-slate-500">Latest cases from the same website feed.</p>
                  </div>
                  <Link
                    href="/dashboard/cases"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View all
                  </Link>
                </div>

                {recentCases.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">No cases yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Cases created on the website will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentCases.map((caseItem) => (
                      <Link
                        key={caseItem.id}
                        href={`/dashboard/cases/${caseItem.id}`}
                        className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{caseItem.title || 'Untitled case'}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{caseItem.description || `ID: ${caseItem.id}`}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(caseItem.status)}`}>
                          {formatStatus(caseItem.status)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-6 shadow-sm ${bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-3 text-4xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ status, value, total }: { status: CaseStatus; value: number; total: number }) {
  const config = statusConfig[status];
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <SummaryCard
      label={`${config.label} (${percentage}%)`}
      value={value}
      icon={config.icon}
      color={config.color}
      bg={config.bg}
    />
  );
}

function BreakdownRow({
  label,
  value,
  total,
  barClassName,
}: {
  label: string;
  value: number;
  total: number;
  barClassName: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-500">{value} cases · {percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function MetricTile({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function normalizeStatus(status: unknown): string {
  return String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function formatStatus(status: unknown): string {
  const value = String(status || 'Unknown').replace('_', ' ');
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusBadgeClass(status: unknown): string {
  switch (normalizeStatus(status)) {
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'blocked':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
