import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

type PostTypeFilter = 'all' | 'article' | 'question';
type PlanFilter = 'all' | 'free' | 'paid';
type SortOrder = 'newest' | 'oldest';

type Post = {
  id: string;
  type: 'article' | 'question';
  title: string;
  description: string;
  tags: string[];
  payed: boolean;
  author: string;
  createdAt: string | null;
};

type FiltersDraft = {
  type: PostTypeFilter;
  tags: string;
  dateFrom: string;
  dateTo: string;
  plan: PlanFilter;
  sort: SortOrder;
};

const EMPTY_FILTERS: FiltersDraft = {
  type: 'all',
  tags: '',
  dateFrom: '',
  dateTo: '',
  plan: 'all',
  sort: 'newest',
};

const API_BASE = 'http://localhost:3000';

function hiddenStorageKey(userId: string | null) {
  return `hiddenPosts:${userId || 'guest'}`;
}

function loadHidden(userId: string | null): Set<string> {
  try {
    const raw = localStorage.getItem(hiddenStorageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveHidden(userId: string | null, hidden: Set<string>) {
  try {
    localStorage.setItem(hiddenStorageKey(userId), JSON.stringify(Array.from(hidden)));
  } catch {
    // localStorage can fail (private browsing, quota) -- hiding is a nice-to-have,
    // so we just skip persisting rather than breaking the page.
  }
}

function formatDate(iso: string | null) {
  if (!iso) return 'Unknown date';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function previewDescription(description: string) {
  const firstLine = description.split(/\r?\n/, 1)[0];
  return firstLine.length > 10 ? `${firstLine.slice(0, 20)}...` : firstLine;
}

function ViewPosts() {
  const { isLoggedIn, planType, user } = useAuth();
  const userId: string | null = user?.userId || null;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filtersDraft, setFiltersDraft] = useState<FiltersDraft>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FiltersDraft>(EMPTY_FILTERS);

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => loadHidden(null));
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [numberOfPosts, setNumberOfPosts] = useState<number>(3); // Default number of posts to display

  // Re-load the hidden list whenever the logged-in user changes, so one
  // person's hidden posts don't leak into another person's view on a
  // shared browser.
  useEffect(() => {
    setHiddenIds(loadHidden(userId));
  }, [userId]);

  async function fetchPosts(filters: FiltersDraft) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.tags.trim()) params.set('tags', filters.tags.trim());
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.plan !== 'all') params.set('plan', filters.plan);
      params.set('sort', filters.sort);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/viewposts?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Sent when present, but the backend works fine without it --
          // it just falls back to the free/guest view.
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load posts.');
      }
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  // Initial load, and reload whenever login state changes (login/logout,
  // or an upgrade that changes what the backend will return).
  useEffect(() => {
    fetchPosts(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, planType]);

  function applyFilters(e: SyntheticEventLike) {
    e.preventDefault();
    setAppliedFilters(filtersDraft);
    fetchPosts(filtersDraft);
  }

  function resetAll() {
    setFiltersDraft(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setHiddenIds(new Set());
    saveHidden(userId, new Set());
    setExpandedPost(null);
    fetchPosts(EMPTY_FILTERS);
  }

  function hidePost(id: string) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveHidden(userId, next);
      return next;
    });
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    setPosts((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((p) => p.id === draggedId);
      const toIndex = next.findIndex((p) => p.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
  }

  const allVisiblePosts = useMemo(
    () => posts.filter((p) => !hiddenIds.has(p.id)),
    [posts, hiddenIds],
  );

  const visiblePosts = useMemo(
    () => allVisiblePosts.slice(0, numberOfPosts),
    [allVisiblePosts, numberOfPosts],
  );

  const planLabel = !isLoggedIn ? 'Guest (Free access)' : planType === 'paid' ? 'Paid plan' : 'Free plan';

  return (
    <div className="browse-posts">
      <h1>Browse Posts</h1>
      <p className="browse-posts__summary">
        Viewing as: <strong>{planLabel}</strong>
        {planType !== 'paid' && (
          <span> &mdash; paid Articles/Questions are hidden until you upgrade.</span>
        )}
      </p>

      <form
        onSubmit={applyFilters}
        className="browse-posts__filters"
      >
        <div>
          <label htmlFor="filter-type">Type</label>
          <br />
          <select
            id="filter-type"
            value={filtersDraft.type}
            onChange={(e) => setFiltersDraft({ ...filtersDraft, type: e.target.value as PostTypeFilter })}
          >
            <option value="all">All</option>
            <option value="article">Article</option>
            <option value="question">Question</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-tags">Tags (comma separated)</label>
          <br />
          <input
            id="filter-tags"
            type="text"
            placeholder="e.g. react, firebase"
            value={filtersDraft.tags}
            onChange={(e) => setFiltersDraft({ ...filtersDraft, tags: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="filter-from">From</label>
          <br />
          <input
            id="filter-from"
            type="date"
            value={filtersDraft.dateFrom}
            onChange={(e) => setFiltersDraft({ ...filtersDraft, dateFrom: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="filter-to">To</label>
          <br />
          <input
            id="filter-to"
            type="date"
            value={filtersDraft.dateTo}
            onChange={(e) => setFiltersDraft({ ...filtersDraft, dateTo: e.target.value })}
          />
        </div>

        {planType === 'paid' && (
          <div>
            <label htmlFor="filter-plan">Post plan</label>
            <br />
            <select
              id="filter-plan"
              value={filtersDraft.plan}
              onChange={(e) => setFiltersDraft({ ...filtersDraft, plan: e.target.value as PlanFilter })}
            >
              <option value="all">Free + Paid</option>
              <option value="free">Free only</option>
              <option value="paid">Paid only</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="filter-sort">Sort</label>
          <br />
          <select
            id="filter-sort"
            value={filtersDraft.sort}
            onChange={(e) => setFiltersDraft({ ...filtersDraft, sort: e.target.value as SortOrder })}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="browse-posts__actions">
          <button type="submit">Apply filters</button>
          <button type="button" onClick={resetAll}>
            Reset
          </button>
        </div>
      </form>

      {loading && <p className="browse-posts__status">Loading posts...</p>}
      {error && <p className="browse-posts__status browse-posts__status--error" role="alert">{error}</p>}
      {!loading && !error && visiblePosts.length === 0 && (
        <p className="browse-posts__status">No posts match your filters right now.</p>
      )}

      <ul className="browse-posts__list">
        {visiblePosts.map((post) => (
          <li
            key={post.id}
            draggable
            onDragStart={() => setDraggedId(post.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(post.id)}
            className={`browse-posts__card${draggedId === post.id ? ' browse-posts__card--dragged' : ''}`}
          >
            <div className="browse-posts__card-layout">
              <div className="browse-posts__card-content">
                <div className="browse-posts__meta">
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      background: '#eee',
                      borderRadius: 4,
                      padding: '0.1rem 0.5rem',
                    }}
                  >
                    {post.type}
                  </span>
                  {post.payed && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: '#fff3cd',
                        color: '#7a5b00',
                        borderRadius: 4,
                        padding: '0.1rem 0.5rem',
                      }}
                    >
                      Paid
                    </span>
                  )}
                  <span className="browse-posts__date">{formatDate(post.createdAt)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedPost(post)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  {post.title}
                </button>

                <p className="browse-posts__description">
                  {previewDescription(post.description)}
                </p>

                {post.tags.length > 0 && (
                  <div className="browse-posts__tags">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="browse-posts__tag"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="browse-posts__author">by {post.author}</p>
              </div>

              <div className="browse-posts__card-actions">
                <button type="button" onClick={() => setExpandedPost(post)}>
                  Expand
                </button>
                <button type="button" onClick={() => hidePost(post.id)}>
                  Hide
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {visiblePosts.length < allVisiblePosts.length && (
        <div className="browse-posts__expand-posts">
          <button
            type="button"
            onClick={() => setNumberOfPosts((prev) => prev + 3)}
          >
            Load more posts
          </button>
        </div>
      )}

      {expandedPost && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedPost(null)}
          className="browse-posts__modal-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="browse-posts__modal"
          >
            <div className="browse-posts__modal-header">
              <h2>{expandedPost.title}</h2>
              <button type="button" onClick={() => setExpandedPost(null)} aria-label="Close">
                Close
              </button>
            </div>
            <p className="browse-posts__modal-meta">
              {expandedPost.type} &middot; {formatDate(expandedPost.createdAt)} &middot; by {expandedPost.author}
              {expandedPost.payed ? ' \u00b7 Paid' : ''}
            </p>
            <p className="browse-posts__modal-description">{expandedPost.description}</p>
            {expandedPost.tags.length > 0 && (
              <div className="browse-posts__tags">
                {expandedPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="browse-posts__tag"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal structural type so this file doesn't need to import React's
// FormEvent type explicitly -- swap for React.FormEvent<HTMLFormElement>
// if you'd rather use that.
type SyntheticEventLike = { preventDefault: () => void };

export default ViewPosts;