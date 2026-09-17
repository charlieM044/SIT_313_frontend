import { useState, type SyntheticEvent } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

type PostType = 'article' | 'question';

type PostDraft = {
  type: PostType;
  title: string;
  description: string;
  tags: string;
  payed: boolean;
};

const EMPTY_DRAFT: PostDraft = {
  type: 'article',
  title: '',
  description: '',
  tags: '',
  payed: false,
};

function Post() {
  const { isLoggedIn, planType } = useAuth();

  const [postDraft, setPostDraft] = useState<PostDraft>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  // Initialize the status and error states to empty strings, which will be used to display any success or error messages related to post submission.

  // Client-side gate on the "Paid" checkbox, purely for UX -- the backend
  // re-validates this against the user's real plan on submit, so this
  // can't be the only thing standing between a free user and a paid post.
  function handlePaidToggle(nextChecked: boolean) {
    if (nextChecked && planType !== 'paid') {
      setPostDraft((prev) => ({ ...prev, payed: false }));
      setError('You must upgrade to a paid plan to submit a paid post.');
      return;
    }
    setError('');
    setPostDraft((prev) => ({ ...prev, payed: nextChecked }));
  }

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

    const token = localStorage.getItem('authToken');  // Retrieve the JWT token from local storage to include in the request headers for authentication
    if (!token) {
      setError('Your session has expired. Please log in again.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/posts', { // Send a POST request to the server to create a new post
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header to authenticate the request
        },
        body: JSON.stringify(postDraft), // Send the post draft data (type, title, description, tags, payed) as JSON in the request body
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save the post.');
      }

      setStatus(postDraft.type === 'article' ? 'Article saved successfully.' : 'Question saved successfully.');
      setPostDraft({ ...EMPTY_DRAFT, type: postDraft.type });
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
        <div>
          <label>
            <input
              type="checkbox"
              name="payed"
              checked={postDraft.payed}
              onChange={(e) => handlePaidToggle(e.target.checked)}
            />
            Paid {planType !== 'paid' && <span style={{ color: '#888' }}>(requires a paid plan)</span>}
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
              setPostDraft(EMPTY_DRAFT);
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