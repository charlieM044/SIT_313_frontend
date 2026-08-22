import { useState } from 'react';
import { createPortal } from 'react-dom';

import { useNavigate } from 'react-router-dom';

function Login({ onClose, isLoggedIn, setIsLoggedIn }) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => setShowLogin((prev) => !prev);

  const handleClose = () => {
    setShowLogin(false);
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      const result = await response.json();
      localStorage.setItem('authToken', result.token);
      setIsLoggedIn(true);
      setShowLogin(false);
      navigate('/');
    } catch (err) {
      // Firebase gives specific error codes (auth/invalid-credential, auth/too-many-requests, etc.)
      setError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <button onClick={async () => {
          await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' });
          localStorage.removeItem('authToken');
          setIsLoggedIn(false);
        }}>Logout</button>
      ) : (
        <button onClick={handleLoginClick}>Login</button>
      )}
      {showLogin &&
        createPortal(
          <div className="login-overlay">
            <div className="login-box">
              {showLogin && (
                <button
                  onClick={() => {
                    navigate('/signup');
                    handleClose();
                  }}
                >
                  Sign Up
                </button>
              )}

              <h2>Login</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="username"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                {error && <p className="login-error">{error}</p>}
                <button type="button" onClick={handleClose}>Close</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
    </>
  );
}

export default Login;