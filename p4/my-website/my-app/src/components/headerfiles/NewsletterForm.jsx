import { useState } from 'react';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 201 || response.status === 200) {
        setStatus({ type: 'success', message: data.message });
        setEmail(''); // clear the input via state, not the DOM
      } else if (response.status === 400) {
        setStatus({ type: 'error', message: 'Error: ' + data.message });
      } else {
        setStatus({ type: 'error', message: 'Server error: ' + data.message });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'Failed to sign up. Check console for details.' });
    }
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <p>Sign up for my newsletter</p>
      <input
        type="email"
        placeholder="Enter your email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Sign Up</button>
      {status.type !== 'idle' && (
        <span className={`form-status form-status--${status.type}`} role="status">
          {status.message}
        </span>
      )}
    </form>
  );
}

export default NewsletterForm;
