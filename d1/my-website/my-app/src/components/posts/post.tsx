import { useState, type SyntheticEvent } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

type PostType = 'article' | 'question';

type PostDraft = {
  type: PostType;
  title: string;
  description: string;
  tags: string;
};

function Post() {
  const { isLoggedIn } = useAuth();

  const [postDraft, setPostDraft] = useState<PostDraft>({
    type: 'article',
    title: '',
    description: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function handlePostSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('');
    setError('');

    if (!postDraft.title.trim() || !postDraft.description.trim()) {
      setError('Please enter a title and description.');
      return;
    }

    if (!isLoggedIn) {
      setError('You must be logged in to submit a post.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Your session has expired. Please log in again.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postDraft),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save the post.');
      }

      setStatus(postDraft.type === 'article' ? 'Article saved successfully.' : 'Question saved successfully.');
      setPostDraft({ type: postDraft.type, title: '', description: '', tags: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save the post.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="post-section">
      <h1 className="post-title">new post</h1>
      <form className="post-form" onSubmit={handlePostSubmit}>

        <label>Type:</label>
        <div>
          <label>
            <input
              type="radio"
              name="type"
              value="article"
              checked={postDraft.type === 'article'}
              onChange={(e) => {
                const nextType = e.target.value as PostType;
                setPostDraft({ ...postDraft, type: nextType });
              }}
            />
            Article
          </label>

          <label>
            <input
              type="radio"
              name="type"
              value="question"
              checked={postDraft.type === 'question'}
              onChange={(e) => {
                const nextType = e.target.value as PostType;
                setPostDraft({ ...postDraft, type: nextType });
              }}
            />
            Question
          </label>
        </div>

        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={postDraft.title}
          onChange={(e) => setPostDraft({ ...postDraft, title: e.target.value })}
        />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={postDraft.description}
          onChange={(e) => setPostDraft({ ...postDraft, description: e.target.value })}
        />

        <label htmlFor="tags">Tags:</label>
        <input
          type="text"
          id="tags"
          value={postDraft.tags}
          onChange={(e) => setPostDraft({ ...postDraft, tags: e.target.value })}
        />
        {error && <p className="form-status form-status--error">{error}</p>}
        {status && <p className="form-status">{status}</p>}
        <div className="post-buttons">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPostDraft({ type: 'article', title: '', description: '', tags: '' });
              setStatus('');
              setError('');
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default Post;
