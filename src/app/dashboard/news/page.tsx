'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Edit3, FileText, Newspaper, Plus, Trash2, User } from 'lucide-react';
import AdminRoute from '../../components/AdminRoute';
import DashboardLayout from '../../components/DashboardLayout';
import {
  createNews,
  deleteNews,
  listenToNewsUpdates,
  updateNews,
  type CreateNewsData,
  type NewsArticle,
} from '../../../lib/newsService';
import { getNewsTitle, getNewsContent } from '@/lib/multilingual';
import { useLanguage } from '../../contexts/LanguageContext';

type NewsStatus = 'all' | 'published' | 'draft' | 'archived';

const emptyForm: CreateNewsData = {
  title_en: '',
  title_rw: '',
  content_en: '',
  content_rw: '',
  author: '',
  summary: '',
  status: 'published',
};

export default function NewsManagement() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NewsStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState<CreateNewsData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToNewsUpdates((newsData) => {
      setArticles(newsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => ({
    total: articles.length,
    published: articles.filter((article) => article.status === 'published').length,
    draft: articles.filter((article) => article.status === 'draft').length,
    archived: articles.filter((article) => article.status === 'archived').length,
  }), [articles]);

  const filteredArticles = filter === 'all'
    ? articles
    : articles.filter((article) => article.status === filter);

  const handleNewArticle = () => {
    setEditingArticle(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const handleEditArticle = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title_en: article.title_en,
      title_rw: article.title_rw,
      content_en: article.content_en,
      content_rw: article.content_rw,
      author: article.author,
      summary: article.summary || '',
      status: article.status || 'published',
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSaveArticle = async () => {
    if (!formData.title_en.trim() || !formData.title_rw.trim() || !formData.content_en.trim() || !formData.content_rw.trim() || !formData.author.trim()) {
      setFormError('All title and content fields in both languages, plus author, are required.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);

      const payload = {
        title_en: formData.title_en.trim(),
        title_rw: formData.title_rw.trim(),
        content_en: formData.content_en.trim(),
        content_rw: formData.content_rw.trim(),
        author: formData.author.trim(),
        summary: formData.summary?.trim() || '',
        status: formData.status || 'published',
      };

      if (editingArticle?.id) {
        await updateNews(editingArticle.id, payload);
      } else {
        await createNews(payload);
      }

      setShowForm(false);
      setEditingArticle(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Error saving news article:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save news article.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (article: NewsArticle) => {
    if (!article.id) return;

    const articleTitle = getNewsTitle(language, article);
    const confirmed = window.confirm(`Delete "${articleTitle}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteNews(article.id);
    } catch (error) {
      console.error('Error deleting news article:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to delete news article.');
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout title="News Management" subtitle="Manage news articles and content">
        <div className="mx-auto max-w-7xl space-y-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="ml-4 text-sm font-medium text-slate-600">Loading news articles...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <StatCard label="Total Articles" value={stats.total} color="text-slate-950" />
                <StatCard label="Published" value={stats.published} color="text-green-600" />
                <StatCard label="Drafts" value={stats.draft} color="text-yellow-600" />
                <StatCard label="Archived" value={stats.archived} color="text-slate-500" />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">All News Articles ({filteredArticles.length})</h2>
                    <p className="mt-1 text-sm text-slate-500">Articles published here appear on the public news page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNewArticle}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    New Article
                  </button>
                </div>

                <div className="border-b border-slate-200 px-6 pt-4">
                  <div className="flex flex-wrap gap-6">
                    {[
                      { key: 'all', label: 'All', count: stats.total },
                      { key: 'published', label: 'Published', count: stats.published },
                      { key: 'draft', label: 'Drafts', count: stats.draft },
                      { key: 'archived', label: 'Archived', count: stats.archived },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key as NewsStatus)}
                        className={`border-b-2 px-1 pb-3 text-sm font-semibold ${
                          filter === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Newspaper className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">No articles found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {filter === 'all' ? 'Create your first news article.' : `No ${filter} articles yet.`}
                    </p>
                    <button
                      type="button"
                      onClick={handleNewArticle}
                      className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Create Article
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Article</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Author</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Updated</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredArticles.map((article) => (
                          <tr key={article.id} className="hover:bg-slate-50">
                            <td className="max-w-md px-6 py-4">
                              <p className="truncate text-sm font-semibold text-slate-950">{getNewsTitle(language, article)}</p>
                              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                {article.summary || getNewsContent(language, article)}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                              <span className="inline-flex items-center">
                                <User className="mr-2 h-4 w-4 text-slate-400" aria-hidden="true" />
                                {article.author || 'Unknown'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(article.status)}`}>
                                {formatStatus(article.status)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                              <span className="inline-flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-slate-400" aria-hidden="true" />
                                {formatDate(article.updatedAt || article.createdAt)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                              <div className="flex items-center gap-3">
                                {article.id && (
                                  <Link href={`/news/${article.id}`} className="text-blue-600 hover:text-blue-800">
                                    View
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleEditArticle(article)}
                                  className="inline-flex items-center text-slate-600 hover:text-slate-950"
                                >
                                  <Edit3 className="mr-1 h-4 w-4" aria-hidden="true" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArticle(article)}
                                  className="inline-flex items-center text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100">
              {/* Modal Header */}
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {editingArticle ? 'Edit News Article' : 'Create News Article'}
                      </h3>
                      <p className="text-blue-100 text-sm mt-1">
                        {editingArticle ? 'Update your article content and settings' : 'Share your news with the community'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    aria-label="Close news form"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {formError && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{formError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  {/* English Section */}
                  <div className="border border-blue-200 rounded-xl p-6 bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">EN</span>
                      </div>
                      <h4 className="text-lg font-semibold text-blue-900">English Content</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          Title (English) *
                          <span className="text-xs text-gray-500 font-normal">({formData.title_en.length}/100 characters)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title_en}
                          onChange={(event) => setFormData({ ...formData, title_en: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                          placeholder="Enter a compelling title for your article"
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Content (English) *
                          <span className="text-xs text-gray-500 font-normal">({formData.content_en.length} characters)</span>
                        </label>
                        <textarea
                          value={formData.content_en}
                          onChange={(event) => setFormData({ ...formData, content_en: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                          rows={8}
                          placeholder="Write your full article content here. You can use markdown formatting for better styling..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kinyarwanda Section */}
                  <div className="border border-green-200 rounded-xl p-6 bg-green-50/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">RW</span>
                      </div>
                      <h4 className="text-lg font-semibold text-green-900">Kinyarwanda Content</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" />
                          Title (Kinyarwanda) *
                          <span className="text-xs text-gray-500 font-normal">({formData.title_rw.length}/100 characters)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title_rw}
                          onChange={(event) => setFormData({ ...formData, title_rw: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                          placeholder="Andika umutwe wungirije kuri iyi nkoranyamagambo"
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Content (Kinyarwanda) *
                          <span className="text-xs text-gray-500 font-normal">({formData.content_rw.length} characters)</span>
                        </label>
                        <textarea
                          value={formData.content_rw}
                          onChange={(event) => setFormData({ ...formData, content_rw: event.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                          rows={8}
                          placeholder="Andika ibikurikira by'inkoranyamagambo ahabwa..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        Author Name *
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(event) => setFormData({ ...formData, author: event.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Publication Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(event) => setFormData({ ...formData, status: event.target.value as CreateNewsData['status'] })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                      >
                        <option value="published">📢 Published - Visible to everyone</option>
                        <option value="draft">📝 Draft - Not visible publicly</option>
                        <option value="archived">📦 Archived - Hidden from lists</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Article Summary
                      <span className="text-xs text-gray-500 font-normal">({(formData.summary || '').length}/200 characters)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.summary}
                      onChange={(event) => setFormData({ ...formData, summary: event.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="Brief summary that appears in article previews"
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {editingArticle ? 'Last updated: ' + formatDate(editingArticle.updatedAt) : 'Creating new article'}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveArticle}
                      className="px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editingArticle ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {editingArticle ? 'Update Article' : 'Publish Article'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AdminRoute>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-3 text-4xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
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

function getStatusClass(status: NewsArticle['status']) {
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
