'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Archive, BarChart3, Calendar, Edit3, FileText, Newspaper, Send } from 'lucide-react';
import AdminRoute from '../../../components/AdminRoute';
import DashboardLayout from '../../../components/DashboardLayout';
import { listenToNewsUpdates, type NewsArticle } from '../../../../lib/newsService';
import { getNewsTitle, getNewsContent } from '@/lib/multilingual';
import { useLanguage } from '../../../contexts/LanguageContext';

type NewsStatus = 'published' | 'draft' | 'archived';

const statusConfig: Record<NewsStatus, {
  label: string;
  color: string;
  bg: string;
  bar: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  published: {
    label: 'Published',
    color: 'text-green-600',
    bg: 'from-green-50 to-emerald-50 border-green-100',
    bar: 'bg-green-500',
    icon: Send,
  },
  draft: {
    label: 'Drafts',
    color: 'text-yellow-600',
    bg: 'from-yellow-50 to-amber-50 border-yellow-100',
    bar: 'bg-yellow-500',
    icon: Edit3,
  },
  archived: {
    label: 'Archived',
    color: 'text-slate-600',
    bg: 'from-slate-50 to-slate-100 border-slate-100',
    bar: 'bg-slate-500',
    icon: Archive,
  },
};

export default function NewsStats() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToNewsUpdates((newsData) => {
      setArticles(newsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const counts = {
      total: articles.length,
      published: articles.filter((article) => article.status === 'published').length,
      draft: articles.filter((article) => article.status === 'draft').length,
      archived: articles.filter((article) => article.status === 'archived').length,
    };

    return {
      ...counts,
      publicRate: counts.total > 0 ? Math.round((counts.published / counts.total) * 100) : 0,
      unpublishedRate: counts.total > 0 ? Math.round(((counts.draft + counts.archived) / counts.total) * 100) : 0,
    };
  }, [articles]);

  const recentArticles = articles.slice(0, 5);

  return (
    <AdminRoute>
      <DashboardLayout title="News Statistics" subtitle="Live news article analytics and metrics">
        <div className="mx-auto max-w-7xl space-y-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="ml-4 text-sm font-medium text-slate-600">Loading news statistics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <SummaryCard
                  label="Total Articles"
                  value={stats.total}
                  icon={Newspaper}
                  color="text-slate-950"
                  bg="from-slate-50 to-blue-50 border-slate-100"
                />
                <StatusCard status="published" value={stats.published} total={stats.total} />
                <StatusCard status="draft" value={stats.draft} total={stats.total} />
                <StatusCard status="archived" value={stats.archived} total={stats.total} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">Publication Breakdown</h2>
                      <p className="mt-1 text-sm text-slate-500">These are the same statuses used by News Management and the public news page.</p>
                    </div>
                    <BarChart3 className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>

                  <div className="space-y-5">
                    <BreakdownRow label="Published" value={stats.published} total={stats.total} barClassName="bg-green-500" />
                    <BreakdownRow label="Drafts" value={stats.draft} total={stats.total} barClassName="bg-yellow-500" />
                    <BreakdownRow label="Archived" value={stats.archived} total={stats.total} barClassName="bg-slate-500" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-950">Publishing Snapshot</h2>
                  <div className="mt-6 space-y-4">
                    <MetricTile label="Public content" value={`${stats.publicRate}%`} description="Articles visible on the website" />
                    <MetricTile label="Not public" value={`${stats.unpublishedRate}%`} description="Draft or archived articles" />
                    <MetricTile label="Total records" value={String(stats.total)} description="Synced from the news collection" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Recent Articles</h2>
                    <p className="mt-1 text-sm text-slate-500">Latest articles from the live news feed.</p>
                  </div>
                  <Link
                    href="/dashboard/news"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Manage news
                  </Link>
                </div>

                {recentArticles.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">No articles yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Create articles in News Management to populate these statistics.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between gap-4 px-6 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{getNewsTitle(language, article)}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {article.summary || getNewsContent(language, article)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                          <span className="hidden items-center text-xs text-slate-500 sm:inline-flex">
                            <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
                            {formatDate(article.updatedAt || article.createdAt)}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(article.status)}`}>
                            {formatStatus(article.status)}
                          </span>
                        </div>
                      </div>
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

function StatusCard({ status, value, total }: { status: NewsStatus; value: number; total: number }) {
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
        <span className="text-slate-500">{value} articles · {percentage}%</span>
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

function formatDate(value: NewsArticle['createdAt'] | NewsArticle['updatedAt']) {
  if (!value) return 'Unknown date';
  return value.toDate ? value.toDate().toLocaleDateString() : 'Unknown date';
}

function formatStatus(status: NewsArticle['status']) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Published';
}

function getStatusBadgeClass(status: NewsArticle['status']) {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-700';
    case 'archived':
      return 'bg-slate-100 text-slate-700';
    case 'published':
    default:
      return 'bg-green-100 text-green-700';
  }
}
