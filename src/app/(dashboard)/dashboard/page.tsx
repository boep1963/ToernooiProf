'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/lib/dateUtils';

interface NewsArticle {
  id: string;
  nummer: number;
  kop: string;
  tekst: string;
  tijd: string;
  org_nummer: number;
  org_naam: string;
  comments?: NewsComment[];
}

interface NewsComment {
  id: string;
  nummer: number;
  naam: string;
  tekst: string;
  tijd: string;
  news_id: string;
  org_nummer: number;
}

export default function DashboardPage() {
  const { organization, orgNummer } = useAuth();

  // Stats state
  const [memberCount, setMemberCount] = useState<number>(0);
  const [competitionCount, setCompetitionCount] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [tableCount, setTableCount] = useState<number>(0);

  // News state
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKop, setNewKop] = useState('');
  const [newTekst, setNewTekst] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Comment state
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  // Delete comment state
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<{ articleId: string; commentId: string } | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);

  // Fetch stats
  useEffect(() => {
    if (!orgNummer) return;

    const fetchStats = async () => {
      try {
        const [membersRes, compsRes, matchesRes, tablesRes] = await Promise.all([
          fetch(`/api/organizations/${orgNummer}/members`),
          fetch(`/api/organizations/${orgNummer}/competitions`),
          fetch(`/api/organizations/${orgNummer}/matches/count`),
          fetch(`/api/organizations/${orgNummer}/tables/count`),
        ]);

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          // Members API returns { members: [...], count: N, org_nummer: X }
          setMemberCount(membersData.count || 0);
        }
        if (compsRes.ok) {
          const comps = await compsRes.json();
          // Competitions API returns raw array
          setCompetitionCount(Array.isArray(comps) ? comps.length : 0);
        }
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          // Matches count API returns { count: N }
          setMatchCount(matchesData.count || 0);
        }
        if (tablesRes.ok) {
          const tablesData = await tablesRes.json();
          // Tables count API returns { count: N }
          setTableCount(tablesData.count || 0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [orgNummer]);

  // Fetch news articles
  const fetchNews = useCallback(async () => {
    try {
      setNewsLoading(true);
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Fetch comments for an article
  const fetchComments = async (articleId: string) => {
    try {
      const res = await fetch(`/api/news/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, comments: data.comments || [] } : a
          )
        );
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Toggle article expansion (show/hide comments)
  const toggleArticle = (articleId: string) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
    } else {
      setExpandedArticle(articleId);
      // Fetch comments if not yet loaded
      const article = articles.find((a) => a.id === articleId);
      if (!article?.comments) {
        fetchComments(articleId);
      }
    }
  };

  // Create news article
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKop.trim() || !newTekst.trim()) return;

    setCreating(true);
    setCreateError('');

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kop: newKop, tekst: newTekst }),
      });

      if (res.ok) {
        setNewKop('');
        setNewTekst('');
        setShowCreateForm(false);
        await fetchNews();
      } else {
        const data = await res.json();
        setCreateError(data.error || 'Er is een fout opgetreden');
      }
    } catch {
      setCreateError('Kan nieuwsbericht niet aanmaken');
    } finally {
      setCreating(false);
    }
  };

  // Submit comment
  const handleSubmitComment = async (articleId: string) => {
    const tekst = commentTexts[articleId];
    if (!tekst?.trim()) return;

    setSubmittingComment(articleId);

    try {
      const res = await fetch(`/api/news/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tekst,
          naam: organization?.org_naam || 'Anoniem',
        }),
      });

      if (res.ok) {
        setCommentTexts((prev) => ({ ...prev, [articleId]: '' }));
        await fetchComments(articleId);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(null);
    }
  };

  // Delete comment
  const handleDeleteComment = async () => {
    if (!deleteCommentTarget) return;

    setDeletingComment(true);
    try {
      const res = await fetch(
        `/api/news/${deleteCommentTarget.articleId}/comments/${deleteCommentTarget.commentId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        // Refresh comments for this article
        await fetchComments(deleteCommentTarget.articleId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeletingComment(false);
      setDeleteCommentTarget(null);
    }
  };

  return (
    <div>
      {/* Delete comment confirmation dialog */}
      {deleteCommentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Reactie verwijderen
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Weet u zeker dat u deze reactie wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteCommentTarget(null)}
                disabled={deletingComment}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={handleDeleteComment}
                disabled={deletingComment}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deletingComment ? 'Verwijderen...' : 'Verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Dashboard
      </h1>

      {/* Welcome card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <p className="text-slate-600 dark:text-slate-400">
          Welkom bij ClubMatch
          {organization?.org_naam ? `, ${organization.org_naam}` : ''}!
        </p>
        <p className="text-slate-500 dark:text-slate-500 mt-2 text-sm">
          Gebruik het menu aan de linkerkant om door de applicatie te navigeren.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Leden
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {memberCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Competities
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {competitionCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Wedstrijden
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {matchCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Scoreborden
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {tableCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Nieuws
          </h2>
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nieuw bericht
          </button>
        </div>

        {/* Create news form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateNews}
            className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Nieuw nieuwsbericht
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="news-kop"
                  className="block text-sm text-slate-600 dark:text-slate-400 mb-1"
                >
                  Kop *
                </label>
                <input
                  id="news-kop"
                  type="text"
                  value={newKop}
                  onChange={(e) => setNewKop(e.target.value)}
                  placeholder="Titel van het bericht..."
                  maxLength={100}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="news-tekst"
                  className="block text-sm text-slate-600 dark:text-slate-400 mb-1"
                >
                  Bericht *
                </label>
                <textarea
                  id="news-tekst"
                  value={newTekst}
                  onChange={(e) => setNewTekst(e.target.value)}
                  placeholder="Schrijf hier uw nieuwsbericht..."
                  maxLength={1000}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm resize-y"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {newTekst.length}/1000 tekens
                </p>
              </div>
              {createError && (
                <p className="text-sm text-red-600 dark:text-red-200">
                  {createError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating || !newKop.trim() || !newTekst.trim()}
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-700/50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {creating ? 'Bezig...' : 'Publiceren'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewKop('');
                    setNewTekst('');
                    setCreateError('');
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </form>
        )}

        {/* News list */}
        {newsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
              Nieuws laden...
            </span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Nog geen nieuwsberichten
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Klik op &quot;Nieuw bericht&quot; om het eerste bericht te
              plaatsen.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden"
              >
                {/* Article header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {article.kop}
                    </h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap ml-3">
                      {formatDateTime(article.tijd)}
                    </span>
                  </div>
                  {article.org_naam && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                      Door: {article.org_naam}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {article.tekst}
                  </p>

                  {/* Toggle comments button */}
                  <button
                    type="button"
                    onClick={() => toggleArticle(article.id)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    {expandedArticle === article.id
                      ? 'Reacties verbergen'
                      : `Reacties${article.comments ? ` (${article.comments.length})` : ''}`}
                  </button>
                </div>

                {/* Comments section (expanded) */}
                {expandedArticle === article.id && (
                  <div className="border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 p-4">
                    {/* Existing comments */}
                    {article.comments && article.comments.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {article.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex gap-3 group"
                          >
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-green-700 dark:text-green-400">
                                {(comment.naam || 'A').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {comment.naam}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {formatDateTime(comment.tijd)}
                                </span>
                                {comment.org_nummer === orgNummer && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteCommentTarget({ articleId: article.id, commentId: comment.id })}
                                    className="opacity-0 group-hover:opacity-100 ml-auto text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-all"
                                    title="Reactie verwijderen"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                                {comment.tekst}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                        Nog geen reacties op dit bericht.
                      </p>
                    )}

                    {/* Add comment form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentTexts[article.id] || ''}
                        onChange={(e) =>
                          setCommentTexts((prev) => ({
                            ...prev,
                            [article.id]: e.target.value,
                          }))
                        }
                        placeholder="Schrijf een reactie..."
                        maxLength={500}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitComment(article.id);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitComment(article.id)}
                        disabled={
                          submittingComment === article.id ||
                          !commentTexts[article.id]?.trim()
                        }
                        className="px-3 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-700/50 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                      >
                        {submittingComment === article.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Snelzoeken
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Zoek een lid of competitie..."
            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
          />
          <button
            type="button"
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Zoeken
          </button>
        </div>
      </div>
    </div>
  );
}
