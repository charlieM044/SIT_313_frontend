import { useState, type SyntheticEvent } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, firebaseConfigError } from './firebase.js';

type PostType = 'article' | 'question';

type PostDraft = {
  type: PostType;
  title: string;
  description: string;
  tags: string;
};



function Post() {

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



  if (!isFirebaseConfigured || !db) {
    setError(firebaseConfigError || 'Firebase is not configured for this environment.');
    return;
  }

  if (!auth?.currentUser) {
    setError('You must be logged in to submit a post.');
    return;
  }




  if (postDraft.type == 'article') {
   
  setSubmitting(true);
  try {
    await addDoc(collection(db, 'articles'), {
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

    setStatus('Article saved successfully.');
    setPostDraft({ type: 'article', title: '', description: '', tags: '' });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unable to save the article.');
  } finally {
    setSubmitting(false);
  }
  return;
  }
  else if (postDraft.type == 'question') {
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'questions'), {
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
      setPostDraft({ type: 'question', title: '', description: '', tags: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save the question.');
    }
    finally {
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
          
            onChange={(e) => {
              const nextType = e.target.value as PostType;
              console.log('Post type changed:', nextType);
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
              console.log('Post type changed:', nextType);
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


)
    

}
export default Post;