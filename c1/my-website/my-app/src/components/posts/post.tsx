import { useState, type SyntheticEvent } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, firebaseConfigError } from '../../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';


type PostType = 'article' | 'question';

type PostDraft = {
  type: PostType;
  title: string;
  abstract: string;
  description: string;
  tags: string;
};



function Post() {
  const authContext = useAuth();

  const [postDraft, setPostDraft] = useState<PostDraft>({
    type: 'article',
    title: '',
    abstract: '',
    description: '',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');


  async function handlePostSubmit(e: SyntheticEvent<HTMLFormElement>) { //
    e.preventDefault();
    setStatus('');
    setError('');

    if (!postDraft.title.trim() || !postDraft.description.trim()) {
      setError('Please enter a title and description.');
      return;
    }

    if (!isFirebaseConfigured || !db) {
      setError(firebaseConfigError || 'Firebase is not configured for this environment.');
      return;
    }

    if (!auth?.currentUser) {
      setError('You must be logged in to submit a post.');
      return;
    }

    if (postDraft.type === 'article') { // Handle article submission
      setSubmitting(true);
      try {
        await addDoc(collection(db, 'articles'), {  // Add a new document to the 'articles' collection in Firestore
          type: postDraft.type,
          title: postDraft.title.trim(),
          abstract: postDraft.abstract.trim(),
          description: postDraft.description.trim(),
          tags: postDraft.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          authorId: auth?.currentUser?.uid || null,
          authorEmail: auth?.currentUser?.email || null,
          createdAt: serverTimestamp(),
        });

        setStatus('Article saved successfully.');
        setPostDraft({ type: 'article', title: '', abstract: '', description: '', tags: '' }); // Reset the postDraft state after successful submission
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to save the article.');
      } finally {
        setSubmitting(false);
      }
      return;
    } else if (postDraft.type === 'question') {  // Handle question submission
      setSubmitting(true);
      try {
        await addDoc(collection(db, 'questions'), { /// Add a new document to the 'questions' collection in Firestore
          type: postDraft.type,
          title: postDraft.title.trim(),
          description: postDraft.description.trim(),
          tags: postDraft.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          authorId: auth?.currentUser?.uid || null,
          authorEmail: auth?.currentUser?.email || null,
          createdAt: serverTimestamp(),
        });
        setStatus('Question saved successfully.');
        setPostDraft({ type: 'question', title: '', abstract: '', description: '', tags: '' });  // Reset the postDraft state after successful submission
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to save the question.');
      } finally {
        setSubmitting(false);
      }
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
              checked={postDraft.type === 'article'} // Check if the current type is 'article'
              onChange={(e) => {                    // Update the postDraft state when the type changes
                const nextType = e.target.value as PostType;  //
                setPostDraft({ ...postDraft, type: nextType }); // Spread the existing postDraft and update the type
              }}
            />
            Article
          </label>
      
          <label>  
            <input
              type="radio" // Radio button for selecting 'question' type
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

        {postDraft.type === 'article' && ( // Only show abstract field for articles
          <>
            <label htmlFor="abstract">Abstract:</label>  
            <textarea
              id="abstract"
              value={postDraft.abstract}
              onChange={(e) => setPostDraft({ ...postDraft, abstract: e.target.value })}
            />
          </>
        )}

        <label htmlFor="description"> 
          {postDraft.type === 'article' ? 'Article Text:' : 'Describe your problem:'/* Conditional rendering of label text based on post type*/}  
        </label>
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
        {error && <p className="form-status form-status--error">{error}</p>/* Display error message if there is an error */} 
        {status && <p className="form-status">{status}</p>}
        <div className="post-buttons">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit'}
          </button>

          <button
            type="button"
            onClick={() => {
              setPostDraft({ type: postDraft.type, title: '', abstract: '', description: '', tags: '' });
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