import { useState} from 'react';
import { useNavigate } from 'react-router-dom';



type PaymentType = 'paid' | 'free';

type PostDraft = {
  type: PaymentType;
  title: string;
  description: string;
  tags: string;
};



function Post() {

const [postDraft, setPostDraft] = useState<PostDraft>({
  type: 'paid',
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
            value="paid"
            checked={postDraft.type === 'paid'}
            onChange={(e) => {
              const nextType = e.target.value as PaymentType;
              console.log('Post type changed:', nextType);
              setPostDraft({ ...postDraft, type: nextType });
            }}
          />
          Paid
        </label>

        <label>
          <input
            type="radio"
            name="type"
            value="free"
            checked={postDraft.type === 'free'}
            onChange={(e) => {
              const nextType = e.target.value as PaymentType;
              console.log('Post type changed:', nextType);
              setPostDraft({ ...postDraft, type: nextType });
            }}
          />
          Free
        </label>
      </div>

    <label htmlFor="title">Title:</label>


    <label htmlFor="description">Description:</label>
    
    

    <label htmlFor="tags">Tags:</label>

  </form>

  <form className="post-buttons" onSubmit={(e) => e.preventDefault()}>
    <button type="submit" onClick={handlePostSubmit}>Submit</button>
    <button type="reset" onClick={() => setPostDraft({ type: 'free', title: '', description: '', tags: '' })}>Reset</button>
  </form>
</section>


)
    

}
export default Post;