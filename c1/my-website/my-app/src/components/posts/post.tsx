import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

function handlePostSubmit() {
  console.log('Post submitted:', postDraft);
  // Here you can add logic to send the postDraft data to your backend or API


}

return (
<section className="post-section">
  <h1 className="post-title">new post</h1>
  <form className="post-form">

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
  </form>

  <form className="post-buttons" onSubmit={(e) => e.preventDefault()}>
    <button type="submit" onClick={handlePostSubmit}>Submit</button>
    <button type="reset" onClick={() => setPostDraft({ type: 'article', title: '', description: '', tags: '' })}>Reset</button>
  </form>
</section>


)
    

}
export default Post;